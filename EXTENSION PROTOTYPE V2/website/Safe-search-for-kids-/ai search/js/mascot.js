// Mascot messages for different states
const mascotMessages = {
    welcome: [
        "Hi! I'm Owly! Let's search for something fun and safe! 🦉",
        "Ready to explore and learn something new? 🌟",
        "What would you like to discover today? 🔍"
    ],
    searching: [
        "Let me help you find that! 🔍",
        "Searching for safe and fun content! ⭐",
        "I love helping you learn new things! 📚"
    ],
    results: [
        "Here's what I found for you! 🎯",
        "Look at all these interesting results! 🌈",
        "Found some great stuff for you! 🎉"
    ],
    noResults: [
        "Hmm, let's try searching for something else! 🤔",
        "Maybe we can try different words? 💭",
        "Don't worry, we'll find something fun! 🌟"
    ],
    suggestion: [
        "Try searching for animals, space, or science! 🦒",
        "How about learning about dinosaurs? 🦕",
        "Want to explore the ocean? 🌊"
    ],
    idle: [
        "Need help finding something? Just ask! 💡",
        "I can help you find safe and fun content! 🛡️",
        "What would you like to learn about? 📚"
    ]
};

class MascotHelper {
    constructor() {
        this.mascotElement = document.getElementById('mascot-image');
        this.messageElement = document.getElementById('mascot-message');
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        this.currentState = 'welcome';
        this.idleTimer = null;
        
        this.initializeEventListeners();
        this.showRandomMessage('welcome');
        this.startIdleTimer();
    }

    initializeEventListeners() {
        // Mascot click interaction
        this.mascotElement.addEventListener('click', () => {
            if (this.currentState === 'idle') {
                this.showRandomMessage('suggestion');
            } else {
                this.showRandomMessage(this.currentState);
            }
            this.mascotElement.classList.add('wiggle');
            setTimeout(() => {
                this.mascotElement.classList.remove('wiggle');
            }, 500);
        });

        // Search input interactions
        if (this.searchInput) {
            this.searchInput.addEventListener('focus', () => {
                this.currentState = 'searching';
                this.showRandomMessage('searching');
            });

            this.searchInput.addEventListener('input', () => {
                if (this.searchInput.value.length > 0) {
                    this.currentState = 'searching';
                    this.showRandomMessage('searching');
                } else {
                    this.currentState = 'welcome';
                    this.showRandomMessage('welcome');
                }
            });
        }

        // Handle search form submission
        const searchForm = document.querySelector('.search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.searchInput.value.trim()) {
                    this.currentState = 'results';
                    this.showRandomMessage('results');
                }
            });
        }
    }

    showRandomMessage(state) {
        const messages = mascotMessages[state];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        this.messageElement.style.opacity = '0';
        setTimeout(() => {
            this.messageElement.textContent = randomMessage;
            this.messageElement.style.opacity = '1';
        }, 200);
    }

    startIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }

        this.idleTimer = setTimeout(() => {
            if (this.currentState !== 'results') {
                this.currentState = 'idle';
                this.showRandomMessage('idle');
            }
        }, 30000); // Show idle message after 30 seconds of inactivity
    }

    handleNoResults() {
        this.currentState = 'noResults';
        this.showRandomMessage('noResults');
    }

    suggestSearch() {
        this.currentState = 'suggestion';
        this.showRandomMessage('suggestion');
    }
}

// Initialize the mascot helper when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const mascotHelper = new MascotHelper();

    // Example of handling no results
    const searchResults = document.getElementById('search-results');
    if (searchResults && searchResults.children.length === 0) {
        mascotHelper.handleNoResults();
    }

    // Mascot Interaction
    const mascot = document.getElementById('shieldy-mascot');
    const speech = document.getElementById('shieldy-speech');
    const closeBtn = speech.querySelector('.speech-close');
    let isAnimating = false;

    function showSpeech() {
        if (!isAnimating) {
            isAnimating = true;
            speech.classList.add('show');
            
            // Add wiggle animation
            mascot.style.animation = 'wiggle 0.5s ease';
            setTimeout(() => {
                mascot.style.animation = 'bounce 2s infinite';
                isAnimating = false;
            }, 500);
        }
    }

    function hideSpeech() {
        if (!isAnimating) {
            isAnimating = true;
            speech.classList.remove('show');
            setTimeout(() => {
                isAnimating = false;
            }, 300);
        }
    }

    // Show speech on mascot click
    mascot.addEventListener('click', showSpeech);

    // Hide speech on close button click
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering mascot click
        hideSpeech();
    });
});
