---
name: publish-blog
description: |
  Publish blog posts to GitHub Pages portfolio site. Converts markdown to HTML
  with metadata, updates blog-posts.json, RSS feed, adds cross-links, and
  handles git operations. Use when publishing new blog content or updating
  existing posts.
allowed-tools: Read, Edit, Glob, Grep, Bash, Write
---

# Publish Blog Post Skill

Automates the complete blog publishing workflow for the sumedhsankhe.github.io portfolio site.

## What This Skill Does

This skill handles the entire blog publishing process:

1. **Validates markdown posts** - Checks frontmatter, date format, required fields
2. **Converts markdown to HTML** - Creates semantic HTML with proper structure
3. **Updates blog-posts.json** - Maintains central registry with metadata
4. **Updates RSS feed (feed.xml)** - Adds new posts to RSS 2.0 feed
5. **Adds cross-links** - Links related posts in the series
6. **Creates git branch** - Feature branch with meaningful commits
7. **Pushes changes** - Ready for PR review

## Quick Start

### Publish from drafts directory:

```
I have a new blog post in _drafts/my-post.md, please publish it
```

### Publish specific file:

```
Publish the blog post at _drafts/docker-part-3.md
```

## File Locations

Your portfolio blog structure:

```
sumedhsankhe.github.io/
├── _drafts/                          # Write your posts here (markdown)
│   └── my-new-post.md
├── blog/
│   └── posts/                        # Published HTML files
│       ├── docker-optimization.html
│       ├── docker-optimization-part2.html
│       └── my-new-post.html
├── blog/
│   ├── blog-posts.json               # Central metadata registry
│   └── feed.xml                      # RSS 2.0 feed
└── config/
    └── cdn_versions.json             # Pinned CDN dependency versions
```

## Markdown Post Format

Create posts in `_drafts/` with this frontmatter structure:

```markdown
---
title: "Your Blog Post Title"
author: "Sumedh R. Sankhe"
date: 2025-12-26T10:00:00Z
excerpt: "A compelling 1-2 sentence summary under 160 characters for SEO. This appears in previews and search results."
tags:
  - Docker
  - DevOps
  - Performance
---

# Your Blog Post Title

## Introduction

Start with a compelling hook...

## Main Content

### Section 1

Content here...

## Code Examples

```python
def example():
    return "Hello, World!"
```

## Conclusion

Wrap up with key takeaways...
```

### Important Frontmatter Rules:

- **date**: MUST use ISO 8601 UTC format: `2025-12-26T10:00:00Z`
  - Include the `T` separator between date and time
  - Include the `Z` to indicate UTC timezone
  - This prevents timezone display bugs!
- **title**: Will be used for HTML title tag and h1
- **author**: Currently "Sumedh R. Sankhe" (must match)
- **excerpt**: 50-300 characters, used for meta description and previews
- **tags**: 2-5 tags, alphanumeric with spaces allowed

## Step-by-Step Publishing Process

When you invoke this skill, follow these steps precisely:

### Step 1: Validate the Markdown Post

Before doing anything, validate the post:

```bash
python3 .claude/skills/publish-blog/scripts/validate_post.py _drafts/[filename].md
```

Check for:
- ✓ All required frontmatter fields present (title, author, date, excerpt, tags)
- ✓ Date in ISO 8601 UTC format (YYYY-MM-DDTHH:mm:ssZ)
- ✓ Excerpt length between 50-300 characters
- ✓ Tags are valid (2-5 tags, reasonable format)
- ✓ Content is not empty
- ✓ No malformed markdown

If validation fails, STOP and report errors to the user.

### Step 2: Read the Existing Blog Post Template

Read one of the existing blog posts to understand the HTML structure:

```bash
Read file: blog/posts/docker-optimization-part2.html
```

Extract and note:
- HTML document structure (head, body, navigation)
- Meta tags format (Open Graph, Twitter cards)
- CSS classes used (blog-post, blog-post-header, blog-post-content, etc.)
- Navigation structure
- Footer format
- CDN references and versions

### Step 3: Convert Markdown to HTML

Read the markdown post and convert it to HTML following the template structure:

