// Search functionality for SafeSearch Kids
document.addEventListener('DOMContentLoaded', () => {
    console.log('Search script loaded successfully');
    
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchSuggestions = document.getElementById('search-suggestions');
    const mascotMessage = document.getElementById('mascot-message');
    
    console.log('DOM Elements:', {
        searchInput,
        searchBtn,
        searchSuggestions,
        mascotMessage
    });

    // Create search results container and append to the search section
    const searchSection = document.querySelector('.search-section');
    const searchResultsContainer = document.createElement('div');
    searchResultsContainer.id = 'search-results';
    searchResultsContainer.classList.add('search-results');
    searchSection.appendChild(searchResultsContainer);

    // Safe search API endpoint
    const DUCKDUCKGO_API = 'https://api.duckduckgo.com/';

    // Sanitize query to remove potentially harmful content
    function sanitizeQuery(query) {
        const unsafePatterns = [
            'porn', 'xxx', 'adult', 'sex', 'nude', 
            'erotic', 'gambling', 'drugs', 'violence',
            'explicit', 'mature', 'inappropriate'
        ];

        let sanitized = query.toLowerCase();
        unsafePatterns.forEach(pattern => {
            sanitized = sanitized.replace(new RegExp(pattern, 'gi'), '');
        });

        return sanitized.trim();
    }

    // Perform safe search
    async function performSafeSearch(query) {
        const sanitizedQuery = sanitizeQuery(query);
        
        try {
            const params = new URLSearchParams({
                q: sanitizedQuery,
                format: 'json',
                pretty: '1',
                skip_disambig: '1'
            });

            const response = await fetch(`${DUCKDUCKGO_API}?${params}`);
            
            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            return processSearchResults(data, sanitizedQuery);
        } catch (error) {
            console.error('Safe Search Error:', error);
            updateMascotMessage("Oops! Something went wrong. Let's try again! 🤔");
            return null;
        }
    }

    // Process and filter search results
    function processSearchResults(data, originalQuery) {
        const safeResults = {
            organic_results: [],
            related_searches: []
        };

        // Process Abstract
        if (data.Abstract) {
            safeResults.organic_results.push({
                title: data.Heading || originalQuery,
                link: data.AbstractURL || '',
                snippet: data.Abstract
            });
        }

        // Process Related Topics
        if (data.RelatedTopics) {
            const additionalResults = data.RelatedTopics
                .filter(topic => isSafeResult(topic))
                .map(topic => ({
                    title: topic.Text.split(' - ')[0],
                    link: topic.FirstURL || '',
                    snippet: topic.Text
                }))
                .slice(0, 5);

            safeResults.organic_results.push(...additionalResults);
        }

        // Generate kid-friendly related searches
        safeResults.related_searches = generateRelatedSearches(originalQuery);

        return safeResults;
    }

    // Check if a result is safe
    function isSafeResult(result) {
        const unsafeDomains = [
            'pornhub.com', 'xvideos.com', 'gambling.com',
            'bet365.com', 'adult', 'xxx', 'nsfw'
        ];

        const unsafeWords = [
            'porn', 'nude', 'sex', 'erotic', 
            'gambling', 'betting', 'drugs', 'violence',
            'explicit', 'mature', 'inappropriate'
        ];

        const content = JSON.stringify(result).toLowerCase();
        
        const isDomainSafe = !unsafeDomains.some(domain => 
            content.includes(domain)
        );

        const isContentSafe = !unsafeWords.some(word => 
            content.includes(word)
        );

        return isDomainSafe && isContentSafe;
    }

    // Generate kid-friendly related searches
    function generateRelatedSearches(query) {
        const safeRelatedSearches = [
            `${query} for kids`,
            `safe ${query}`,
            `educational ${query}`,
            `kid-friendly ${query}`,
            `learning about ${query}`
        ];

        return safeRelatedSearches.slice(0, 5);
    }

    // Render search results
    function renderSearchResults(results) {
        console.log('Rendering search results:', results);
        searchResultsContainer.innerHTML = ''; // Clear previous results

        if (!results || results.organic_results.length === 0) {
            updateMascotMessage("Hmm, I couldn't find safe results for that. Try something else! 🤔");
            return;
        }

        // Render organic results
        results.organic_results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.classList.add('search-result');
            resultElement.innerHTML = `
                <h3><a href="${result.link}" target="_blank">${result.title}</a></h3>
                <p>${result.snippet}</p>
                <a href="${result.link}" target="_blank" class="result-link">Learn More</a>
            `;
            searchResultsContainer.appendChild(resultElement);
        });

        // Render related searches
        if (results.related_searches.length > 0) {
            const relatedSearchesElement = document.createElement('div');
            relatedSearchesElement.classList.add('related-searches');
            relatedSearchesElement.innerHTML = `
                <h4>Related Searches</h4>
                <div class="related-search-list">
                    ${results.related_searches.map(search => 
                        `<span class="related-search-item">${search}</span>`
                    ).join('')}
                </div>
            `;
            searchResultsContainer.appendChild(relatedSearchesElement);

            // Add click event to related searches
            const relatedSearchItems = relatedSearchesElement.querySelectorAll('.related-search-item');
            relatedSearchItems.forEach(item => {
                item.addEventListener('click', () => {
                    searchInput.value = item.textContent;
                    performSearch(item.textContent);
                });
            });
        }
    }

    // Handle search button click
    searchBtn.addEventListener('click', () => {
        console.log('Search button clicked');
        const query = searchInput.value.trim();
        if (query) {
            console.log('Performing search for:', query);
            performSearch(query);
        } else {
            console.log('No query entered');
        }
    });

    // Handle enter key press
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            console.log('Enter key pressed');
            const query = searchInput.value.trim();
            if (query) {
                console.log('Performing search for:', query);
                performSearch(query);
            } else {
                console.log('No query entered');
            }
        }
    });

    // Main search function
    async function performSearch(query) {
        console.log('Performing safe search for:', query);
        
        // Show searching message
        updateMascotMessage(`I'm searching for safe content about ${query} 🔍`);
        
        // Perform safe search
        const results = await performSafeSearch(query);
        
        // Render results
        renderSearchResults(results);
    }

    // Update mascot message function
    function updateMascotMessage(text) {
        mascotMessage.textContent = text;
        mascotMessage.classList.add('animate__animated', 'animate__bounceIn');
        setTimeout(() => {
            mascotMessage.classList.remove('animate__animated', 'animate__bounceIn');
        }, 1000);
    }

    // Initial mascot message
    updateMascotMessage("Hi! I'm Owly! Let's search for something fun and safe! 🦉");

    // Optional: Add search suggestions
    if (searchSuggestions) {
        const suggestedSearches = [
            'Science Experiments',
            'Educational Games',
            'Space Exploration',
            'Animal Facts',
            'Art and Crafts'
        ];

        suggestedSearches.forEach(search => {
            const suggestionElement = document.createElement('div');
            suggestionElement.classList.add('suggestion');
            suggestionElement.textContent = search;
            suggestionElement.addEventListener('click', () => {
                searchInput.value = search;
                performSearch(search);
            });
            searchSuggestions.appendChild(suggestionElement);
        });
    }
});
