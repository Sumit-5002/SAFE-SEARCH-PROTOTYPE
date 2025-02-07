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
        'safeCount',
        'contentBlurEnabled',
        'aiFilterEnabled'
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
        safeCount: settings.safeCount || 0,
        contentBlurEnabled: settings.contentBlurEnabled !== false,
        aiFilterEnabled: settings.aiFilterEnabled !== false
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
        // Removed authentication check
        
        // Load saved settings
        const settings = await loadSavedSettings();
        
        // Update shield status
        const protectionEnabled = settings.protectionEnabled || false;
        updateShieldStatus(protectionEnabled);
        
        // Initialize chat functionality
        const chatMessages = document.getElementById('chatMessages');
        const chatInput = document.getElementById('chatInput');
        const sendMessage = document.getElementById('sendMessage');

        // Initial greeting
        addInitialGreeting();

        // Event listeners
        sendMessage.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });

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

        // Removed settings link handler
        
        // Initialize dark mode
        initializeDarkMode();
    } catch (error) {
        console.error('Error initializing popup:', error);
    }
});

// Authentication check function
async function checkAuthentication(redirectPage) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['isAuthenticated', 'authTimestamp'], (result) => {
            console.log('Authentication check:', result);
            
            // Check if authenticated and token is not too old (e.g., 30 days)
            const isAuthenticated = result.isAuthenticated === true;
            const isTokenRecent = !result.authTimestamp || 
                (Date.now() - result.authTimestamp) < (30 * 24 * 60 * 60 * 1000);

            if (isAuthenticated && isTokenRecent) {
                resolve(true);
            } else {
                // Open login page with redirect
                const loginUrl = chrome.runtime.getURL('website/Safe-search-for-kids-/ai search/login.html') + 
                    (redirectPage ? `?redirect=${encodeURIComponent(redirectPage)}` : '');
                
                console.log('Redirecting to login:', loginUrl);
                chrome.tabs.create({ url: loginUrl });
                resolve(false);
            }
        });
    });
}

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
async function processMessage(message) {
    console.log('Processing message:', message);
    const lowerMessage = message.toLowerCase();

    // AI-powered search and response
    if (settings.aiEnabled) {
        console.log('AI is enabled, attempting to generate response');
        
        // Perform web search
        const searchResults = await searchWeb(message);
        
        // Check if search results exist and are not empty
        if (searchResults && searchResults.length > 0) {
            // Display search results
            const searchResultsContainer = document.getElementById('search-results');
            searchResultsContainer.innerHTML = ''; // Clear previous results
            
            searchResults.forEach(result => {
                const resultDiv = document.createElement('div');
                resultDiv.classList.add('search-result');
                resultDiv.innerHTML = `
                    <h3>${result.title}</h3>
                    <p>${result.snippet}</p>
                `;
                searchResultsContainer.appendChild(resultDiv);
            });
        } else {
            // No results, clear the container
            const searchResultsContainer = document.getElementById('search-results');
            searchResultsContainer.innerHTML = '';
        }

        const aiResponse = generateAIResponse(message);
        console.log('AI Response:', aiResponse);
        addBotMessage(aiResponse);
        return;
    }

    console.log('AI is disabled, using predefined responses');
    // Existing predefined responses
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
        addBotMessage(getRandomResponse('greetings'));
    } else if (lowerMessage.includes('safe') || lowerMessage.includes('protection')) {
        addBotMessage(getRandomResponse('safety'));
    } else if (lowerMessage.includes('help')) {
        addBotMessage(getRandomResponse('help'));
    } else {
        addBotMessage(getRandomResponse('unknown'));
    }
}

// Handle sending messages
function handleSendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        addUserMessage(message);
        processMessage(message);
        chatInput.value = ''; // Clear input
    }
}

// DuckDuckGo Instant Answer API for web search
async function searchWeb(query) {
    try {
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
        const data = await response.json();
        
        // Process results
        const results = [];
        
        // Abstract results
        if (data.Abstract) {
            results.push({
                title: data.Heading || 'Information',
                snippet: data.Abstract
            });
        }
        
        // Related topics (limit to 1 result)
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            const topic = data.RelatedTopics[0];
            results.push({
                title: topic.Text.split(' - ')[0],
                snippet: topic.Text
            });
        }
        
        return results; // Always return an array, even if empty
    } catch (error) {
        console.error('Web Search Error:', error);
        return []; // Return empty array instead of null
    }
}