1. **Parse frontmatter** - Extract title, author, date, excerpt, tags
2. **Convert markdown body** - Convert to semantic HTML:
   - Headings: `##` → `<h2 id="slug">`, `###` → `<h3 id="slug">`
   - Code blocks: ` ```language ` → `<pre><code class="language-X">`
   - Tables: markdown tables → `<table class="blog-table">`
   - Lists: `- item` → `<ul><li>`, `1. item` → `<ol><li>`
   - Links: `[text](url)` → `<a href="url">text</a>`
   - Emphasis: `**bold**` → `<strong>`, `*italic*` → `<em>`
   - Inline code: `` `code` `` → `<code>code</code>`

3. **Create complete HTML file** with:
   - DOCTYPE and html lang="en"
   - Head section with:
     - Meta charset, viewport
     - Title: "{title} | Sumedh R. Sankhe"
     - Meta description (use excerpt)
     - Meta author
     - Meta keywords (from tags)
     - Canonical URL
     - Open Graph tags (og:type=article, og:title, og:description, og:image, og:url)
     - Twitter card tags (twitter:card, twitter:title, twitter:description)
     - Article meta (article:published_time, article:author, article:tag for each tag)
     - Google Analytics (consent-based, matching existing posts)
     - Stylesheet link: `../../styles.css`
     - Mermaid.js (if needed): Use pinned version from config/cdn_versions.json
     - Theme detection script (copy from existing posts)
   - Body section with:
     - Skip to main content link
     - Navigation (matching existing posts exactly)
     - Main content wrapper
     - Article with class="blog-post"
     - Header with metadata (date, read time, title, subtitle, tags)
     - Content div with converted markdown
     - Footer with "Back to Blog" link
     - Site footer
     - Cookie consent banner (copy from existing posts)
     - Scripts (theme toggle, menu toggle, cookie consent)

4. **Generate slug** from title: lowercase, replace spaces with hyphens, remove special chars
5. **Calculate reading time** based on word count (~200 words per minute)
6. **Format date for display**: Convert ISO 8601 to "December 26, 2025" format

**Output**: Save as `blog/posts/{slug}.html`

### Step 4: Update blog-posts.json

Read the existing `blog/blog-posts.json` and add the new post:

```json
{
  "posts": [
    {
      "id": "new-post-slug",
      "title": "Post Title",
      "date": "2025-12-26T10:00:00Z",
      "readTime": "12 min read",
      "excerpt": "Post excerpt...",
      "tags": ["Tag1", "Tag2", "Tag3"],
      "file": "new-post-slug.html"
    },
    // ... existing posts
  ]
}
```

**Important rules:**
- Date must remain in ISO 8601 UTC format (with T and Z)
- Insert new post at the TOP of the array (newest first)
- Ensure valid JSON (check for trailing commas)
- Validate JSON syntax before saving

### Step 5: Update RSS Feed (feed.xml)

Read the existing `blog/feed.xml` and add the new post as an `<item>`:

```xml
<item>
  <title>Post Title</title>
  <link>https://sumedhsankhe.github.io/blog/posts/new-post-slug.html</link>
  <guid>https://sumedhsankhe.github.io/blog/posts/new-post-slug.html</guid>
  <pubDate>Thu, 26 Dec 2025 10:00:00 GMT</pubDate>
  <description><![CDATA[Post excerpt...]]></description>
  <category>Tag1</category>
  <category>Tag2</category>
  <category>Tag3</category>
</item>
```

**Important rules:**
- pubDate must be in RFC 822 format: `Day, DD Mon YYYY HH:MM:SS GMT`
- Convert ISO 8601 date to RFC 822 (both are UTC)
- Wrap description in CDATA to avoid XML escaping issues
- Add each tag as a separate `<category>` element
- Insert new item at the TOP (after opening `<channel>` tag, before first existing `<item>`)
- Update `<lastBuildDate>` in channel to current date (RFC 822 format)
- Validate XML syntax before saving

**Date conversion example:**
- ISO 8601: `2025-12-26T10:00:00Z`
- RFC 822: `Thu, 26 Dec 2025 10:00:00 GMT`

### Step 6: Add Cross-Links (If Part of Series)

If the post is part of a series (e.g., "Docker Optimization Part 3"):

1. **Identify related posts** by checking:
   - Similar title patterns (Part 1, Part 2, etc.)
   - Common tags
   - Mentioned in post content

2. **Add series navigation to new post**:
   - Before the footer, add a section:
   ```html
   <div class="blog-note">
     <h3>Posts in This Series</h3>
     <ul>
       <li><a href="docker-optimization.html">Part 1: Multistage Builds & Layer Caching</a></li>
       <li><a href="docker-optimization-part2.html">Part 2: Intelligent Caching Strategies</a></li>
       <li><strong>Part 3: Advanced Patterns</strong> (current)</li>
     </ul>
   </div>
   ```

3. **Update previous posts** to link to new post:
   - Add link to Part 3 in their series navigation sections

### Step 7: Create Git Branch and Commit

```bash
# Create feature branch
git checkout main
git pull origin main
git checkout -b blog/[slug]

