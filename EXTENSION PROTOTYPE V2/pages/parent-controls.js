document.addEventListener('DOMContentLoaded', async function() {
    const loginSection = document.getElementById('loginSection');
    const controlsSection = document.getElementById('controlsSection');
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');
    const saveButton = document.getElementById('saveControls');
    const saveMessage = document.getElementById('saveMessage');

    // Load saved settings
    const settings = await chrome.storage.local.get([
        'lockSettings',
        'forceSafeMode',
        'schedule',
        'allowOverride',
        'filterLevel',
        'parentPassword'
    ]);

    // Login button handler
    loginButton.addEventListener('click', async function() {
        const password = document.getElementById('password').value;
        const savedPassword = settings.parentPassword || '1234'; // Default password

        if (password === savedPassword) {
            loginSection.style.display = 'none';
            controlsSection.style.display = 'block';
            errorMessage.style.display = 'none';

            // Initialize controls with saved values
            document.getElementById('lockSettings').checked = settings.lockSettings !== false;
            document.getElementById('forceSafeMode').checked = settings.forceSafeMode !== false;
            document.getElementById('schedule').value = settings.schedule || 'always';
            document.getElementById('allowOverride').checked = settings.allowOverride || false;
            document.getElementById('filterLevel').value = settings.filterLevel || 'strict';
        } else {
            errorMessage.style.display = 'block';
            document.getElementById('password').value = '';
        }
    });

    // Save controls button handler
    saveButton.addEventListener('click', async function() {
        const newSettings = {
            lockSettings: document.getElementById('lockSettings').checked,
            forceSafeMode: document.getElementById('forceSafeMode').checked,
            schedule: document.getElementById('schedule').value,
            allowOverride: document.getElementById('allowOverride').checked,
            filterLevel: document.getElementById('filterLevel').value
        };

        // Save to storage
        await chrome.storage.local.set(newSettings);

        // Show success message
        saveMessage.style.display = 'block';
        saveMessage.textContent = 'Parent controls saved successfully! 🔒';

        // Hide message after 3 seconds
        setTimeout(() => {
            saveMessage.style.display = 'none';
        }, 3000);

        // Notify background script of settings change
        chrome.runtime.sendMessage({ 
            action: 'parentControlsUpdated',
            settings: newSettings
        });
    });

    // Handle Enter key in password field
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });
});
