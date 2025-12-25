#!/usr/bin/env python3
"""
Validate markdown blog post before publishing.
Checks frontmatter, date format, excerpt length, and content.
"""

import sys
import re
import json
from pathlib import Path
from datetime import datetime


def validate_frontmatter(content):
    """Extract and validate YAML frontmatter."""
    errors = []
    warnings = []

    # Extract frontmatter
    match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
    if not match:
        errors.append("No YAML frontmatter found. Must start with --- and end with ---")
        return None, errors, warnings

    frontmatter_text = match.group(1)
    frontmatter = {}

    # Parse YAML manually (simple key: value format)
    for line in frontmatter_text.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            # Handle arrays (tags)
            if key == 'tags' and value.startswith('['):
                # Parse JSON array
                try:
                    frontmatter[key] = json.loads(value.replace("'", '"'))
                except:
                    # Try simple comma-separated
                    frontmatter[key] = [t.strip() for t in value.strip('[]').split(',')]
            else:
                frontmatter[key] = value

    # Check required fields
    required_fields = ['title', 'author', 'date', 'excerpt', 'tags']
    for field in required_fields:
        if field not in frontmatter:
            errors.append(f"Missing required frontmatter field: {field}")

    # Validate date format (ISO 8601 UTC: YYYY-MM-DDTHH:mm:ssZ)
    if 'date' in frontmatter:
        date_pattern = r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$'
        if not re.match(date_pattern, frontmatter['date']):
            errors.append(f"Date format must be ISO 8601 UTC (YYYY-MM-DDTHH:mm:ssZ), got: {frontmatter['date']}")
        else:
            # Validate date is parseable
            try:
                datetime.strptime(frontmatter['date'], '%Y-%m-%dT%H:%M:%SZ')
            except ValueError as e:
                errors.append(f"Invalid date value: {e}")

    # Validate excerpt length (50-300 characters)
    if 'excerpt' in frontmatter:
        excerpt_len = len(frontmatter['excerpt'])
        if excerpt_len < 50:
            warnings.append(f"Excerpt is short ({excerpt_len} chars). Recommended: 50-300 chars for better SEO.")
        elif excerpt_len > 300:
            warnings.append(f"Excerpt is long ({excerpt_len} chars). Recommended: 50-300 chars for better previews.")

    # Validate tags
    if 'tags' in frontmatter:
        if not isinstance(frontmatter['tags'], list):
            errors.append("Tags must be an array")
        elif len(frontmatter['tags']) == 0:
            warnings.append("No tags specified. Tags help with discoverability.")
        elif len(frontmatter['tags']) > 8:
            warnings.append(f"Many tags ({len(frontmatter['tags'])}). Consider 3-6 focused tags.")

    # Validate slug if present
    if 'slug' in frontmatter:
        slug = frontmatter['slug']
        if not re.match(r'^[a-z0-9-]+$', slug):
            errors.append(f"Slug must contain only lowercase letters, numbers, and hyphens: {slug}")

    # Validate readTime if present
    if 'readTime' in frontmatter:
        if not re.match(r'^\d+\s*min\s*read$', frontmatter['readTime']):
            warnings.append(f"readTime format should be like '12 min read', got: {frontmatter['readTime']}")

    return frontmatter, errors, warnings


def validate_content(content, frontmatter):
    """Validate markdown content."""
    errors = []
    warnings = []

    # Remove frontmatter to get just content
    content_without_frontmatter = re.sub(r'^---\n.*?\n---\n', '', content, count=1, flags=re.DOTALL)

    # Check content exists
    if not content_without_frontmatter.strip():
        errors.append("No content found after frontmatter")
        return errors, warnings

    # Check for title in content (should match frontmatter)
    if frontmatter and 'title' in frontmatter:
        title = frontmatter['title']
        # Look for title as h1
        if f"# {title}" not in content_without_frontmatter:
            warnings.append(f"Title '{title}' not found as H1 (# {title}) in content")

    # Check for at least one heading
    if not re.search(r'^#{1,6}\s+.+$', content_without_frontmatter, re.MULTILINE):
        warnings.append("No headings found in content. Consider adding section headers for better structure.")

    # Check content length
    word_count = len(content_without_frontmatter.split())
    if word_count < 100:
        warnings.append(f"Content is short ({word_count} words). Consider adding more detail.")

    # Check for code blocks (common in technical blogs)
    code_blocks = len(re.findall(r'```', content_without_frontmatter))
    if code_blocks % 2 != 0:
        errors.append("Unclosed code block found (odd number of ``` markers)")

    return errors, warnings


def validate_uniqueness(frontmatter, blog_posts_json_path):
    """Check if slug/id is unique."""
    errors = []
    warnings = []

    if not frontmatter or 'slug' not in frontmatter:
        return errors, warnings

    slug = frontmatter['slug']

    if not blog_posts_json_path.exists():
        warnings.append(f"blog-posts.json not found at {blog_posts_json_path}")
        return errors, warnings

    try:
        with open(blog_posts_json_path, 'r') as f:
            blog_data = json.load(f)

        existing_ids = [post.get('id') for post in blog_data.get('posts', [])]
        if slug in existing_ids:
            errors.append(f"Slug '{slug}' already exists in blog-posts.json. Choose a unique slug.")
    except Exception as e:
        warnings.append(f"Could not validate uniqueness: {e}")

    return errors, warnings


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_post.py <markdown-file>")
        sys.exit(1)

    markdown_file = Path(sys.argv[1])

    if not markdown_file.exists():
        print(f"Error: File not found: {markdown_file}")
        sys.exit(1)

    # Read content
    content = markdown_file.read_text(encoding='utf-8')

    all_errors = []
    all_warnings = []

    # Validate frontmatter
    frontmatter, fm_errors, fm_warnings = validate_frontmatter(content)
    all_errors.extend(fm_errors)
    all_warnings.extend(fm_warnings)

    # Validate content
    if frontmatter:
        content_errors, content_warnings = validate_content(content, frontmatter)
        all_errors.extend(content_errors)
        all_warnings.extend(content_warnings)

        # Validate uniqueness
        blog_json_path = markdown_file.parent.parent / 'blog' / 'blog-posts.json'
        unique_errors, unique_warnings = validate_uniqueness(frontmatter, blog_json_path)
        all_errors.extend(unique_errors)
        all_warnings.extend(unique_warnings)

    # Report results
    print(f"\nValidation results for: {markdown_file.name}")
    print("=" * 60)

    if all_errors:
        print(f"\n❌ ERRORS ({len(all_errors)}):")
        for i, error in enumerate(all_errors, 1):
            print(f"  {i}. {error}")

    if all_warnings:
        print(f"\n⚠️  WARNINGS ({len(all_warnings)}):")
        for i, warning in enumerate(all_warnings, 1):
            print(f"  {i}. {warning}")

    if not all_errors and not all_warnings:
        print("\n✅ All validations passed!")

    if frontmatter:
        print(f"\n📊 Post Info:")
        print(f"  Title: {frontmatter.get('title', 'N/A')}")
        print(f"  Date: {frontmatter.get('date', 'N/A')}")
        print(f"  Slug: {frontmatter.get('slug', 'N/A')}")
        print(f"  Tags: {', '.join(frontmatter.get('tags', []))}")

    print()

    # Exit with error code if there are errors
    if all_errors:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == '__main__':
    main()