# Stage all changes
git add blog/posts/[slug].html
git add blog/blog-posts.json
git add blog/feed.xml
# Add any cross-linked posts if updated
git add blog/posts/[related-post].html

# Create commit
git commit -m "docs: publish [Title]

- Add new blog post covering [brief summary]
- Update blog-posts.json with post metadata
- Update RSS feed with new post
- Add cross-links to related posts (if applicable)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push branch
git push -u origin blog/[slug]
```

### Step 8: Report Success

Provide a summary to the user:

```
✅ Blog post published successfully!

📝 Files created/modified:
  - blog/posts/[slug].html (new - [word count] words, [reading time])
  - blog/blog-posts.json (updated)
  - blog/feed.xml (updated)
  - [any cross-linked posts]

🌳 Git branch: blog/[slug]
📋 Create PR: https://github.com/SumedhSankhe/sumedhsankhe.github.io/pull/new/blog/[slug]

📊 Post details:
  - Title: [title]
  - Date: [formatted date]
  - Tags: [tag1, tag2, tag3]
  - Reading time: [X] min

Next steps:
1. Review the generated HTML at blog/posts/[slug].html
2. Check the git diff to verify changes
3. Create and merge the PR on GitHub
4. Your post will be live at: https://sumedhsankhe.github.io/blog/posts/[slug].html

🎉 Happy blogging!
```

## Date Handling - CRITICAL

### The Timezone Bug We Fixed

When JavaScript parses `"2025-12-24"` without time info:
- It treats it as UTC midnight: `2025-12-24T00:00:00Z`
- In PST/PDT (UTC-8), this becomes `2025-12-23T16:00:00` (December 23!)
- The blog page displays "December 23" instead of "December 24"

### The Solution

**In storage (blog-posts.json, feed.xml):**
- ALWAYS use full ISO 8601 UTC format: `2025-12-26T10:00:00Z`
- Include the `T` separator and `Z` timezone indicator

**In JavaScript (script.js - already fixed):**
```javascript
// Parse date components manually to avoid UTC conversion
const [year, month, day] = post.date.split('T')[0].split('-');
const date = new Date(year, month - 1, day);
```

This ensures dates display correctly regardless of user timezone.

## Security: CDN Version Pinning

**NEVER use unpinned CDN versions!**

Bad:
```html
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs"></script>
```

Good:
```html
<script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.0/dist/mermaid.esm.min.mjs"></script>
```

**Process:**
1. Check `config/cdn_versions.json` for approved versions
2. Use EXACT version numbers from config
3. Never use `@latest`, `@10`, or unpinned versions

## Validation & Error Handling

### Before Publishing

Always run validation:
```bash
python3 .claude/skills/publish-blog/scripts/validate_post.py _drafts/[file].md
```

Common errors and fixes:

**"Invalid date format"**
- Fix: Use ISO 8601 UTC: `2025-12-26T10:00:00Z`
- Include `T` between date and time
- Include `Z` for UTC timezone

**"Excerpt too short/long"**
- Fix: Must be 50-300 characters
- Aim for 150-160 for best SEO

**"Slug already exists"**
- Fix: Change title or add date to make unique
- Check existing files in `blog/posts/`

**"Invalid tags"**
- Fix: Use 2-5 tags, alphanumeric with spaces
- Example: `["Docker", "DevOps", "R Shiny"]`

### After Publishing

Validate outputs:
```bash
# Validate JSON
python3 -m json.tool blog/blog-posts.json

# Validate XML
xmllint --noout blog/feed.xml

