// Search functionality for SafeSearch Kids
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchSuggestions = document.getElementById('search-suggestions');
    const mascotMessage = document.getElementById('mascot-message');
    
    // Connect to the extension
    const port = chrome.runtime.connect({ name: 'search-connection' });

    // Listen for messages from the extension
    port.onMessage.addListener((message) => {
        if (message.type === 'searchResults') {
            handleSearchResults(message.results);
        } else if (message.type === 'mascotMessage') {
            updateMascotMessage(message.text);
        }
    });

    // Handle search input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 2) {
            port.postMessage({
                type: 'getSuggestions',
                query: query
            });
        } else {
            searchSuggestions.innerHTML = '';
        }
    });

    // Handle search button click
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });

    // Handle enter key press
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });

    function performSearch(query) {
        // Show searching message
        updateMascotMessage("I'm searching for safe content about " + query + " 🔍");
        
        // Send search request to extension
        port.postMessage({
            type: 'performSearch',
            query: query
        });
    }

    function handleSearchResults(results) {
        // Handle the search results
        if (results && results.length > 0) {
            updateMascotMessage("Here's what I found! Stay curious and safe! 🌟");
            // Handle displaying results (implement based on your UI)
        } else {
            updateMascotMessage("Hmm, I couldn't find safe results for that. Try something else! 🤔");
        }
    }

    function updateMascotMessage(text) {
        mascotMessage.textContent = text;
        mascotMessage.classList.add('animate__animated', 'animate__bounceIn');
        setTimeout(() => {
            mascotMessage.classList.remove('animate__animated', 'animate__bounceIn');
        }, 1000);
    }
});
