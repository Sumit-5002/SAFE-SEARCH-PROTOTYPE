class ParentDashboard {
    constructor() {
        this.activityFeed = document.getElementById('activity-feed');
        this.currentActivity = document.getElementById('current-activity');
        this.sessionTimer = document.getElementById('session-timer');
        this.vpnStatus = document.getElementById('vpn-status');
        this.alertContainer = document.getElementById('alert-container');
        
        this.setupWebSocket();
        this.checkAuth();
        this.startMonitoring();
    }

    checkAuth() {
        const session = JSON.parse(localStorage.getItem('safeSearchSession'));
        if (!session || session.userType !== 'parent' || new Date().getTime() > session.expiresAt) {
            window.location.href = '/signin.html';
        }
    }

    setupWebSocket() {
        // Setup WebSocket connection for real-time updates
        this.ws = new WebSocket('wss://your-websocket-server/dashboard');
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };

        this.ws.onclose = () => {
            // Attempt to reconnect
            setTimeout(() => this.setupWebSocket(), 5000);
        };
    }

    handleWebSocketMessage(data) {
        switch(data.type) {
            case 'activity':
                this.updateActivityFeed(data.activity);
                break;
            case 'vpn_detected':
                this.handleVPNDetection(data.details);
                break;
            case 'timer_update':
                this.updateTimer(data.timeRemaining);
                break;
            case 'alert':
                this.showAlert(data.message, data.level);
                break;
        }
    }

    startMonitoring() {
        // Fetch initial data
        this.fetchActivityLog();
        this.checkVPNStatus();
        this.startSessionTimer();

        // Set up polling for VPN status
        setInterval(() => this.checkVPNStatus(), 30000); // Check every 30 seconds
    }

    async fetchActivityLog() {
        try {
            const response = await fetch('/api/activity-log', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('safeSearchToken')}`
                }
            });
            
            const activities = await response.json();
            this.renderActivityLog(activities);
        } catch (error) {
            console.error('Failed to fetch activity log:', error);
        }
    }

    renderActivityLog(activities) {
        const activityHTML = activities.map(activity => `
            <div class="activity-item ${activity.type}">
                <div class="activity-time">${new Date(activity.timestamp).toLocaleTimeString()}</div>
                <div class="activity-details">
                    <strong>${activity.type}:</strong> ${activity.details}
                </div>
            </div>
        `).join('');

        this.activityFeed.innerHTML = activityHTML;
    }

    async checkVPNStatus() {
        try {
            const response = await fetch('/api/check-vpn', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('safeSearchToken')}`
                }
            });
            
            const { vpnDetected } = await response.json();
            this.updateVPNStatus(vpnDetected);
        } catch (error) {
            console.error('Failed to check VPN status:', error);
        }
    }

    updateVPNStatus(detected) {
        this.vpnStatus.className = detected ? 'status-danger' : 'status-safe';
        this.vpnStatus.innerHTML = detected ? 
            '<span>⚠️ VPN Detected!</span>' :
            '<span>✓ No VPN Detected</span>';

        if (detected) {
            this.showAlert('VPN usage detected! Child may be attempting to bypass filters.', 'danger');
        }
    }

    startSessionTimer() {
        const session = JSON.parse(localStorage.getItem('safeSearchSession'));
        if (!session) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const timeLeft = Math.max(0, session.expiresAt - now);
            
            if (timeLeft === 0) {
                clearInterval(this.timerInterval);
                this.showAlert('Child\'s session has expired', 'info');
            }

            this.updateTimer(timeLeft);
        };

        updateTimer();
        this.timerInterval = setInterval(updateTimer, 1000);
    }

    updateTimer(timeLeft) {
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        this.sessionTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateActivityFeed(activity) {
        const activityElement = document.createElement('div');
        activityElement.className = `activity-item ${activity.type}`;
        activityElement.innerHTML = `
            <div class="activity-time">${new Date(activity.timestamp).toLocaleTimeString()}</div>
            <div class="activity-details">
                <strong>${activity.type}:</strong> ${activity.details}
            </div>
        `;

        this.activityFeed.insertBefore(activityElement, this.activityFeed.firstChild);
        this.currentActivity.textContent = activity.details;
    }

    showAlert(message, level = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${level}`;
        alert.textContent = message;

        this.alertContainer.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Initialize dashboard when document is ready
document.addEventListener('DOMContentLoaded', () => {
    new ParentDashboard();
});
