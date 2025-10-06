/**
 * Portfolio Website JavaScript
 * Author: Sumedh R. Sankhe
 * Description: Handles theme toggling and stores user preferences
 */

// ==========================================================================
// THEME TOGGLE FUNCTIONALITY
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

    // Check for saved user preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // User has a saved preference - apply it
        html.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // No saved preference, but system prefers dark mode
        // Don't set data-theme attribute, let CSS handle it via media query
        // Just update the icon to reflect dark mode
        updateThemeIcon('dark');
    }

    // Add click event listener to theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    /**
     * Toggle between light and dark themes
     * Saves preference to localStorage for persistence
     */
    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update DOM and localStorage
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon to reflect new theme
        updateThemeIcon(newTheme);
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
// ACCESSIBILITY ENHANCEMENTS
// ==========================================================================

/**
 * Add keyboard navigation support for interactive elements
 * Ensures all interactive elements are accessible via keyboard
 */
document.addEventListener('DOMContentLoaded', function() {
    // Add role="button" to elements that act like buttons but aren't <button> tags
    const clickableElements = document.querySelectorAll('[onclick]');
    clickableElements.forEach(element => {
        if (element.tagName !== 'BUTTON' && element.tagName !== 'A') {
            element.setAttribute('role', 'button');
            element.setAttribute('tabindex', '0');
            
            // Add keyboard support (Enter and Space keys)
            element.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
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
// ANALYTICS (Optional - Uncomment if needed)
// ==========================================================================

/**
 * Track page views (example for Google Analytics)
 * Uncomment and configure if you want analytics
 */
// window.dataLayer = window.dataLayer || [];
// function gtag(){dataLayer.push(arguments);}
// gtag('js', new Date());
// gtag('config', 'YOUR-GA-TRACKING-ID');