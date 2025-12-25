#!/usr/bin/env python3
"""
Convert markdown blog post to HTML with full SEO metadata.
Uses the blog post template and replaces placeholders with actual content.
"""

import sys
import re
import json
from pathlib import Path
from datetime import datetime


def extract_frontmatter(content):
    """Extract YAML frontmatter from markdown."""
    match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
    if not match:
        return None, content

    frontmatter_text = match.group(1)
    frontmatter = {}

    # Parse YAML manually
    for line in frontmatter_text.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            if key == 'tags' and '[' in value:
                try:
                    frontmatter[key] = json.loads(value.replace("'", '"'))
                except:
                    frontmatter[key] = [t.strip() for t in value.strip('[]').split(',')]
            else:
                frontmatter[key] = value

    # Remove frontmatter from content
    content_without_frontmatter = re.sub(r'^---\n.*?\n---\n', '', content, count=1, flags=re.DOTALL)

    return frontmatter, content_without_frontmatter


def simple_markdown_to_html(markdown):
    """
    Convert markdown to HTML.
    This is a simplified converter for common blog post elements.
    """
    html = markdown

    # Code blocks with language
    def code_block_replacer(match):
        lang = match.group(1) or ''
        code = match.group(2)
        # Escape HTML in code
        code = code.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        return f'<pre><code class="language-{lang}">{code}</code></pre>'

    html = re.sub(r'```(\w+)?\n(.*?)\n```', code_block_replacer, html, flags=re.DOTALL)

    # Inline code
    html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)

    # Headers
    html = re.sub(r'^######\s+(.+)$', r'<h6>\1</h6>', html, flags=re.MULTILINE)
    html = re.sub(r'^#####\s+(.+)$', r'<h5>\1</h5>', html, flags=re.MULTILINE)
    html = re.sub(r'^####\s+(.+)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    html = re.sub(r'^###\s+(.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^##\s+(.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^#\s+(.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)

    # Bold and italic
    html = re.sub(r'\*\*\*(.+?)\*\*\*', r'<strong><em>\1</em></strong>', html)
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)
    html = re.sub(r'___(.+?)___', r'<strong><em>\1</em></strong>', html)
    html = re.sub(r'__(.+?)__', r'<strong>\1</strong>', html)
    html = re.sub(r'_(.+?)_', r'<em>\1</em>', html)

    # Links
    html = re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', r'<a href="\2">\1</a>', html)

    # Images
    html = re.sub(r'!\[([^\]]*)\]\(([^\)]+)\)', r'<img src="\2" alt="\1">', html)

    # Unordered lists
    html = re.sub(r'^\*\s+(.+)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'^-\s+(.+)$', r'<li>\1</li>', html, flags=re.MULTILINE)

    # Ordered lists
    html = re.sub(r'^\d+\.\s+(.+)$', r'<li>\1</li>', html, flags=re.MULTILINE)

    # Wrap consecutive <li> in <ul> or <ol>
    # This is simplified - a real implementation would be more sophisticated
    lines = html.split('\n')
    result = []
    in_list = False
    for line in lines:
        if '<li>' in line:
            if not in_list:
                result.append('<ul>')
                in_list = True
            result.append(line)
        else:
            if in_list:
                result.append('</ul>')
                in_list = False
            result.append(line)
    if in_list:
        result.append('</ul>')

    html = '\n'.join(result)

    # Blockquotes
    html = re.sub(r'^&gt;\s+(.+)$', r'<blockquote>\1</blockquote>', html, flags=re.MULTILINE)
    html = re.sub(r'^>\s+(.+)$', r'<blockquote>\1</blockquote>', html, flags=re.MULTILINE)

    # Horizontal rules
    html = re.sub(r'^---$', r'<hr>', html, flags=re.MULTILINE)
    html = re.sub(r'^\*\*\*$', r'<hr>', html, flags=re.MULTILINE)

    # Paragraphs - wrap text that's not already in tags
    lines = html.split('\n')
    result = []
    for line in lines:
        line = line.strip()
        if line and not line.startswith('<') and not line.endswith('>'):
            result.append(f'<p>{line}</p>')
        else:
            result.append(line)

    html = '\n'.join(result)

    return html


def load_cdn_versions(config_path):
    """Load CDN versions from config file."""
    if not config_path.exists():
        # Defaults
        return {
            "mermaid": "11.4.0",
            "highlight": "11.8.0"
        }

    with open(config_path, 'r') as f:
        return json.load(f)


def create_html(frontmatter, content_html, template_path, cdn_versions):
    """Create full HTML from template."""
    if not template_path.exists():
        raise FileNotFoundError(f"Template not found: {template_path}")

    template = template_path.read_text(encoding='utf-8')

    # Extract date parts for display
    date_obj = datetime.strptime(frontmatter['date'], '%Y-%m-%dT%H:%M:%SZ')
    date_display = date_obj.strftime('%B %d, %Y')

    # Create tags HTML
    tags_html = ' '.join([f'<span class="tag">{tag}</span>' for tag in frontmatter.get('tags', [])])

    # Replace placeholders
    replacements = {
        '{{TITLE}}': frontmatter.get('title', 'Untitled'),
        '{{DESCRIPTION}}': frontmatter.get('excerpt', ''),
        '{{AUTHOR}}': frontmatter.get('author', 'Sumedh Sankhe'),
        '{{DATE}}': frontmatter.get('date', ''),
        '{{DATE_DISPLAY}}': date_display,
        '{{SLUG}}': frontmatter.get('slug', ''),
        '{{READ_TIME}}': frontmatter.get('readTime', ''),
        '{{TAGS}}': tags_html,
        '{{CONTENT}}': content_html,
        '{{MERMAID_VERSION}}': cdn_versions.get('mermaid', '11.4.0'),
        '{{HIGHLIGHT_VERSION}}': cdn_versions.get('highlight', '11.8.0'),
    }

    html = template
    for placeholder, value in replacements.items():
        html = html.replace(placeholder, str(value))

    return html


def main():
    if len(sys.argv) < 3:
        print("Usage: python convert_markdown.py <input.md> <output.html>")
        sys.exit(1)

    input_file = Path(sys.argv[1])
    output_file = Path(sys.argv[2])

    if not input_file.exists():
        print(f"Error: Input file not found: {input_file}")
        sys.exit(1)

    # Read markdown
    markdown_content = input_file.read_text(encoding='utf-8')

    # Extract frontmatter
    frontmatter, content = extract_frontmatter(markdown_content)
    if not frontmatter:
        print("Error: No frontmatter found in markdown file")
        sys.exit(1)

    # Convert content to HTML
    content_html = simple_markdown_to_html(content)

    # Load CDN versions
    config_path = input_file.parent.parent / 'config' / 'cdn_versions.json'
    cdn_versions = load_cdn_versions(config_path)

    # Load template
    template_path = input_file.parent / 'blog' / 'posts' / 'docker-optimization-part2.html'
    if not template_path.exists():
        # Try docker-optimization.html as fallback
        template_path = input_file.parent / 'blog' / 'posts' / 'docker-optimization.html'

    # Create HTML
    html = create_html(frontmatter, content_html, template_path, cdn_versions)

    # Write output
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(html, encoding='utf-8')

    print(f"✅ Converted {input_file.name} to {output_file.name}")
    print(f"   Title: {frontmatter.get('title')}")
    print(f"   Date: {frontmatter.get('date')}")


if __name__ == '__main__':
    main()
