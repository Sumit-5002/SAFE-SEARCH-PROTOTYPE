// Check if user is logged in
function checkAuth() {
    const session = JSON.parse(localStorage.getItem('safeSearchSession'));
    if (!session) return false;

    // Check if session has expired
    const now = new Date().getTime();
    if (now > session.expiresAt) {
        localStorage.removeItem('safeSearchSession');
        return false;
    }
    return true;
}

// Safe search implementation
class SafeSearch {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.resultsContainer = document.getElementById('search-results');
        this.suggestionsContainer = document.getElementById('search-suggestions');
        this.funFactContainer = document.getElementById('fun-fact');
        this.setupEventListeners();
        this.initializeAnimations();
        this.loadFunFact();
    }

    setupEventListeners() {
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Add input event listener for search suggestions
        this.searchInput.addEventListener('input', () => this.showSuggestions());

        // Category click handlers with animations
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.searchInput.value = category;
                
                // Animate the card
                gsap.to(card, {
                    scale: 1.05,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1
                });

                this.performSearch();
            });

            // Add hover animations
            card.addEventListener('mouseenter', () => {
                gsap.to(card.querySelector('img'), {
                    scale: 1.1,
                    duration: 0.3
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card.querySelector('img'), {
                    scale: 1,
                    duration: 0.3
                });
            });
        });
    }

    initializeAnimations() {
        // Animate search input on focus
        this.searchInput.addEventListener('focus', () => {
            gsap.to(this.searchInput, {
                scale: 1.02,
                duration: 0.3
            });
        });

        this.searchInput.addEventListener('blur', () => {
            gsap.to(this.searchInput, {
                scale: 1,
                duration: 0.3
            });
        });

        // Animate search button on hover
        this.searchBtn.addEventListener('mouseenter', () => {
            gsap.to(this.searchBtn, {
                scale: 1.05,
                duration: 0.3
            });
        });

        this.searchBtn.addEventListener('mouseleave', () => {
            gsap.to(this.searchBtn, {
                scale: 1,
                duration: 0.3
            });
        });
    }

    async showSuggestions() {
        const query = this.searchInput.value.trim();
        if (query.length < 2) {
            this.suggestionsContainer.innerHTML = '';
            return;
        }

        // Sample suggestions (replace with actual API call)
        const suggestions = [
            'science experiments for kids',
            'fun math games',
            'animal facts',
            'history for children',
            'educational videos'
        ].filter(s => s.toLowerCase().includes(query.toLowerCase()));

        if (suggestions.length > 0) {
            this.suggestionsContainer.innerHTML = suggestions.map(s => `
                <div class="suggestion-item" onclick="searchInstance.useSuggestion('${s}')">
                    ${s}
                </div>
            `).join('');
            
            // Animate suggestions
            gsap.from('.suggestion-item', {
                y: 20,
                opacity: 0,
                duration: 0.3,
                stagger: 0.1
            });
        } else {
            this.suggestionsContainer.innerHTML = '';
        }
    }

    useSuggestion(suggestion) {
        this.searchInput.value = suggestion;
        this.suggestionsContainer.innerHTML = '';
        this.performSearch();
    }

    async performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;

        // Show loading animation
        this.resultsContainer.innerHTML = '<div class="loading">Searching for fun and safe content...</div>';

        try {
            // Log search activity if user is logged in
            if (checkAuth()) {
                this.logSearchActivity(query);
            }

            // Perform safe search
            const results = await this.fetchSafeResults(query);
            this.displayResults(results);
        } catch (error) {
            this.resultsContainer.innerHTML = `
                <div class="error">
                    <p>Oops! Something went wrong. Let's try again!</p>
                    <button onclick="searchInstance.performSearch()">Retry Search</button>
                </div>`;
        }
    }

    async fetchSafeResults(query) {
        // This is a placeholder for the actual API call
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Sample results
        return [
            {
                title: 'Fun Science Experiments for Kids',
                description: 'Learn amazing science facts and try safe experiments at home!',
                url: '#'
            },
            {
                title: 'Animal Facts: Did You Know?',
                description: 'Discover interesting facts about your favorite animals!',
                url: '#'
            }
        ];
    }

    displayResults(results) {
        this.resultsContainer.innerHTML = '';
        
        if (!results.length) {
            this.resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>No results found</h3>
                    <p>Try searching for something else!</p>
                </div>`;
            return;
        }

        const resultsHtml = results.map((result, index) => `
            <div class="search-result" style="opacity: 0">
                <h3><a href="${result.url}" target="_blank">${result.title}</a></h3>
                <p>${result.description}</p>
            </div>
        `).join('');

        this.resultsContainer.innerHTML = resultsHtml;

        // Animate results
        gsap.to('.search-result', {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.2,
            ease: 'power2.out'
        });
    }

    async loadFunFact() {
        const facts = [
            'A day on Venus is longer than its year!',
            'Honey never spoils. Archaeologists have found 3000-year-old honey!',
            'Octopuses have three hearts!',
            'The first computer "bug" was an actual real-life bug!',
            'A group of flamingos is called a "flamboyance"!'
        ];

        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        
        this.funFactContainer.innerHTML = `
            <div class="fun-fact">
                <h3>🌟 Did You Know?</h3>
                <p>${randomFact}</p>
            </div>
        `;

        // Animate fun fact
        gsap.from('.fun-fact', {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });

        // Change fact every 30 seconds
        setInterval(() => {
            const newFact = facts[Math.floor(Math.random() * facts.length)];
            gsap.to('.fun-fact', {
                opacity: 0,
                y: -30,
                duration: 0.5,
                onComplete: () => {
                    this.funFactContainer.innerHTML = `
                        <div class="fun-fact">
                            <h3>🌟 Did You Know?</h3>
                            <p>${newFact}</p>
                        </div>
                    `;
                    gsap.from('.fun-fact', {
                        y: 30,
                        opacity: 0,
                        duration: 0.5
                    });
                }
            });
        }, 30000);
    }

    logSearchActivity(query) {
        // Send search activity to backend for monitoring
        fetch('/api/log-activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('safeSearchToken')}`
            },
            body: JSON.stringify({
                type: 'search',
                query,
                timestamp: new Date().toISOString()
            })
        }).catch(console.error); // Non-blocking
    }
}

// Initialize safe search when document is ready
let searchInstance;
document.addEventListener('DOMContentLoaded', () => {
    searchInstance = new SafeSearch();
});
