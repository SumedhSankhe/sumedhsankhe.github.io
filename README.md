# Sumedh R. Sankhe - Portfolio Website

## 📁 Project Structure

```
/
├── index.html          # Home page
├── about.html          # About/experience
├── projects.html       # Project showcase
├── skills.html         # Technical skills
├── blog.html           # Blog posts
├── contact.html        # Contact information
├── styles.css          # Main stylesheet (1,341 lines)
├── script.js           # Main JavaScript (352 lines)
├── assets/
│   ├── video/          # Optimized demos (WebM + MP4)
│   ├── gif/            # Legacy GIF fallbacks
│   └── svg/            # Package/skill logos
└── README.md           # This file
```

## 🛠️ Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox
- **Vanilla JavaScript**: No frameworks/libraries
- **Video**: H.264 (MP4) and VP9 (WebM)

## 📝 Maintenance Guide

### Adding a New Page

1. Copy existing HTML file as template
2. **IMPORTANT**: Ensure inline theme script is included in `<head>`
3. Update navigation menu in ALL HTML files
4. Add to sitemap (if using)

### Modifying Theme Logic

**⚠️ CRITICAL**: Update these 7 locations:

1. `index.html` lines 16-28
2. `about.html` lines 15-27
3. `projects.html` lines 15-27
4. `skills.html` lines 15-27
5. `blog.html` lines 15-27
6. `contact.html` lines 15-27
7. `script.js` lines 38-45

**Recommended**: Create a test to verify synchronization.

### Adding New Themes

To add a third theme (e.g., 'auto' or 'high-contrast'):

1. Update `validThemes` array in all 7 locations
2. Add CSS variables in `styles.css`
3. Update toggle button logic in `script.js`
4. Add new theme icon

### Image Optimization

**Problem**: `profile.png` is 438KB but displayed at 200x200 (3x oversized).

**Solution**:
```bash
pip install Pillow
python3 optimize_images.py
```

**Results**: Generates optimized sizes (200x, 400x) in PNG and WebP formats with ~95% size reduction.

**Next**: Update `index.html` to use `<picture>` element for responsive image serving.

## 🌐 Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Chrome | Latest | ✅ Full |
| iOS Safari | 14+ | ✅ Full |
| Samsung Internet | Latest | ✅ Full |

## 📊 Performance Metrics

- **HTML Total**: ~46KB (6 files)
- **CSS**: 1,341 lines
- **JavaScript**: 352 lines
- **Videos**: 2.8MB total
- **First Paint**: <100ms
- **Time to Interactive**: <500ms

## 🔄 Recent Updates

### 2025-11-20: Analytics, Privacy & SEO

- ✅ Google Analytics 4 with consent-based loading
- ✅ GDPR-compliant cookie consent banner
- ✅ Privacy policy page with user rights and data disclosure
- ✅ Comprehensive SEO metadata (Open Graph, Twitter Cards, JSON-LD)
- ✅ Image optimization script for profile images
- ✅ IP anonymization and privacy-first analytics configuration

### 2025-01-13: Theme System Improvements

- ✅ Added theme validation to prevent CSS breakage
- ✅ Added error handling for disabled localStorage
- ✅ Added warning comments about code duplication
- ✅ Added optional chaining for `matchMedia` compatibility
- ✅ Improved documentation

### Previous: Accessibility & Performance

- ✅ Fixed theme flicker on tab switching (FOUC prevention)
- ✅ Added Escape key support for modals
- ✅ Dynamic `aria-expanded` updates
- ✅ Removed all inline styles
- ✅ Converted GIFs to video (84% size reduction)

## 📄 License

Copyright © 2025 Sumedh R. Sankhe. All rights reserved.

## 🤝 Contact

- **Email**: sumedh.sankhe@gmail.com
- **LinkedIn**: [linkedin.com/in/sankhe](https://linkedin.com/in/sankhe)
- **GitHub**: [github.com/SumedhSankhe](https://github.com/SumedhSankhe)
