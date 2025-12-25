/**
 * Portfolio Website JavaScript
 * Author: Sumedh R. Sankhe
 * Description: Handles theme toggling and stores user preferences
 */

// ==========================================================================
// THEME TOGGLE FUNCTIONALITY
//
// WARNING: Theme detection logic is DUPLICATED in inline <script> in all HTML files
// to prevent FOUC (Flash of Unstyled Content) when navigating between pages.
//
// If you modify the theme detection logic below, you MUST update all 6 HTML files:
//   - index.html (lines 14-21)
//   - about.html (lines 13-20)
//   - projects.html (lines 13-20)
//   - skills.html (lines 13-20)
//   - blog.html (lines 13-20)
//   - contact.html (lines 13-20)
//
// The inline scripts MUST remain synchronized with this logic to prevent visual flicker.
// ==========================================================================

/**
 * Initialize theme toggle on page load
 * - Checks localStorage for saved preference
 * - Falls back to system preference if no saved preference
 * - Updates UI to reflect current theme
 */
(function initializeTheme() {
    // Get DOM elements
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    // Determine initial theme: saved preference > system preference > light
    // NOTE: This logic is duplicated in inline scripts - see warning above
    const validThemes = ['light', 'dark'];
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Validate saved theme to prevent CSS breakage from corrupted localStorage
    const initialTheme = validThemes.includes(savedTheme)
        ? savedTheme
        : (systemPrefersDark ? 'dark' : 'light');

    // Always set data-theme attribute explicitly for consistent state
    html.setAttribute('data-theme', initialTheme);
    updateThemeIcon(initialTheme);

    // Add click event listener to theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    /**
     * Toggle between light and dark themes
     * Saves preference to localStorage for persistence
     */
    function toggleTheme() {
           const currentTheme = html.getAttribute('data-theme') || 'light';
           const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
           // Add a class for transition effect
           html.classList.add('theme-transition');
           html.setAttribute('data-theme', newTheme);
           localStorage.setItem('theme', newTheme);
           updateThemeIcon(newTheme);
           // Remove transition class after animation
           setTimeout(() => {
              html.classList.remove('theme-transition');
           }, 500);
    }

    /**
     * Update the theme toggle icon based on current theme
     * @param {string} theme - 'light' or 'dark'
     */
    function updateThemeIcon(theme) {
        if (themeIcon) {
            // ◐ for light mode (left half filled)
            // ◑ for dark mode (right half filled)
            themeIcon.textContent = theme === 'dark' ? '◑' : '◐';
            themeIcon.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        }
    }

    /**
     * Listen for system theme changes
     * Updates icon if user changes system preference while page is open
     */
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only update if user hasn't set a manual preference
        if (!localStorage.getItem('theme')) {
            updateThemeIcon(e.matches ? 'dark' : 'light');
        }
    });
})();

// ==========================================================================
// COLORBLIND-FRIENDLY MODE TOGGLE
// ==========================================================================

/**
 * Initialize colorblind-friendly mode toggle
 * - Uses high-contrast blue-orange palette safe for all colorblind types
 * - Saves preference to localStorage
 * - Updates UI to reflect current mode
 */
(function initializeColorblindMode() {
    const colorblindToggle = document.getElementById('colorblindToggle');
    const colorblindIcon = document.getElementById('colorblindIcon');
    const html = document.documentElement;

    // Check localStorage for saved preference
    const savedColorblindMode = localStorage.getItem('colorblindMode');
    const isColorblindMode = savedColorblindMode === 'true';

    // Set initial state
    if (isColorblindMode) {
        html.setAttribute('data-colorblind', 'true');
    }
    updateColorblindIcon(isColorblindMode);

    // Add click event listener
    if (colorblindToggle) {
        colorblindToggle.addEventListener('click', toggleColorblindMode);
    }

    /**
     * Toggle colorblind-friendly mode
     */
    function toggleColorblindMode() {
        const currentMode = html.getAttribute('data-colorblind') === 'true';
        const newMode = !currentMode;

        // Add transition class
        html.classList.add('theme-transition');

        // Update state
        if (newMode) {
            html.setAttribute('data-colorblind', 'true');
        } else {
            html.removeAttribute('data-colorblind');
        }

        // Save to localStorage
        localStorage.setItem('colorblindMode', newMode.toString());
        updateColorblindIcon(newMode);

        // Remove transition class after animation
        setTimeout(() => {
            html.classList.remove('theme-transition');
        }, 500);
    }

    /**
     * Update the colorblind toggle icon
     * @param {boolean} isActive - Whether colorblind mode is active
     */
    function updateColorblindIcon(isActive) {
        if (colorblindIcon) {
            colorblindIcon.textContent = isActive ? '👁️' : '👁';
            colorblindToggle.setAttribute('aria-pressed', isActive.toString());
            colorblindToggle.title = isActive
                ? 'Disable colorblind-friendly mode'
                : 'Enable colorblind-friendly mode';
        }
    }
})();

