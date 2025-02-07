// Constants for unsafe patterns
const UNSAFE_PATTERNS = [
    // Adult Content
    'porn', 'xxx', 'adult', 'sex', 'nude', 'naked', 'erotic', 'sensual', 'lust',
    'seduction', 'arousal', 'foreplay', 'intimacy', 'passion', 'orgasm', 'climax',
    'naughty', 'kinky', 'fetish', 'bdsm', 'dominant', 'submissive', 'bondage',
    'roleplay', 'fantasy', 'voyeur', 'masturbation', 'aphrodisiac', 'sexting',

    // Adult Industry
    'pornography', 'nsfw', 'hardcore', 'softcore', 'webcam', 'striptease',
    'lap dance', 'escort', 'brothel', 'massage parlor', 'adult film', 'adult star',
    'onlyfans', 'camgirl', 'sugar daddy', 'sugar baby', 'swingers', 'polyamory',
    'strip club', 'burlesque', 'risque',

    // Indian Adult Terms
    'item girl', 'desi romance', 'masala movie', 'tharak', 'kamukta', 'rati kriya',
    'jism', 'choli ke peeche', 'masti', 'aashiq', 'raat ki rani', 'tandoor garam',
    'suhaag raat', 'chumma', 'jhilmil', 'pataka', 'chatpata pyaar', 'dilbar',
    'rasleela', 'jhappi', 'bechaini', 'mohabbat',

    // Sexual Content
    'intercourse', 'making love', 'casual sex', 'one-night stand',
    'friends with benefits', 'hookup', 'kissing', 'oral', 'handcuffs', 'blindfold',
    'whip', 'paddle', 'submission', 'obedience', 'restraints', 'leather', 'latex',
    'adult toys', 'lingerie', 'strip poker', 'sensory play', 'pleasure',

    // Dating and Relationships
    'love affair', 'attraction', 'dating app', 'flirting', 'romantic getaway',
    'love triangle', 'infatuation', 'dating coach', 'passionate night',
    'midnight call', 'secret love',

    // Substances and Vices
    'alcohol', 'cigarettes', 'vaping', 'marijuana', 'gambling', 'casino', 'betting',
    'lottery', 'liquor', 'cocktail', 'nightclub', 'rave', 'hangover', 'drunk',
    'wild party', 'vip lounge', 'strip bar', 'adult magazine', 'private room',
    'red-light district'
];

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
    // Initialize storage
    await chrome.storage.local.set({
        blockedCount: 0,
        blockedSites: [],
        safeMode: true
    });

    // Update badge
    updateBlockedCount();
});

// Function to check content safety
function checkContentSafety(content) {
    const lowerContent = content.toLowerCase();
    return UNSAFE_PATTERNS.some(pattern => lowerContent.includes(pattern.toLowerCase()));
}

// Function to add URL to blocked list
async function addToBlockedSites(url) {
    try {
        const hostname = new URL(url).hostname;
        const { blockedSites = [] } = await chrome.storage.local.get('blockedSites');
        
        if (!blockedSites.includes(hostname)) {
            blockedSites.push(hostname);
            await chrome.storage.local.set({ blockedSites });
            
            // Increment blocked count
            const { blockedCount = 0 } = await chrome.storage.local.get('blockedCount');
            await chrome.storage.local.set({ blockedCount: blockedCount + 1 });
            updateBlockedCount();
        }
    } catch (error) {
        console.error('Error adding to blocked sites:', error);
    }
}

// Update badge with blocked count
async function updateBlockedCount() {
    const { blockedCount = 0 } = await chrome.storage.local.get('blockedCount');
    chrome.action.setBadgeText({ text: blockedCount.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
}

// Listen for rule matches
chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener(
    ({ request, rule }) => {
        console.log('Rule matched:', rule.id, 'for URL:', request.url);
        addToBlockedSites(request.url);
    }
);

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkContent") {
        const content = request.content.toLowerCase();
        const foundPatterns = UNSAFE_PATTERNS.filter(pattern => 
            content.includes(pattern.toLowerCase())
        );
        
        if (foundPatterns.length > 0 && sender.tab?.url) {
            addToBlockedSites(sender.tab.url);
        }
        
        sendResponse({
            unsafe: foundPatterns.length > 0,
            patterns: foundPatterns
        });
    }
    return true;
});

// Configuration
const PHISHING_DOMAINS_URL = 'https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-domains-ACTIVE.txt';

// Free AI and Safe Search APIs
const SAFE_SEARCH_APIS = {
    // Community-powered safe search API
    safesearch: {
        url: 'https://api.safesearch.dev/search',
        params: (query) => ({
            q: query,
            safesearch: 'strict'
        })
    },
    // Open source content classification
    textClassification: {
        url: 'https://api.textclassification.dev/classify',
        params: (text) => ({
            text: text,
            categories: ['adult', 'violence', 'hate', 'drugs']
        })
    },
    // Image safety check
    imageSafety: {
        url: 'https://nsfw.api.dev/check',
        params: (imageUrl) => ({
            url: imageUrl
        })
    }
};

