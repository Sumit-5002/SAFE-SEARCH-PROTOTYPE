// Mascot messages for different states
const mascotMessages = {
    welcome: [
        "Welcome! I'm Owly, your friendly guide! 🦉",
        "Hi there! Need help signing in? 🌟",
        "Let's explore together safely! 🚀"
    ],
    typing: [
        "Type away! I'm watching for safety! 👀",
        "Remember to keep your password secret! 🤫",
        "Take your time, no rush! ⌛"
    ],
    error: [
        "Oops! Let's try that again! 🎯",
        "Don't worry, everyone makes mistakes! 🌈",
        "Need help? I'm here for you! 🤝"
    ],
    success: [
        "Great job! You're in! 🎉",
        "Welcome back, friend! 🌟",
        "Ready for a safe adventure? Let's go! 🚀"
    ],
    idle: [
        "Just checking if you're still there! 👋",
        "Need any help? Just ask! 💭",
        "Safety first, that's our motto! 🛡️"
    ]
};

class MascotHelper {
    constructor() {
        this.mascotElement = document.getElementById('mascot-image');
        this.messageElement = document.getElementById('mascot-message');
        this.currentState = 'welcome';
        this.idleTimer = null;
        
        this.initializeEventListeners();
        this.showRandomMessage('welcome');
        this.startIdleTimer();
    }

    initializeEventListeners() {
        // Mascot click interaction
        this.mascotElement.addEventListener('click', () => {
            this.showRandomMessage(this.currentState);
            this.mascotElement.classList.add('animate__animated', 'animate__bounce');
            setTimeout(() => {
                this.mascotElement.classList.remove('animate__animated', 'animate__bounce');
            }, 1000);
        });

        // Form interactions
        const form = document.getElementById('signin-form');
        const inputs = form.querySelectorAll('input');

        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.currentState = 'typing';
                this.showRandomMessage('typing');
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.currentState = 'success';
            this.showRandomMessage('success');
            // Add your form submission logic here
        });
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
            if (this.currentState !== 'success') {
                this.currentState = 'idle';
                this.showRandomMessage('idle');
            }
        }, 30000); // Show idle message after 30 seconds of inactivity
    }

    handleError() {
        this.currentState = 'error';
        this.showRandomMessage('error');
    }
}

class Auth {
    constructor() {
        this.form = document.getElementById('signin-form');
        this.userTypeButtons = document.querySelectorAll('.user-type-toggle button');
        this.currentUserType = 'child';
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        this.userTypeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.setUserType(button.dataset.type);
            });
        });
    }

    setUserType(type) {
        this.currentUserType = type;
        this.userTypeButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.type === type);
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const username = this.form.username.value;
        const password = this.form.password.value;

        try {
            const response = await this.signIn(username, password);
            
            if (response.success) {
                this.setupSession(response);
                this.redirectToappropriateDashboard();
            } else {
                this.showError(response.message || 'Invalid credentials');
            }
        } catch (error) {
            this.showError('An error occurred. Please try again.');
        }
    }

    async signIn(username, password) {
        // This is a placeholder for the actual API call
        const response = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                userType: this.currentUserType
            })
        });

        return await response.json();
    }

    setupSession(response) {
        const sessionDuration = this.currentUserType === 'child' ? 30 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 mins for child, 24 hours for parent
        const session = {
            token: response.token,
            userType: this.currentUserType,
            userId: response.userId,
            expiresAt: new Date().getTime() + sessionDuration
        };

        localStorage.setItem('safeSearchSession', JSON.stringify(session));
        localStorage.setItem('safeSearchToken', response.token);
    }

    redirectToappropriateDashboard() {
        if (this.currentUserType === 'parent') {
            window.location.href = '/parent-dashboard.html';
        } else {
            window.location.href = '/index.html';
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        const existingError = this.form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        this.form.insertBefore(errorDiv, this.form.firstChild);
    }
}

// Initialize auth and mascot helper when document is ready
document.addEventListener('DOMContentLoaded', () => {
    new Auth();
    const mascotHelper = new MascotHelper();

    // Example of handling form validation errors
    const form = document.getElementById('signin-form');
    const inputs = form.querySelectorAll('input');

    inputs.forEach(input => {
        input.addEventListener('invalid', () => {
            mascotHelper.handleError();
        });
    });
});
