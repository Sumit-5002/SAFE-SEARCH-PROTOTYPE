// Content script for SafeSearch Kids

// Function to check page content
function checkPageContent() {
    // Get all text content from the page
    const content = document.body.innerText;
    
    // Send content to background script for checking
    chrome.runtime.sendMessage({
        action: "checkContent",
        content: content
    });
}

// Initialize content script
function initialize() {
    // Check content when page loads
    if (document.readyState === 'complete') {
        checkPageContent();
    } else {
        document.addEventListener('DOMContentLoaded', checkPageContent);
    }

    // Create observer for dynamic content
    const observer = new MutationObserver(() => {
        checkPageContent();
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// Start the script
if (document.body) {
    initialize();
} else {
    document.addEventListener('DOMContentLoaded', initialize);
}
