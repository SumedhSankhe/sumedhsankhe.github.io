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
            navLinks.classList.toggle('active');

            // Update icon
            if (navLinks.classList.contains('active')) {
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
                menuIcon.textContent = '☰';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
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
            img.style.height = '2.2rem';
            img.style.verticalAlign = 'middle';
            img.style.margin = '0 0.2rem';
            img.style.marginLeft = '0.5rem';
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
 * Clicking a GIF enlarges it, clicking again or clicking another GIF changes selection
 * Automatically scrolls enlarged GIF into view for better UX on smaller screens
 */
document.addEventListener('DOMContentLoaded', function() {
    const gifCells = document.querySelectorAll('.project-gif-cell');

    gifCells.forEach(cell => {
        cell.addEventListener('click', function() {
            // Check if this cell is already enlarged
            const isEnlarged = this.classList.contains('enlarged');

            // Remove enlarged class from all cells
            gifCells.forEach(c => c.classList.remove('enlarged'));

            // If this cell wasn't enlarged, enlarge it
            if (!isEnlarged) {
                this.classList.add('enlarged');

                // Scroll the enlarged GIF into view smoothly
                // Use setTimeout to allow CSS transition to start first
                setTimeout(() => {
                    this.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }, 50);
            }
        });
    });

    // Optional: Click outside to close enlarged GIF
    document.addEventListener('click', function(e) {
        // Check if click is outside any project-gif-cell
        if (!e.target.closest('.project-gif-cell')) {
            gifCells.forEach(c => c.classList.remove('enlarged'));
        }
    });
});

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