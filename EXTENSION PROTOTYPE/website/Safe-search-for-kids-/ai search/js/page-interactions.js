// Page Interactions

// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            // Simulate form submission
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }

    // Parent Controls Handlers
    const safeSearchToggle = document.querySelector('.control-toggle input[type="checkbox"]');
    if (safeSearchToggle) {
        safeSearchToggle.addEventListener('change', function() {
            const status = this.checked ? 'enabled' : 'disabled';
            alert(`Safe Search has been ${status}`);
        });
    }

    const timeLimitInput = document.querySelector('.time-input input');
    const saveTimeBtn = document.querySelector('.save-btn');
    if (saveTimeBtn && timeLimitInput) {
        saveTimeBtn.addEventListener('click', function() {
            alert(`Daily time limit has been set to ${timeLimitInput.value} hours`);
        });
    }

    // Help Page Search
    const helpSearchInput = document.querySelector('.help-search input');
    if (helpSearchInput) {
        helpSearchInput.addEventListener('input', function() {
            // Simple search functionality
            const searchTerm = this.value.toLowerCase();
            const helpContent = document.querySelectorAll('.help-content');
            
            helpContent.forEach(content => {
                const text = content.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    content.style.display = 'block';
                } else {
                    content.style.display = 'none';
                }
            });
        });
    }

    // Accordion functionality for Help page
    const accordionItems = document.querySelectorAll('.accordion-item');
    if (accordionItems.length > 0) {
        accordionItems.forEach(item => {
            const header = item.querySelector('h4');
            const content = item.querySelector('p');
            content.style.display = 'none';

            header.addEventListener('click', () => {
                const isOpen = content.style.display === 'block';
                content.style.display = isOpen ? 'none' : 'block';
            });
        });
    }

    // Add blocked keyword functionality
    const keywordInput = document.querySelector('.keyword-input input');
    const addKeywordBtn = document.querySelector('.add-btn');
    const blockedKeywords = document.querySelector('.blocked-keywords');
    
    if (keywordInput && addKeywordBtn && blockedKeywords) {
        addKeywordBtn.addEventListener('click', function() {
            const keyword = keywordInput.value.trim();
            if (keyword) {
                const tag = document.createElement('span');
                tag.className = 'keyword-tag';
                tag.innerHTML = `${keyword} <i class="fas fa-times"></i>`;
                
                tag.querySelector('i').addEventListener('click', function() {
                    tag.remove();
                });
                
                blockedKeywords.appendChild(tag);
                keywordInput.value = '';
            }
        });
    }

    // Live Chat Button
    const chatBtn = document.querySelector('.chat-btn');
    if (chatBtn) {
        chatBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Live chat support is coming soon!');
        });
    }

    // Report Generation
    const reportBtn = document.querySelector('.report-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', function() {
            alert('Generating activity report... This may take a moment.');
        });
    }

    // History Buttons
    const viewHistoryBtn = document.querySelector('.view-btn');
    const clearHistoryBtn = document.querySelector('.clear-btn');

    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', function() {
            alert('Loading search history...');
        });
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear the search history?')) {
                alert('Search history has been cleared.');
            }
        });
    }

    // Newsletter Form Handler
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput.value) {
                alert('Thank you for subscribing! You will receive our newsletter soon.');
                emailInput.value = '';
            }
        });
    }

    // Add smooth scrolling for footer links
    document.querySelectorAll('.quick-links a[href^="help.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').split('#')[1];
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add tooltips for social icons
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        const title = icon.getAttribute('title');
        if (title) {
            icon.addEventListener('mouseenter', function(e) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = title;
                document.body.appendChild(tooltip);
                
                const iconRect = icon.getBoundingClientRect();
                tooltip.style.position = 'fixed';
                tooltip.style.top = (iconRect.top - 30) + 'px';
                tooltip.style.left = (iconRect.left + (iconRect.width / 2) - (tooltip.offsetWidth / 2)) + 'px';
                
                icon.addEventListener('mouseleave', function() {
                    tooltip.remove();
                }, { once: true });
            });
        }
    });

    // Add CSS for tooltips
    const style = document.createElement('style');
    style.textContent = `
        .tooltip {
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000;
            animation: fadeIn 0.2s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});
