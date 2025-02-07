// Content safety script
const BLUR_STYLE = 'filter: blur(30px) grayscale(1); transition: filter 0.3s;';
const WARNING_STYLE = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 107, 107, 0.9);
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    font-family: 'Comic Sans MS', cursive;
    z-index: 999999;
`;

// Create blur overlay
function createBlurOverlay(element, reason) {
    const container = document.createElement('div');
    container.style.cssText = `
        position: relative;
        display: inline-block;
    `;

    const warning = document.createElement('div');
    warning.style.cssText = WARNING_STYLE;
    warning.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 10px;">🚫</div>
        <div style="font-size: 16px; margin-bottom: 10px;">This content might not be safe for kids</div>
        <div style="font-size: 14px; color: #FFE0E0;">${reason}</div>
    `;

    element.parentNode.insertBefore(container, element);
    container.appendChild(element);
    container.appendChild(warning);
    element.style.cssText += BLUR_STYLE;
}

// Check text content
async function checkText(text) {
    try {
        const response = await fetch('https://api.textclassification.dev/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                categories: ['adult', 'violence', 'hate', 'drugs']
            })
        });

        if (response.ok) {
            const data = await response.json();
            return {
                safe: !Object.values(data.scores).some(score => score > 0.7),
                reason: Object.entries(data.scores)
                    .filter(([_, score]) => score > 0.7)
                    .map(([category]) => category)
                    .join(', ')
            };
        }
        return { safe: true, reason: '' };
    } catch (error) {
        console.error('Text classification error:', error);
        return { safe: true, reason: '' };
    }
}

// Check image content
async function checkImage(imageUrl) {
    try {
        const response = await fetch('https://nsfw.api.dev/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: imageUrl })
        });

        if (response.ok) {
            const data = await response.json();
            return {
                safe: !data.unsafe,
                reason: data.unsafe ? 'Inappropriate image content detected' : ''
            };
        }
        return { safe: true, reason: '' };
    } catch (error) {
        console.error('Image classification error:', error);
        return { safe: true, reason: '' };
    }
}

// Process text elements
async function processTextElements() {
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
    
    for (const element of textElements) {
        if (element.innerText.trim().length > 10) {
            const result = await checkText(element.innerText);
            if (!result.safe) {
                createBlurOverlay(element, `Contains inappropriate content: ${result.reason}`);
            }
        }
    }
}

// Process image elements
async function processImages() {
    const images = document.querySelectorAll('img');
    
    for (const img of images) {
        if (img.src) {
            const result = await checkImage(img.src);
            if (!result.safe) {
                createBlurOverlay(img, result.reason);
            }
        }
    }
}

// Process video elements
function processVideos() {
    const videos = document.querySelectorAll('video');
    
    for (const video of videos) {
        // Always blur videos by default as they can't be analyzed in real-time
        createBlurOverlay(video, 'Video content needs parent verification');
    }
}

// Main content processing
async function processPageContent() {
    await Promise.all([
        processTextElements(),
        processImages()
    ]);
    processVideos();
}

// Listen for dynamic content changes
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            processPageContent();
        }
    }
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial processing
processPageContent();