# Check HTML
# Open blog/posts/[slug].html in browser
# Verify navigation, formatting, links work
```

## Example Workflow

```
User: "I have a new blog post about Kubernetes in _drafts/k8s-basics.md"
You (as AI):
1. Validate: python3 .claude/skills/publish-blog/scripts/validate_post.py _drafts/k8s-basics.md
2. Read template: blog/posts/docker-optimization-part2.html
3. Convert: markdown → HTML (semantic structure, meta tags, proper classes)
4. Update blog-posts.json (add entry, maintain date format, sort newest first)
5. Update feed.xml (add item, RFC 822 date, CDATA for description)
6. Create branch: git checkout -b blog/k8s-basics
7. Commit: git commit -m "docs: publish Kubernetes Basics\n\n..."
8. Push: git push -u origin blog/k8s-basics
9. Report: Summary with file list, branch name, PR link

Total time: ~30 seconds
```

## Troubleshooting

### "Validation failed" errors

Check the specific validation error and fix the frontmatter:
- Missing fields → Add required fields
- Date format → Use ISO 8601 UTC: `2025-12-26T10:00:00Z`
- Excerpt length → Adjust to 50-300 characters

### "JSON is invalid" after update

```bash
# Validate JSON syntax
python3 -m json.tool blog/blog-posts.json

# Common issues:
# - Trailing comma in array
# - Missing comma between objects
# - Unescaped quotes in strings
```

### "XML is invalid" after update

```bash
# Validate XML syntax
xmllint --noout blog/feed.xml

# Common issues:
# - Unescaped special characters (&, <, >) → Use CDATA or escape
# - Malformed date format → Use RFC 822
# - Unclosed tags
```

### "Blog page shows wrong date"

Check that:
- Date in blog-posts.json uses full ISO 8601 with time: `2025-12-26T10:00:00Z`
- Not just the date part: `2025-12-26` (this causes timezone bugs!)
- The `script.js` date parsing is using the fixed version

### "Mermaid diagrams not rendering"

Check that:
- Mermaid.js is loaded with pinned version from `config/cdn_versions.json`
- Diagram is wrapped in `<div class="mermaid">` tags
- Syntax is valid (test at https://mermaid.live/)

### "Cross-links not working"

Check that:
- Relative paths are correct (e.g., `href="docker-optimization.html"`, not `../docker-optimization.html`)
- Files exist at the referenced paths
- No typos in filenames

## Best Practices

### Writing Great Blog Posts

1. **Start with a hook** - Grab attention in first paragraph
2. **Use headings** - Break content into scannable sections
3. **Add code examples** - Show, don't just tell
4. **Include diagrams** - Visual explanations are powerful
5. **End with takeaways** - Summarize key points

### SEO Optimization

1. **Title**: 50-60 characters, include main keyword
2. **Excerpt**: 150-160 characters, compelling summary
3. **Tags**: 2-5 relevant tags, think of what readers search for
4. **Headings**: Use h2, h3 hierarchy for structure
5. **Internal links**: Link to related posts when relevant

### Technical Quality

1. **Test code examples** - Ensure they actually work
2. **Check links** - Verify external links aren't broken
3. **Proofread** - Fix typos and grammar
4. **Preview HTML** - Open in browser before merging
5. **Mobile responsive** - Check on mobile viewport

## Related Files & Documentation

- Example post: `.claude/skills/publish-blog/examples/example-post.md`
- Validation script: `.claude/skills/publish-blog/scripts/validate_post.py`
- CDN versions: `config/cdn_versions.json`
- Blog template: `blog/posts/docker-optimization-part2.html` (reference)
- Site JavaScript: `script.js` (date handling fixed)
- Site styles: `styles.css` (blog classes)

## Notes for AI Assistant

When this skill is invoked:

1. **Read existing files first** - Don't assume structure, read the actual templates
2. **Follow the exact steps** - Don't skip validation or git operations
3. **Preserve existing formatting** - Match the HTML structure exactly
4. **Use UTC everywhere** - Critical for avoiding timezone bugs
5. **Validate before committing** - Run JSON/XML validation
6. **Be explicit** - Show file paths, git commands, what you're doing
7. **Report clearly** - Give user actionable next steps

Remember: This skill automates a process that took 30-45 minutes manually. Every step matters for quality and consistency.