// ==========================================================================
// MOBILE MENU TOGGLE
// ==========================================================================

/**
 * Initialize mobile menu toggle functionality
 * Handles opening/closing the mobile navigation menu
 */
(function initializeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const menuIcon = document.getElementById('menuIcon');

    if (menuToggle && navLinks) {
        // Toggle menu on button click
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isExpanded = navLinks.classList.contains('active');
            navLinks.classList.toggle('active');

            // Update aria-expanded attribute
            menuToggle.setAttribute('aria-expanded', !isExpanded);

            // Update icon
            if (!isExpanded) {
                menuIcon.textContent = '✕';
            } else {
                menuIcon.textContent = '☰';
            }
        });

        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuIcon.textContent = '☰';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuIcon.textContent = '☰';
            }
        });
    }
})();

// ==========================================================================
// SMOOTH SCROLLING FOR ANCHOR LINKS
// ==========================================================================

/**
 * Add smooth scrolling behavior to all anchor links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        
        // Only prevent default if it's an actual anchor (not just "#")
        if (targetId !== '#' && targetId.length > 1) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================

/**
 * Debounce function to limit how often a function can be called
 * Useful for scroll and resize events
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================================================
// FADE-IN ANIMATION ON SCROLL
// ==========================================================================

function revealOnScroll() {
    const fadeEls = document.querySelectorAll('.fade-in');
    const windowHeight = window.innerHeight;
    fadeEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < windowHeight - 60) {
            el.classList.add('visible');
        } else {
            el.classList.remove('visible');
        }
    });
}

window.addEventListener('scroll', debounce(revealOnScroll, 20));
window.addEventListener('resize', debounce(revealOnScroll, 50));
document.addEventListener('DOMContentLoaded', revealOnScroll);

// ==========================================================================
// PACKAGE LOGOS RANDOMIZER
// ==========================================================================

/**
 * Randomly select and display package logos for different skill categories
 * Shuffles on each page load for variety
 */