// Initialize the extension
chrome.runtime.onInstalled.addListener(async () => {
    await chrome.storage.local.set({
        protectionEnabled: true,
        filterLevel: 'strict',
        timeLimit: 7200, // 2 hours default
        blockedDomains: new Set(),
        lastUpdate: 0,
        safeSearchEnabled: true,
        aiFilteringEnabled: true
    });

    // Initial update of block lists
    await updateBlockLists();
    
    // Schedule updates every 12 hours
    setInterval(updateBlockLists, 12 * 60 * 60 * 1000);
});

// AI-powered content analysis
async function analyzeContent(url, text, images) {
    try {
        const results = {
            safe: true,
            reasons: [],
            scores: {}
        };

        // Text classification
        if (text) {
            const textResponse = await fetch(SAFE_SEARCH_APIS.textClassification.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(SAFE_SEARCH_APIS.textClassification.params(text))
            });

            if (textResponse.ok) {
                const textData = await textResponse.json();
                for (const [category, score] of Object.entries(textData.scores)) {
                    if (score > 0.7) { // 70% threshold
                        results.safe = false;
                        results.reasons.push(`High ${category} content detected`);
                        results.scores[category] = score;
                    }
                }
            }
        }

        // Image safety check
        if (images && images.length > 0) {
            for (const imageUrl of images) {
                const imageResponse = await fetch(SAFE_SEARCH_APIS.imageSafety.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(SAFE_SEARCH_APIS.imageSafety.params(imageUrl))
                });

                if (imageResponse.ok) {
                    const imageData = await imageResponse.json();
                    if (imageData.unsafe) {
                        results.safe = false;
                        results.reasons.push(`Unsafe image content detected`);
                        results.scores.image = imageData.score;
                    }
                }
            }
        }

        return results;
    } catch (error) {
        console.error('Error in AI content analysis:', error);
        return { safe: true, reasons: ['AI analysis failed'], scores: {} };
    }
}

// Safe search integration
async function performSafeSearch(query) {
    try {
        const response = await fetch(SAFE_SEARCH_APIS.safesearch.url + '?' + new URLSearchParams(
            SAFE_SEARCH_APIS.safesearch.params(query)
        ));

        if (response.ok) {
            const data = await response.json();
            return {
                results: data.results,
                safe: data.safe,
                filtered: data.filtered
            };
        }
        return null;
    } catch (error) {
        console.error('Safe search error:', error);
        return null;
    }
}

// Update block lists
async function updateBlockLists() {
    try {
        const { lastUpdate } = await chrome.storage.local.get('lastUpdate');
        const now = Date.now();
        
        // Only update if more than 12 hours have passed
        if (now - lastUpdate < 12 * 60 * 60 * 1000) {
            console.log('Using cached block lists');
            return;
        }

        console.log('Updating block lists...');
        const blockedDomains = new Set();

        // Fetch and process phishing domains
        const response = await fetch(PHISHING_DOMAINS_URL);
        if (response.ok) {
            const text = await response.text();
            const domains = text.split('\n')
                .filter(line => line.trim())
                .map(line => line.trim().toLowerCase());
            
            domains.forEach(domain => blockedDomains.add(domain));
            console.log(`Added ${domains.length} phishing domains`);
        }

        // Save to storage
        await chrome.storage.local.set({
            blockedDomains: Array.from(blockedDomains),
            lastUpdate: now
        });

        // Update dynamic rules
        await updateDynamicRules(blockedDomains);
    } catch (error) {
        console.error('Error updating block lists:', error);
    }
}

// Create a rule for blocking a domain
function createBlockRule(domain, id) {
    return {
        id,
        priority: 1,
        action: { type: 'block' },
        condition: {
            urlFilter: `||${domain}`,
            resourceTypes: ['main_frame', 'sub_frame']
        }
    };
}

// Update dynamic rules in Chrome
async function updateDynamicRules(domains) {
    try {
        const { protectionEnabled } = await chrome.storage.local.get('protectionEnabled');
        if (!protectionEnabled) {
            const rules = await chrome.declarativeNetRequest.getDynamicRules();
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: rules.map(rule => rule.id),
                addRules: []
            });
            return;
        }

        // Convert domains to rules (max 5000 rules as per Chrome limits)
        const rules = Array.from(domains)
            .slice(0, 5000)
            .map((domain, index) => createBlockRule(domain, index + 1));

        // Update rules in chunks of 1000
        const CHUNK_SIZE = 1000;
        for (let i = 0; i < rules.length; i += CHUNK_SIZE) {
            const chunk = rules.slice(i, i + CHUNK_SIZE);
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: chunk.map(rule => rule.id),
                addRules: chunk
            });
        }

        console.log(`Updated ${rules.length} blocking rules`);
    } catch (error) {
        console.error('Error updating dynamic rules:', error);
    }
}

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'CHECK_URL':
            checkUrl(request.url, request.content).then(sendResponse);
            return true;
        case 'UPDATE_SETTINGS':
            handleSettingsUpdate(request.settings).then(sendResponse);
            return true;
        case 'GET_STATS':
            getStats().then(sendResponse);
            return true;
        case 'UPDATE_LISTS':
            updateBlockLists().then(sendResponse);
            return true;
        case 'SAFE_SEARCH':
            performSafeSearch(request.query).then(sendResponse);
            return true;
    }
});