// Enhanced math problem solver with extensive logging
function solveMathProblem(query) {
    console.log('Attempting to solve math problem:', query);
    
    // Remove any non-mathematical characters and extra spaces
    const cleanQuery = query.replace(/[^0-9+\-*/().]/g, '').trim();
    console.log('Cleaned query:', cleanQuery);
    
    try {
        // Basic safety checks
        if (cleanQuery.length > 50) {
            console.log('Problem too complex');
            return "That looks like a very complex problem. Let's keep it simple!";
        }
        
        // Prevent potential security risks
        if (cleanQuery.includes('eval') || cleanQuery.includes('function')) {
            console.log('Potential security risk detected');
            return "Sorry, I can only solve basic math problems.";
        }
        
        // Use Function constructor for safe evaluation
        const result = new Function(`return ${cleanQuery}`)();
        console.log('Calculation result:', result);
        
        // Round to handle floating point imprecision
        const roundedResult = Math.round(result * 1000) / 1000;
        console.log('Rounded result:', roundedResult);
        
        return `${cleanQuery} = ${roundedResult}`;
    } catch (error) {
        console.error('Math problem solving error:', error);
        return "Oops! I couldn't solve that math problem. Can you check the calculation?";
    }
}

// Simple AI-like response generation using predefined knowledge base
function generateAIResponse(query) {
    console.log('Generating AI response for:', query);
    
    // Normalize query
    const normalizedQuery = query.toLowerCase().trim();
    console.log('Normalized query:', normalizedQuery);

    // Math problem solving (prioritize this)
    const mathRegex = /^\s*\d+\s*[+\-*/]\s*\d+\s*$/;
    console.log('Math regex test:', mathRegex.test(normalizedQuery));
    
    if (mathRegex.test(normalizedQuery)) {
        console.log('Detected math problem, solving...');
        return solveMathProblem(query);
    }

    // Predefined knowledge base for child-friendly responses
    const knowledgeBase = {
        // Math concepts
        'what is multiplication': "Multiplication is a way of adding the same number multiple times. For example, 3 × 4 means adding 3 four times: 3 + 3 + 3 + 3 = 12.",
        'what is addition': "Addition is combining numbers to find their total. When you add 2 + 2, you're putting two groups together to get 4.",
        'what is subtraction': "Subtraction is taking away one number from another. When you subtract 5 - 3, you're finding out how many are left after removing 3 from 5.",
        
        // Science questions
        'what is photosynthesis': "Photosynthesis is how plants make their own food using sunlight, water, and carbon dioxide. It's like the plant's way of cooking its own meal!",
        'how do plants grow': "Plants grow by using sunlight, water, and nutrients from the soil. They need these things to make food and become bigger and stronger.",
        
        // General knowledge
        'what is the solar system': "The solar system is a group of planets, moons, asteroids, and comets that orbit around the Sun. Our planet Earth is one of these planets!",
        
        // Safety and internet
        'how to stay safe online': "To stay safe online: never share personal information, always ask a parent before downloading anything, and be careful about talking to strangers.",
        
        // Default responses
        'default': [
            "That's an interesting question! I'm still learning about that.",
            "Hmm, I'm not sure about the exact answer, but I'd love to help you find out more!",
            "Great question! Let me try to find some information for you."
        ]
    };

    // Check for exact matches in knowledge base
    for (const [key, value] of Object.entries(knowledgeBase)) {
        if (normalizedQuery.includes(key)) {
            return typeof value === 'string' ? value : value[0];
        }
    }

    // If no match, return a default response
    const defaultResponses = knowledgeBase['default'];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Enhanced AI Search Helper
async function performAISearch(query) {
    try {
        // First, try to generate an AI-like response
        const aiResponse = generateAIResponse(query);
        
        if (aiResponse) {
            addBotMessage(aiResponse);
            return;
        }
        
        // If no direct response, perform a web search
        const webResults = await searchWeb(query);
        
        if (webResults && webResults.length > 0) {
            let responseMessage = "Here's what I found:\n";
            webResults.forEach((result, index) => {
                responseMessage += `${index + 1}. ${result.title}\n${result.snippet}\n\n`;
            });
            addBotMessage(responseMessage);
        } else {
            addBotMessage("Sorry, I couldn't find any helpful information about that. Maybe try a different question?");
        }
    } catch (error) {
        console.error('AI Search Error:', error);
        addBotMessage("Oops! Something went wrong while searching. Let's try again later.");
    }
}

// Initial greeting
function addInitialGreeting() {
    const greeting = "Hi! I'm your SafeSearch helper! I'm here to keep you safe online!  How can I help you today?";
    addBotMessage(greeting);
}

// Dark Mode Functionality
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Load dark mode preference from Chrome storage
    chrome.storage.sync.get(['darkMode'], (result) => {
        const isDarkMode = result.darkMode || false;
        darkModeToggle.checked = isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
    });

    // Toggle dark mode
    darkModeToggle.addEventListener('change', () => {
        const isDarkMode = darkModeToggle.checked;
        document.body.classList.toggle('dark-mode', isDarkMode);
        
        // Save dark mode preference to Chrome storage
        chrome.storage.sync.set({ darkMode: isDarkMode });
    });
}
