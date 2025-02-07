document.addEventListener('DOMContentLoaded', async function() {
    // Load saved settings
    const settings = await chrome.storage.local.get([
        'safeSearchEnabled',
        'blurEnabled',
        'aiEnabled',
        'timeLimit',
        'breakReminders'
    ]);

    // Initialize toggles with saved values
    document.getElementById('safeSearchToggle').checked = settings.safeSearchEnabled !== false;
    document.getElementById('blurToggle').checked = settings.blurEnabled !== false;
    document.getElementById('aiToggle').checked = settings.aiEnabled !== false;
    document.getElementById('breakReminders').checked = settings.breakReminders !== false;
    document.getElementById('timeLimit').value = settings.timeLimit || '7200';

    // Save settings button handler
    document.getElementById('saveSettings').addEventListener('click', async function() {
        const newSettings = {
            safeSearchEnabled: document.getElementById('safeSearchToggle').checked,
            blurEnabled: document.getElementById('blurToggle').checked,
            aiEnabled: document.getElementById('aiToggle').checked,
            timeLimit: parseInt(document.getElementById('timeLimit').value),
            breakReminders: document.getElementById('breakReminders').checked
        };

        // Save to storage
        await chrome.storage.local.set(newSettings);

        // Show success message
        const saveMessage = document.getElementById('saveMessage');
        saveMessage.style.display = 'block';
        saveMessage.textContent = 'Settings saved successfully! 🎉';

        // Hide message after 3 seconds
        setTimeout(() => {
            saveMessage.style.display = 'none';
        }, 3000);

        // Notify background script of settings change
        chrome.runtime.sendMessage({ 
            action: 'settingsUpdated',
            settings: newSettings
        });
    });
});