document.addEventListener('DOMContentLoaded', function() {
    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Helper function to create and append img elements
    function appendLogos(container, logos, count) {
        const selectedLogos = shuffleArray(logos).slice(0, count);
        selectedLogos.forEach(logo => {
            const img = document.createElement('img');
            img.src = logo.src;
            img.alt = logo.alt;
            img.className = 'skill-logo';
            container.appendChild(img);
        });
    }

    // R & Shiny logos
    const rLogosContainer = document.getElementById('r-logos');
    if (rLogosContainer) {
        const rLogos = [
            { src: 'assets/svg/shiny.svg', alt: 'Shiny' },
            { src: 'assets/svg/bslib.svg', alt: 'bslib' },
            { src: 'assets/svg/dbplyr.svg', alt: 'dbplyr' },
            { src: 'assets/svg/dplyr.svg', alt: 'dplyr' },
            { src: 'assets/svg/htmltools.svg', alt: 'htmltools' },
            { src: 'assets/svg/devtools.svg', alt: 'devtools' },
            { src: 'assets/svg/usethis.svg', alt: 'usethis' },
            { src: 'assets/svg/promises.svg', alt: 'promises' },
            { src: 'assets/svg/pipe.svg', alt: 'pipe' },
            { src: 'assets/svg/sortable.svg', alt: 'sortable' },
            { src: 'assets/svg/rmarkdown.svg', alt: 'rmarkdown' },
            { src: 'assets/svg/RStudio.svg', alt: 'RStudio' }
        ];
        appendLogos(rLogosContainer, rLogos, 4);
    }

    // Machine Learning logos
    const mlLogosContainer = document.getElementById('ml-logos');
    if (mlLogosContainer) {
        const mlLogos = [
            { src: 'assets/svg/tidymodels.svg', alt: 'tidymodels' },
            { src: 'assets/svg/recipes.svg', alt: 'recipes' },
            { src: 'assets/svg/modelr.svg', alt: 'modelr' },
            { src: 'assets/svg/sparklyr.svg', alt: 'sparklyr' }
        ];
        appendLogos(mlLogosContainer, mlLogos, 2);
    }

    // Data Visualization logos
    const datavizLogosContainer = document.getElementById('dataviz-logos');
    if (datavizLogosContainer) {
        const datavizLogos = [
            { src: 'assets/svg/ggplot2.svg', alt: 'ggplot2' },
            { src: 'assets/svg/rmarkdown.svg', alt: 'rmarkdown' },
            { src: 'assets/svg/dplyr.svg', alt: 'dplyr' }
        ];
        appendLogos(datavizLogosContainer, datavizLogos, 2);
    }
});

// ==========================================================================
// PROJECT GIF CLICK TO ENLARGE
// ==========================================================================

/**
 * Handle click events on project GIFs to enlarge/shrink them
 * Uses a modal overlay approach - GIF enlarges in center of screen
 * No scrolling needed - appears as overlay with backdrop
 * Disabled on mobile screens (<=768px) where enlargement would make GIFs smaller
 */
document.addEventListener('DOMContentLoaded', function() {
    const gifCells = document.querySelectorAll('.project-gif-cell');

    // Only enable on screens wider than 768px
    if (window.innerWidth <= 768) {
        return;
    }

    // Create backdrop element
    const backdrop = document.createElement('div');
    backdrop.className = 'project-gif-backdrop';
    document.body.appendChild(backdrop);

    function closeAllEnlarged() {
        gifCells.forEach(c => c.classList.remove('enlarged'));
        backdrop.classList.remove('active');
    }

    gifCells.forEach(cell => {
        cell.addEventListener('click', function(e) {
            e.stopPropagation();

            // Check if this cell is already enlarged
            const isEnlarged = this.classList.contains('enlarged');

            // Close all enlarged cells first
            closeAllEnlarged();

            // If this cell wasn't enlarged, enlarge it
            if (!isEnlarged) {
                this.classList.add('enlarged');
                backdrop.classList.add('active');
            }
        });
    });

    // Click backdrop to close
    backdrop.addEventListener('click', closeAllEnlarged);

    // Click outside to close enlarged GIF
    document.addEventListener('click', function(e) {
        // Check if click is outside any project-gif-cell
        if (!e.target.closest('.project-gif-cell')) {
            closeAllEnlarged();
        }
    });

    // Press Escape key to close enlarged GIF
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllEnlarged();
        }
    });
});

// ==========================================================================
// BLOG POSTS LOADING
// ==========================================================================

/**
 * Load and display blog posts from JSON configuration
 * Handles dynamic rendering of blog cards on the blog page
 */
