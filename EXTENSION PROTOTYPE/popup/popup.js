// Friendly messages for kids
const MASCOT_MESSAGES = {
    startup: [
        "Hi friend! I'm keeping you safe while you explore! ",
        "Ready for a fun and safe adventure online? ",
        "Let's explore the internet safely together! "
    ],
    protection: {
        enabled: [
            "Yay! Your safety shield is ON! You're protected! ",
            "Super! I'm watching out for you! ",
            "Awesome! You're browsing safely now! "
        ],
        disabled: [
            "Oops! Your safety shield is off. Let's turn it back on! ",
            "Remember to stay safe online! Turn on your shield! ",
            "For the best protection, keep your shield on! "
        ]
    },
    blocked: [
        "Whoops! That site isn't safe for kids. Let's find something better! ",
        "I protected you from something unsafe! Let's try another site! ",
        "That wasn't a good site. Let's explore somewhere fun and safe! "
    ],
    timeLimit: {
        warning: [
            "Almost time for a break! 5 minutes left! ",
            "Time to wrap up what you're doing! ",
            "Remember to take breaks from the screen! "
        ],
        reached: [
            "Time's up! Let's take a break and play outside! ",
            "Great job today! Time for other activities! ",
            "Break time! Your eyes need rest! "
        ]
    }
};

// Load saved settings
async function loadSavedSettings() {
    const settings = await chrome.storage.local.get([
        'protectionEnabled',
        'safeSearchEnabled',
        'blurEnabled',
        'aiEnabled',
        'timeLimit',
        'lastVisitTime',
        'totalTimeSpent',
        'blockedCount',
        'safeCount'
    ]);
    
    return {
        protectionEnabled: settings.protectionEnabled !== false,
        safeSearchEnabled: settings.safeSearchEnabled !== false,
        blurEnabled: settings.blurEnabled !== false,
        aiEnabled: settings.aiEnabled !== false,
        timeLimit: settings.timeLimit || 7200,
        lastVisitTime: settings.lastVisitTime || Date.now(),
        totalTimeSpent: settings.totalTimeSpent || 0,
        blockedCount: settings.blockedCount || 0,
        safeCount: settings.safeCount || 0
    };
}

// Save settings
async function saveSettings(settings) {
    await chrome.storage.local.set(settings);
}

