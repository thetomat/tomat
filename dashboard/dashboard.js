// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loadingScreen = document.getElementById('loading');
    const authErrorScreen = document.getElementById('auth-error');
    const dashboardContent = document.getElementById('dashboard-content');
    const retryAuthBtn = document.getElementById('retry-auth');
    const logoutBtn = document.getElementById('logout-btn');
    const serversContainer = document.getElementById('servers-container');
    
    // User elements
    const userAvatar = document.getElementById('user-avatar');
    const username = document.getElementById('username');
    const userId = document.getElementById('user-id');
    
    // Discord OAuth Configuration
    const CLIENT_ID = '1421445090945007637';
    const REDIRECT_URI = encodeURIComponent('https://tomat.nl/dashboard');
    const SCOPES = 'identify guilds';
    const OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}`;
    
    // Check for authorization code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    // Initialize dashboard
    function initDashboard() {
        if (code) {
            // We have an authorization code, exchange it for an access token
            exchangeCodeForToken(code);
        } else {
            // Check if we have a stored access token
            const accessToken = localStorage.getItem('shockwave_access_token');
            if (accessToken) {
                // Validate token and load user data
                loadUserData(accessToken);
            } else {
                // No token, show auth error
                showAuthError();
            }
        }
    }
    
    // Exchange authorization code for access token
    function exchangeCodeForToken(authCode) {
        // In a real implementation, this would be done on your server
        // For this example, we'll simulate the process
        
        // Show loading screen
        loadingScreen.classList.remove('hidden');
        authErrorScreen.classList.add('hidden');
        dashboardContent.classList.add('hidden');
        
        // Simulate API call delay
        setTimeout(() => {
            // In a real implementation, you would make a POST request to your server
            // which would then exchange the code for an access token with Discord
            
            // For this example, we'll generate a mock token
            const mockToken = 'mock_access_token_' + Date.now();
            localStorage.setItem('shockwave_access_token', mockToken);
            
            // Load user data with the token
            loadUserData(mockToken);
        }, 2000);
    }
    
    // Load user data with access token
    function loadUserData(accessToken) {
        // Show loading screen
        loadingScreen.classList.remove('hidden');
        authErrorScreen.classList.add('hidden');
        dashboardContent.classList.add('hidden');
        
        // Simulate API call delay
        setTimeout(() => {
            // In a real implementation, you would make API calls to:
            // 1. Get user data: https://discord.com/api/users/@me
            // 2. Get user guilds: https://discord.com/api/users/@me/guilds
            
            // For this example, we'll use mock data
            const mockUser = {
                id: '123456789012345678',
                username: 'ShockwaveUser',
                avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
                discriminator: '1234'
            };
            
            const mockGuilds = [
                {
                    id: '111111111111111111',
                    name: 'Gaming Community',
                    icon: 'https://cdn.discordapp.com/icons/111111111111111111/abcdef1234567890.png',
                    owner: false,
                    permissions: 8 // Administrator
                },
                {
                    id: '222222222222222222',
                    name: 'Tech Enthusiasts',
                    icon: 'https://cdn.discordapp.com/icons/222222222222222222/abcdef1234567890.png',
                    owner: true,
                    permissions: 8 // Administrator
                },
                {
                    id: '333333333333333333',
                    name: 'Music Lovers',
                    icon: null,
                    owner: false,
                    permissions: 1024 // Send Messages
                }
            ];
            
            // Update user info
            userAvatar.src = mockUser.avatar;
            username.textContent = `${mockUser.username}#${mockUser.discriminator}`;
            userId.textContent = `ID: ${mockUser.id}`;
            
            // Filter guilds where user has admin permissions and Shockwave is present
            const adminGuilds = mockGuilds.filter(guild => {
                // Check if user has administrator permission (permission value 8)
                const hasAdmin = (guild.permissions & 8) === 8;
                // In a real implementation, you would also check if Shockwave is in the guild
                const shockwaveInGuild = true; // Mock value
                return hasAdmin && shockwaveInGuild;
            });
            
            // Display servers
            displayServers(adminGuilds);
            
            // Hide loading and show dashboard
            loadingScreen.classList.add('hidden');
            dashboardContent.classList.remove('hidden');
        }, 1500);
    }
    
    // Display servers in the dashboard
    function displayServers(guilds) {
        if (guilds.length === 0) {
            serversContainer.innerHTML = `
                <div class="server-placeholder">
                    <div class="placeholder-icon">
                        <i class="fas fa-server"></i>
                    </div>
                    <p>No servers found where you have administrative permissions and Shockwave is installed.</p>
                    <button class="cta-button" style="margin-top: 20px;">
                        <i class="fas fa-plus"></i> Add Shockwave to a Server
                    </button>
                </div>
            `;
            return;
        }
        
        let serversHTML = '';
        guilds.forEach(guild => {
            const iconUrl = guild.icon 
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` 
                : '../ShockwaveIcon.png';
                
            serversHTML += `
                <div class="server-card">
                    <div class="server-icon">
                        <img src="${iconUrl}" alt="${guild.name}">
                    </div>
                    <h3>${guild.name}</h3>
                    <p>${guild.owner ? 'Owner' : 'Administrator'}</p>
                    <div class="server-actions">
                        <button class="manage-btn" data-guild-id="${guild.id}">
                            <i class="fas fa-cog"></i> Manage
                        </button>
                        <button class="invite-btn" data-guild-id="${guild.id}">
                            <i class="fas fa-user-plus"></i> Invite
                        </button>
                    </div>
                </div>
            `;
        });
        
        serversContainer.innerHTML = serversHTML;
        
        // Add event listeners to manage buttons
        document.querySelectorAll('.manage-btn').forEach(button => {
            button.addEventListener('click', function() {
                const guildId = this.getAttribute('data-guild-id');
                alert(`Manage settings for server ID: ${guildId}\n(This would open the server configuration page)`);
            });
        });
        
        // Add event listeners to invite buttons
        document.querySelectorAll('.invite-btn').forEach(button => {
            button.addEventListener('click', function() {
                const guildId = this.getAttribute('data-guild-id');
                alert(`Invite users to server ID: ${guildId}\n(This would open the invite management page)`);
            });
        });
    }
    
    // Show authentication error
    function showAuthError() {
        loadingScreen.classList.add('hidden');
        authErrorScreen.classList.remove('hidden');
        dashboardContent.classList.add('hidden');
    }
    
    // Event Listeners
    retryAuthBtn.addEventListener('click', function() {
        // Redirect to Discord OAuth
        window.location.href = OAUTH_URL;
    });
    
    logoutBtn.addEventListener('click', function() {
        // Clear stored token and redirect to auth
        localStorage.removeItem('shockwave_access_token');
        window.location.href = OAUTH_URL;
    });
    
    // Initialize the dashboard
    initDashboard();
});
