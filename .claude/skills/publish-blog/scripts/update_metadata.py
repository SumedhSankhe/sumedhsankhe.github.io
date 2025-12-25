#!/usr/bin/env python3
"""
Update blog metadata files: blog-posts.json and feed.xml.
Adds new post entry to both files.
"""

import sys
import json
import re
from pathlib import Path
from datetime import datetime
import xml.etree.ElementTree as ET


def extract_frontmatter(markdown_file):
    """Extract frontmatter from markdown file."""
    content = markdown_file.read_text(encoding='utf-8')
    match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
    if not match:
        return None

    frontmatter_text = match.group(1)
    frontmatter = {}

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

    return frontmatter


def update_blog_posts_json(blog_posts_file, frontmatter, html_filename):
    """Add new post entry to blog-posts.json."""
    # Read existing data
    with open(blog_posts_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Extract date for JSON (YYYY-MM-DD format)
    date_obj = datetime.strptime(frontmatter['date'], '%Y-%m-%dT%H:%M:%SZ')
    date_short = date_obj.strftime('%Y-%m-%d')

    # Create new post entry
    new_post = {
        "id": frontmatter.get('slug', ''),
        "title": frontmatter.get('title', ''),
        "date": date_short,
        "readTime": frontmatter.get('readTime', ''),
        "excerpt": frontmatter.get('excerpt', ''),
        "tags": frontmatter.get('tags', []),
        "file": html_filename
    }

    # Check if post already exists
    existing_ids = [post['id'] for post in data['posts']]
    if new_post['id'] in existing_ids:
        print(f"⚠️  Post with id '{new_post['id']}' already exists. Updating...")
        # Update existing post
        for i, post in enumerate(data['posts']):
            if post['id'] == new_post['id']:
                data['posts'][i] = new_post
                break
    else:
        # Add new post at the beginning (most recent first)
        data['posts'].insert(0, new_post)
        print(f"✅ Added new post '{new_post['id']}' to blog-posts.json")

    # Write back
    with open(blog_posts_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')  # Trailing newline

    return new_post


def update_feed_xml(feed_file, frontmatter, html_filename, html_file_path):
    """Add new post entry to RSS feed."""
    # Read HTML content for RSS
    html_content = html_file_path.read_text(encoding='utf-8')

    # Extract main content (between <main> tags)
    main_match = re.search(r'<main[^>]*>(.*?)</main>', html_content, re.DOTALL)
    if main_match:
        content_html = main_match.group(1).strip()
    else:
        content_html = "Content not available"

    # Parse existing feed
    tree = ET.parse(feed_file)
    root = tree.getroot()
    channel = root.find('channel')

    # Update lastBuildDate
    date_obj = datetime.strptime(frontmatter['date'], '%Y-%m-%dT%H:%M:%SZ')
    rfc822_date = date_obj.strftime('%a, %d %b %Y %H:%M:%S +0000')

    last_build_date = channel.find('lastBuildDate')
    if last_build_date is not None:
        last_build_date.text = rfc822_date

    # Check if item already exists
    post_url = f"https://sumedhsankhe.github.io/blog/posts/{html_filename}"
    existing_item = None
    for item in channel.findall('item'):
        link = item.find('link')
        if link is not None and link.text == post_url:
            existing_item = item
            break

    if existing_item is not None:
        print(f"⚠️  Post already exists in feed.xml. Updating...")
        channel.remove(existing_item)

    # Create new item
    new_item = ET.Element('item')

    title = ET.SubElement(new_item, 'title')
    title.text = frontmatter.get('title', '')

    link = ET.SubElement(new_item, 'link')
    link.text = post_url

    guid = ET.SubElement(new_item, 'guid')
    guid.set('isPermaLink', 'true')
    guid.text = post_url

    description = ET.SubElement(new_item, 'description')
    description.text = frontmatter.get('excerpt', '')

    pub_date = ET.SubElement(new_item, 'pubDate')
    pub_date.text = rfc822_date

    author = ET.SubElement(new_item, 'author')
    author.text = f"noreply@sumedhsankhe.github.io ({frontmatter.get('author', 'Sumedh Sankhe')})"

    # Add categories (tags)
    for tag in frontmatter.get('tags', []):
        category = ET.SubElement(new_item, 'category')
        category.text = tag

    # Add content in CDATA
    content_encoded = ET.SubElement(new_item, '{http://purl.org/rss/1.0/modules/content/}encoded')
    content_encoded.text = f"<![CDATA[{content_html}]]>"

    # Insert at beginning of channel (after metadata elements)
    # Find the position after lastBuildDate
    insert_position = 0
    for i, child in enumerate(channel):
        if child.tag == 'lastBuildDate':
            insert_position = i + 1
            break

    channel.insert(insert_position, new_item)

    print(f"✅ Added new item to feed.xml")

    # Write back with proper formatting
    # Register namespace to avoid ns0 prefixes
    ET.register_namespace('content', 'http://purl.org/rss/1.0/modules/content/')
    ET.register_namespace('atom', 'http://www.w3.org/2005/Atom')

    tree.write(feed_file, encoding='utf-8', xml_declaration=True)

    # Fix CDATA (ElementTree doesn't handle it well)
    feed_content = feed_file.read_text(encoding='utf-8')
    feed_content = feed_content.replace('&lt;![CDATA[', '<![CDATA[')
    feed_content = feed_content.replace(']]&gt;', ']]>')
    feed_file.write_text(feed_content, encoding='utf-8')


def main():
    if len(sys.argv) < 3:
        print("Usage: python update_metadata.py <markdown-file> <html-file>")
        sys.exit(1)

    markdown_file = Path(sys.argv[1])
    html_file = Path(sys.argv[2])

    if not markdown_file.exists():
        print(f"Error: Markdown file not found: {markdown_file}")
        sys.exit(1)

    if not html_file.exists():
        print(f"Error: HTML file not found: {html_file}")
        sys.exit(1)

    # Extract frontmatter
    frontmatter = extract_frontmatter(markdown_file)
    if not frontmatter:
        print("Error: No frontmatter found in markdown file")
        sys.exit(1)

    # Find metadata files
    blog_posts_file = markdown_file.parent.parent / 'blog' / 'blog-posts.json'
    feed_file = markdown_file.parent.parent / 'blog' / 'feed.xml'

    if not blog_posts_file.exists():
        print(f"Error: blog-posts.json not found at {blog_posts_file}")
        sys.exit(1)

    if not feed_file.exists():
        print(f"Error: feed.xml not found at {feed_file}")
        sys.exit(1)

    # Get HTML filename
    html_filename = html_file.name

    # Update blog-posts.json
    post_data = update_blog_posts_json(blog_posts_file, frontmatter, html_filename)

    # Update feed.xml
    update_feed_xml(feed_file, frontmatter, html_filename, html_file)

    print(f"\n✅ Metadata updated successfully")
    print(f"   Post: {post_data['title']}")
    print(f"   Date: {post_data['date']}")
    print(f"   File: {html_filename}")


if __name__ == '__main__':
    main()