// Update time spent
async function updateTimeSpent() {
    const settings = await loadSavedSettings();
    const currentTime = Date.now();
    const timeSpent = currentTime - settings.lastVisitTime;
    
    await saveSettings({
        lastVisitTime: currentTime,
        totalTimeSpent: settings.totalTimeSpent + timeSpent
    });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load saved settings
        const settings = await loadSavedSettings();
        
        // Show random startup message
        const mascotMessage = document.getElementById('mascotMessage');
        if (mascotMessage) {
            mascotMessage.textContent = getRandomMessage(MASCOT_MESSAGES.startup);
        }

        // Initialize protection toggle
        const protectionToggle = document.getElementById('protectionToggle');
        if (protectionToggle) {
            protectionToggle.checked = settings.protectionEnabled;
            protectionToggle.addEventListener('change', async (e) => {
                await saveSettings({ protectionEnabled: e.target.checked });
                updateShieldStatus(e.target.checked);
            });
        }

        // Initialize safe search toggle
        const safeSearchToggle = document.getElementById('safeSearchToggle');
        if (safeSearchToggle) {
            safeSearchToggle.checked = settings.safeSearchEnabled;
            safeSearchToggle.addEventListener('change', async (e) => {
                await saveSettings({ safeSearchEnabled: e.target.checked });
            });
        }

        // Initialize blur toggle
        const blurToggle = document.getElementById('blurToggle');
        if (blurToggle) {
            blurToggle.checked = settings.blurEnabled;
            blurToggle.addEventListener('change', async (e) => {
                await saveSettings({ blurEnabled: e.target.checked });
            });
        }

        // Initialize AI toggle
        const aiToggle = document.getElementById('aiToggle');
        if (aiToggle) {
            aiToggle.checked = settings.aiEnabled;
            aiToggle.addEventListener('change', async (e) => {
                await saveSettings({ aiEnabled: e.target.checked });
            });
        }

        // Initialize time limit
        const timeLimit = document.getElementById('timeLimit');
        if (timeLimit) {
            timeLimit.value = settings.timeLimit.toString();
            timeLimit.addEventListener('change', async (e) => {
                await saveSettings({ timeLimit: parseInt(e.target.value) });
            });
        }

        // Update stats
        const blockedCount = document.getElementById('blockedCount');
        const safeCount = document.getElementById('safeCount');
        if (blockedCount && safeCount) {
            blockedCount.textContent = settings.blockedCount;
            safeCount.textContent = settings.safeCount;
        }

        // Initialize website button
        const websiteBtn = document.getElementById('openWebsiteBtn');
        if (websiteBtn) {
            websiteBtn.addEventListener('click', () => {
                const websiteUrl = chrome.runtime.getURL('/website/Safe-search-for-kids-/ai search/index.html');
                chrome.tabs.create({ url: websiteUrl });
            });
        }

        // Update shield status
        updateShieldStatus(settings.protectionEnabled);

        // Update time spent when popup opens
        await updateTimeSpent();

        // Chatbot functionality
        const chatMessages = document.getElementById('chatMessages');
        const chatInput = document.getElementById('chatInput');
        const sendMessage = document.getElementById('sendMessage');

        // Predefined responses for the chatbot
        const responses = {
            greetings: [
                "Hi there! How can I help you stay safe online? ",
                "Hello friend! Need help with safe browsing? ",
                "Hey! I'm here to help you browse safely! "
            ],
            safety: [
                "Remember to never share personal information online! ",
                "If something feels unsafe, tell a trusted adult right away! ",
                "Always ask parents before downloading anything! "
            ],
            help: [
                "I can help you with safe browsing! What would you like to know? ",
                "Need help? I'm here to keep you safe online! ",
                "I can explain our safety features! What interests you? "
            ],
            unknown: [
                "I'm not sure about that, but remember to stay safe online! ",
                "That's interesting! Remember to browse safely! ",
                "I'm still learning, but I'm here to help keep you safe! "
            ]
        };

        // Initial greeting
        function addInitialGreeting() {
            const greeting = "Hi! I'm your SafeSearch helper! I'm here to keep you safe online!  How can I help you today?";
            addBotMessage(greeting);
        }

        // Add a message to the chat
        function addMessage(message, isBot = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${isBot ? 'bot' : 'user'}`;
            messageDiv.textContent = message;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Add a bot message
        function addBotMessage(message) {
            addMessage(message, true);
        }

        // Add a user message
        function addUserMessage(message) {
            addMessage(message, false);
        }

        // Get a random response from a category
        function getRandomResponse(category) {
            const responseList = responses[category] || responses.unknown;
            return responseList[Math.floor(Math.random() * responseList.length)];
        }

        // Process user message and get appropriate response
        function processMessage(message) {
            const lowerMessage = message.toLowerCase();
            
            // Check message content and return appropriate response
            if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
                return getRandomResponse('greetings');
            } else if (lowerMessage.includes('safe') || lowerMessage.includes('danger') || lowerMessage.includes('protect')) {
                return getRandomResponse('safety');
            } else if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
                return getRandomResponse('help');
            } else {
                return getRandomResponse('unknown');
            }
        }

        // Handle sending messages
        function handleSendMessage() {
            const message = chatInput.value.trim();
            if (message) {
                addUserMessage(message);
                chatInput.value = '';
                
                // Simulate typing delay for more natural interaction
                setTimeout(() => {
                    const response = processMessage(message);
                    addBotMessage(response);
                }, 1000);
            }
        }

        // Event listeners
        sendMessage.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });

        addInitialGreeting();

        // Make all links in popup open in new tabs
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const url = link.getAttribute('href');
                if (url.startsWith('http') || url.startsWith('https')) {
                    chrome.tabs.create({ url: url });
                } else {
                    // For internal extension pages
                    chrome.tabs.create({ url: chrome.runtime.getURL(url) });
                }
            });
        });

    } catch (error) {
        console.error('Error initializing popup:', error);
    }
});

// Update shield status display
function updateShieldStatus(enabled) {
    const shieldIcon = document.getElementById('shieldIcon');
    const statusText = document.getElementById('protectionStatus');
    const mascotMessage = document.getElementById('mascotMessage');
    
    if (shieldIcon && statusText) {
        if (enabled) {
            shieldIcon.classList.add('active');
            statusText.textContent = 'ON';
            statusText.style.color = 'var(--success-color)';
            if (mascotMessage) {
                mascotMessage.textContent = getRandomMessage(MASCOT_MESSAGES.protection.enabled);
            }
        } else {
            shieldIcon.classList.remove('active');
            statusText.textContent = 'OFF';
            statusText.style.color = 'var(--danger-color)';
            if (mascotMessage) {
                mascotMessage.textContent = getRandomMessage(MASCOT_MESSAGES.protection.disabled);
            }
        }
    }
}

// Get random message from category
function getRandomMessage(category) {
    if (Array.isArray(category)) {
        return category[Math.floor(Math.random() * category.length)];
    }
    return category;
}

// Clean up when popup closes
window.addEventListener('unload', async () => {
    await updateTimeSpent();
});

// Handle protection toggle
document.getElementById('protectionToggle').addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await chrome.storage.local.set({ protectionEnabled: enabled });
    updateShieldStatus(enabled);
});

// Handle safe search toggle
document.getElementById('safeSearchToggle').addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await chrome.storage.local.set({ safeSearchEnabled: enabled });
});

// Handle time limit change
document.getElementById('timeLimit').addEventListener('change', async (e) => {
    const timeLimit = parseInt(e.target.value);
    await chrome.storage.local.set({ timeLimit });
});

// Listen for stats updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'UPDATE_STATS') {
        document.getElementById('blockedCount').textContent = request.blockedCount;
        document.getElementById('safeCount').textContent = request.safeCount;
        
        if (request.blocked) {
            updateMascotMessage(getRandomMessage(MASCOT_MESSAGES.blocked));
        }
    }
    if (request.type === 'TIME_WARNING') {
        updateMascotMessage(getRandomMessage(MASCOT_MESSAGES.timeLimit.warning));
    }
    if (request.type === 'TIME_LIMIT_REACHED') {
        updateMascotMessage(getRandomMessage(MASCOT_MESSAGES.timeLimit.reached));
    }
});

// Update mascot message
function updateMascotMessage(message) {
    const mascotMessage = document.getElementById('mascotMessage');
    const mascot = document.getElementById('mascot');
    
    // Animate message change
    mascotMessage.style.opacity = '0';
    setTimeout(() => {
        mascotMessage.textContent = message;
        mascotMessage.style.opacity = '1';
    }, 300);
}
