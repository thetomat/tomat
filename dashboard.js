// Dashboard JavaScript functionality

class Dashboard {
    constructor() {
        this.user = null;
        this.servers = [];
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
    }

    checkAuthentication() {
        // Check if user is authenticated by looking for auth data in URL or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            // Handle OAuth callback
            this.handleAuthCallback(code);
        } else {
            // Check localStorage for existing auth
            const storedAuth = localStorage.getItem('shockwave_auth');
            if (storedAuth) {
                try {
                    this.user = JSON.parse(storedAuth);
                    this.showDashboard();
                } catch (e) {
                    localStorage.removeItem('shockwave_auth');
                    this.showAuthSection();
                }
            } else {
                this.showAuthSection();
            }
        }
    }

    handleAuthCallback(code) {
        // In a real implementation, this would exchange the code for tokens
        // For demo purposes, we'll simulate successful authentication
        console.log('Auth code received:', code);
        
        // Simulate user data (in real implementation, fetch from Discord API)
        this.user = {
            id: '123456789012345678',
            username: 'DemoUser',
            discriminator: '0001',
            avatar: 'https://cdn.discordapp.com/embed/avatars/0.png'
        };
        
        // Store auth data
        localStorage.setItem('shockwave_auth', JSON.stringify(this.user));
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        this.showDashboard();
    }

    showAuthSection() {
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('dashboard-content').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        
        this.loadUserData();
        this.loadServers();
    }

    loadUserData() {
        if (this.user) {
            document.getElementById('user-avatar').src = this.user.avatar;
            document.getElementById('user-name').textContent = this.user.username;
            document.getElementById('user-id').textContent = `#${this.user.discriminator}`;
        }
    }

    loadServers() {
        // Simulate loading servers (in real implementation, fetch from Discord API)
        // This would check which servers the user is admin in and has the bot
        this.servers = [
            {
                id: '987654321098765432',
                name: 'My Gaming Server',
                icon: 'https://cdn.discordapp.com/icons/987654321098765432/abc123.png',
                memberCount: 1250,
                botInstalled: true,
                botOnline: true
            },
            {
                id: '876543210987654321',
                name: 'Development Hub',
                icon: null, // No custom icon
                memberCount: 45,
                botInstalled: true,
                botOnline: false
            },
            {
                id: '765432109876543210',
                name: 'Community Server',
                icon: 'https://cdn.discordapp.com/icons/765432109876543210/def456.png',
                memberCount: 3400,
                botInstalled: true,
                botOnline: true
            }
        ];

        this.renderServers();
    }

    renderServers() {
        const serversList = document.getElementById('servers-list');
        serversList.innerHTML = '';

        if (this.servers.length === 0) {
            serversList.innerHTML = `
                <div class="no-servers">
                    <i class="fas fa-server"></i>
                    <h3>No servers found</h3>
                    <p>You don't have admin access to any servers with Shockwave installed.</p>
                </div>
            `;
            return;
        }

        this.servers.forEach(server => {
            const serverCard = document.createElement('div');
            serverCard.className = 'server-card';
            serverCard.innerHTML = `
                <div class="server-header">
                    <div class="server-icon">
                        ${server.icon ? 
                            `<img src="${server.icon}" alt="${server.name}">` : 
                            server.name.charAt(0).toUpperCase()
                        }
                    </div>
                    <div class="server-info">
                        <h3>${server.name}</h3>
                        <p>Server ID: ${server.id}</p>
                    </div>
                </div>
                <div class="server-stats">
                    <div class="server-stat">
                        <span class="stat-number">${server.memberCount.toLocaleString()}</span>
                        <span class="stat-label">Members</span>
                    </div>
                    <div class="server-stat">
                        <span class="stat-number">${server.botOnline ? 'Online' : 'Offline'}</span>
                        <span class="stat-label">Bot Status</span>
                    </div>
                </div>
                <div class="bot-status ${server.botOnline ? 'online' : 'offline'}">
                    ${server.botOnline ? 'Bot Active' : 'Bot Offline'}
                </div>
            `;

            serverCard.addEventListener('click', () => {
                this.selectServer(server);
            });

            serversList.appendChild(serverCard);
        });
    }

    selectServer(server) {
        // In a real implementation, this would navigate to server settings
        console.log('Selected server:', server);
        alert(`Server "${server.name}" selected! This would open the server management panel.`);
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    logout() {
        localStorage.removeItem('shockwave_auth');
        this.user = null;
        this.servers = [];
        this.showAuthSection();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});

// Add some CSS for no-servers state
const style = document.createElement('style');
style.textContent = `
    .no-servers {
        text-align: center;
        padding: 3rem 2rem;
        background: var(--bg-tertiary);
        border-radius: 15px;
        border: 1px solid rgba(220, 38, 38, 0.1);
        grid-column: 1 / -1;
    }
    
    .no-servers i {
        font-size: 3rem;
        color: var(--text-muted);
        margin-bottom: 1rem;
    }
    
    .no-servers h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
    }
    
    .no-servers p {
        color: var(--text-secondary);
        font-size: 1rem;
    }
`;
document.head.appendChild(style);