document.addEventListener('DOMContentLoaded', function() {
    const blogPostsGrid = document.getElementById('blogPostsGrid');
    const blogLoading = document.getElementById('blogLoading');
    const blogEmpty = document.getElementById('blogEmpty');

    // Only run on blog page
    if (!blogPostsGrid) return;

    /**
     * Fetch blog posts from JSON file
     */
    async function loadBlogPosts() {
        try {
            const response = await fetch('blog/blog-posts.json');
            if (!response.ok) {
                throw new Error('Failed to load blog posts');
            }
            const data = await response.json();
            displayBlogPosts(data.posts);
        } catch (error) {
            console.error('Error loading blog posts:', error);
            showEmptyState();
        }
    }

    /**
     * Display blog posts in the grid
     * @param {Array} posts - Array of blog post objects
     */
    function displayBlogPosts(posts) {
        // Hide loading state
        if (blogLoading) {
            blogLoading.classList.add('hidden');
        }

        // Show empty state if no posts
        if (!posts || posts.length === 0) {
            showEmptyState();
            return;
        }

        // Sort posts by date (newest first)
        const sortedPosts = posts.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        // Create blog cards
        sortedPosts.forEach(post => {
            const card = createBlogCard(post);
            blogPostsGrid.appendChild(card);
        });
    }

    /**
     * Create a blog card element
     * @param {Object} post - Blog post object
     * @returns {HTMLElement} Blog card element
     */
    function createBlogCard(post) {
        const card = document.createElement('div');
        card.className = 'blog-card';
        card.setAttribute('role', 'article');

        // Format date (parse as local date to avoid timezone issues)
        const [year, month, day] = post.date.split('-');
        const date = new Date(year, month - 1, day);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Create card HTML
        card.innerHTML = `
            ${post.featured ? '<div class="featured-badge">Featured</div>' : ''}
            <h3>${escapeHtml(post.title)}</h3>
            <div class="blog-meta">
                <time datetime="${post.date}">${formattedDate}</time>
                <span class="meta-separator">•</span>
                <span>${post.readTime}</span>
            </div>
            <p>${escapeHtml(post.description)}</p>
            <div class="blog-tags">
                ${post.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
        `;

        // Add click event to navigate to post
        card.addEventListener('click', () => {
            window.location.href = `blog/posts/${post.file}`;
        });

        // Add keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = `blog/posts/${post.file}`;
            }
        });

        return card;
    }

    /**
     * Show empty state when no posts are available
     */
    function showEmptyState() {
        if (blogLoading) {
            blogLoading.classList.add('hidden');
        }
        if (blogEmpty) {
            blogEmpty.classList.remove('hidden');
        }
    }

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize blog posts loading
    loadBlogPosts();
});

// ==========================================================================
// COOKIE CONSENT BANNER
// ==========================================================================

/**
 * Cookie consent banner for GDPR/privacy compliance
 * Shows banner if user hasn't made a choice
 * Loads GA4 only after consent is given
 */
(function initializeCookieConsent() {
    'use strict';

    // Check if user has already made a choice
    const consentStatus = localStorage.getItem('cookieConsent');
    const banner = document.getElementById('cookieConsent');

    if (!banner) return; // Banner not found

    // Show banner if no choice has been made
    if (!consentStatus) {
        setTimeout(() => {
            banner.classList.add('show');
        }, 1000); // Show after 1 second delay
    }

    // Accept cookies button
    const acceptBtn = document.getElementById('cookieAccept');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'accepted');
            banner.classList.remove('show');

            // Load Google Analytics
            loadGoogleAnalytics();
        });
    }

    // Decline cookies button
    const declineBtn = document.getElementById('cookieDecline');
    if (declineBtn) {
        declineBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'declined');
            banner.classList.remove('show');
        });
    }

    /**
     * Load Google Analytics dynamically after consent
     */
    function loadGoogleAnalytics() {
        // Check if already loaded
        if (window.gtag && window.dataLayer && window.dataLayer.length > 0) {
            return;
        }

        // Load gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-ZB17TTEQRQ';
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        window.gtag = gtag;

        gtag('js', new Date());
        gtag('config', 'G-ZB17TTEQRQ', {
            'anonymize_ip': true,
            'allow_google_signals': false,
            'allow_ad_personalization_signals': false,
            'cookie_flags': 'SameSite=None;Secure'
        });

        console.log('Google Analytics loaded after consent');
    }
})();

// ==========================================================================
// ANALYTICS
// ==========================================================================

/**
 * Google Analytics 4 tracking with privacy-friendly settings
 * Measurement ID: G-ZB17TTEQRQ
 *
 * Privacy features enabled:
 * - IP anonymization
 * - No advertising signals
 * - No ad personalization
 * - Consent-based loading (only loads after user accepts)
 *
 * Custom event tracking can be added here if needed:
 * Example: gtag('event', 'button_click', { 'event_category': 'engagement' });
 */