// Update settings
async function handleSettingsUpdate(settings) {
    try {
        await chrome.storage.local.set(settings);
        if ('protectionEnabled' in settings) {
            const { blockedDomains } = await chrome.storage.local.get('blockedDomains');
            await updateDynamicRules(new Set(blockedDomains));
        }
        return { success: true };
    } catch (error) {
        console.error('Error updating settings:', error);
        return { success: false, error: error.message };
    }
}

// Get current stats
async function getStats() {
    try {
        const { blockedDomains, lastUpdate, safeSearchEnabled, aiFilteringEnabled } = 
            await chrome.storage.local.get([
                'blockedDomains',
                'lastUpdate',
                'safeSearchEnabled',
                'aiFilteringEnabled'
            ]);
        
        return {
            totalBlocked: blockedDomains.length,
            lastUpdate: new Date(lastUpdate).toISOString(),
            patterns: Object.keys(UNSAFE_PATTERNS).length,
            safeSearchEnabled,
            aiFilteringEnabled
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        return null;
    }
}

// Time tracking
let sessionStart = Date.now();
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    updateTimeTracking(tab);
});

function updateTimeTracking(tab) {
    chrome.storage.local.get(['timeLimit'], function(data) {
        const timeSpent = (Date.now() - sessionStart) / 1000;
        if (timeSpent >= data.timeLimit) {
            chrome.tabs.create({
                url: 'pages/time-limit.html'
            });
        }
    });
}

// Block page function
function blockPage(tabId) {
    chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL('pages/blocked.html')
    });
}

// Update content blocking logic to use the new blocked page
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    if (isUnsafeContent(details.url)) {
        blockPage(details.tabId);
    }
});

// Update content analysis function to use blocked page
async function analyzeContent(tabId, content) {
    const analysis = await performContentAnalysis(content);
    if (analysis.unsafe) {
        blockPage(tabId);
    }
}

// Function to check if content is unsafe
function isUnsafeContent(url) {
    // Implement logic to check if content is unsafe
    // For example, check against a list of known malicious URLs
    // or use a machine learning model to classify the content
    // For now, just return false
    return false;
}

// Function to perform content analysis
async function performContentAnalysis(content) {
    // Implement logic to perform content analysis
    // For example, use a machine learning model to classify the content
    // For now, just return a dummy result
    return { unsafe: false };
}

// Function to check content safety
function checkContentSafety(content) {
    const lowerContent = content.toLowerCase();
    return UNSAFE_PATTERNS.some(pattern => lowerContent.includes(pattern.toLowerCase()));
}

// Main blocking function
async function shouldBlockUrl(url) {
    // Check for unsafe patterns
    if (checkContentSafety(url)) {
        await addToBlockedSites(url);
        return true;
    }

    // Check if URL is in blocked list
    return await isUrlBlocked(url);
}

// Function to check if URL is in blocked list
async function isUrlBlocked(url) {
    const data = await chrome.storage.local.get('blockedSites');
    const blockedSites = data.blockedSites || [];
    return blockedSites.some(site => url.includes(site));
}

// Listen for navigation events
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // Skip extension pages
    if (details.url.startsWith(chrome.runtime.getURL(''))) {
        return;
    }

    const shouldBlock = await shouldBlockUrl(details.url);
    if (shouldBlock) {
        // Increment blocked count
        const data = await chrome.storage.local.get(['blockedCount']);
        await chrome.storage.local.set({
            blockedCount: (data.blockedCount || 0) + 1
        });

        // Update badge
        updateBlockedCount();

        // Redirect to blocked page
        chrome.tabs.update(details.tabId, {
            url: chrome.runtime.getURL('pages/blocked.html')
        });
    }
});

// Handle search connections
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'search-connection') {
        port.onMessage.addListener(async (message) => {
            switch (message.type) {
                case 'getSuggestions':
                    const suggestions = await getSafeSuggestions(message.query);
                    port.postMessage({
                        type: 'searchResults',
                        results: suggestions
                    });
                    break;
                    
                case 'performSearch':
                    const results = await performSafeSearch(message.query);
                    port.postMessage({
                        type: 'searchResults',
                        results: results
                    });
                    break;
            }
        });
    }
});

// Get safe search suggestions
async function getSafeSuggestions(query) {
    try {
        const response = await fetch(`https://api.safesearch.dev/suggestions?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data.suggestions.filter(suggestion => !containsUnsafeContent(suggestion));
    } catch (error) {
        console.error('Error getting suggestions:', error);
        return [];
    }
}

// Helper function to check for unsafe content in a string
function containsUnsafeContent(text) {
    return UNSAFE_PATTERNS.some(pattern => 
        text.toLowerCase().includes(pattern.toLowerCase())
    );
}
