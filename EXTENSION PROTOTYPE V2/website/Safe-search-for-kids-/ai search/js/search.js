// Search functionality for SafeSearch Kids
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchButton');
    const searchResults = document.getElementById('resultsSection');
    const mascotMessage = document.getElementById('mascotMessage');

    // Handle search button click
    searchBtn.addEventListener('click', function() {
        performSearch();
    });

    // Handle enter key press
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Update mascot message while typing
    searchInput.addEventListener('input', function(e) {
        if (e.target.value) {
            mascotMessage.textContent = "Let's find something interesting! 🔍";
        } else {
            mascotMessage.textContent = "Hi! I'm Owly! Let's search for something fun and safe! 🦉";
            searchResults.innerHTML = '';
        }
    });

    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            mascotMessage.textContent = "Searching for " + query + "... 🔍";
            searchResults.innerHTML = '<div class="loading">Searching... 🔍</div>';

            // Using Wikipedia API for safe, educational content
            const wikiApiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=10&format=json&origin=*&srsearch=${encodeURIComponent(query)}`;

            fetch(wikiApiUrl)
                .then(response => response.json())
                .then(data => {
                    const results = data.query.search;
                    if (results.length > 0) {
                        searchResults.innerHTML = '<div class="results-list">' +
                            results.map(result => `
                                <div class="result-item animate__animated animate__fadeIn">
                                    <h3>${result.title}</h3>
                                    <p>${result.snippet.replace(/(<([^>]+)>)/gi, '')}</p>
                                    <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}" 
                                       target="_blank" 
                                       class="read-more">
                                        Read More on Wikipedia 📚
                                    </a>
                                </div>
                            `).join('') +
                            '</div>';
                        mascotMessage.textContent = "Here's what I found! Keep learning! 🌟";
                    } else {
                        searchResults.innerHTML = '<div class="no-results">No results found. Try different keywords! 🤔</div>';
                        mascotMessage.textContent = "Hmm, let's try searching for something else! 🤔";
                    }
                })
                .catch(error => {
                    console.error('Search error:', error);
                    searchResults.innerHTML = '<div class="error">Oops! Something went wrong. Please try again! 😅</div>';
                    mascotMessage.textContent = "Oops! Something went wrong. Let's try again! 😅";
                });
        } else {
            mascotMessage.textContent = "Oops! Please type something to search for! 🤔";
            searchResults.innerHTML = '';
        }
    }
});
