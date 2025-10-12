// Dashboard functionality with real Discord OAuth
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authScreen = document.getElementById('auth-required');
    const loadingScreen = document.getElementById('loading');
    const errorScreen = document.getElementById('error-screen');
    const dashboardContent = document.getElementById('dashboard-content');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const retryBtn = document.getElementById('retry-btn');
    const serversContainer = document.getElementById('servers-container');
    const errorMessage = document.getElementById('error-message');
    
    // User elements
    const userAvatar = document.getElementById('user-avatar');
    const username = document.getElementById('username');
    const userId = document.getElementById('user-id');
    
    // Discord OAuth Configuration
    const CLIENT_ID = '1421445090945007637';
    const REDIRECT_URI = encodeURIComponent('https://tomat.nl/dashboard'); // CHANGE TO YOUR ACTUAL URL
    const SCOPES = 'identify%20guilds';
    const OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}`;
    
    // Backend URL (CHANGE THIS TO YOUR RENDER URL)
    const BACKEND_URL = 'https://backend-tk3p.onrender.com'; // UPDATE THIS
    
    // Check for user data or errors in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userDataParam = urlParams.get('user');
    const errorParam = urlParams.get('error');
    const codeParam = urlParams.get('code');
    
    // Initialize dashboard
    function initDashboard() {
        // Handle errors first
        if (errorParam) {
            showError(`Authentication failed: ${errorParam}`);
            return;
        }
        
        // Handle user data from backend redirect
        if (userDataParam) {
            try {
                const userData = JSON.parse(decodeURIComponent(userDataParam));
                sessionStorage.setItem('shockwave_user', JSON.stringify(userData));
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
                loadDashboard(userData);
                return;
            } catch (e) {
                console.error('Error parsing user data:', e);
                showAuthScreen();
                return;
            }
        } else {
            showAuthScreen();
        }
        
        // Handle OAuth code (if someone manually added it)
        if (codeParam) {
            // Redirect to backend to exchange code
            window.location.href = `${BACKEND_URL}/auth/exchange?code=${codeParam}`;
            return;
        }
        
        // Check if we have stored user data in sessionStorage
        const userData = sessionStorage.getItem('shockwave_user');
        if (userData) {
            loadDashboard(JSON.parse(userData));
        } else {
            showAuthScreen();
        }
    }
    
    // Load dashboard with user data
    function loadDashboard(user) {
        // Update user info
        const avatarUrl = user.avatar 
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
            : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
        
        userAvatar.src = avatarUrl;
        username.textContent = `${user.username}#${user.discriminator}`;
        userId.textContent = `ID: ${user.id}`;
        
        // Load user's guilds
        loadUserGuilds(user.access_token);
        
        // Show dashboard
        hideLoading();
        dashboardContent.classList.remove('hidden');
    }
    
    // Load user's guilds
    function loadUserGuilds(accessToken) {
        // Show loading state for servers
        serversContainer.innerHTML = `
            <div class="server-placeholder">
                <div class="placeholder-icon">
                    <i class="fas fa-server"></i>
                </div>
                <p>Loading your servers...</p>
            </div>
        `;
        
        // Fetch user's guilds from backend
        fetch(`${BACKEND_URL}/api/user/guilds`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired, show auth screen
                    sessionStorage.removeItem('shockwave_user');
                    showAuthScreen();
                    throw new Error('Authentication expired');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(guilds => {
            displayServers(guilds);
        })
        .catch(error => {
            if (error.message !== 'Authentication expired') {
                console.error('Error loading guilds:', error);
                serversContainer.innerHTML = `
                    <div class="server-placeholder">
                        <div class="placeholder-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <p>Failed to load servers. Please try again later.</p>
                        <button class="cta-button" style="margin-top: 20px;" onclick="location.reload()">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </div>
                `;
            }
        });
    }
    
    // Display servers in the dashboard
    function displayServers(guilds) {
        if (guilds.length === 0) {
            serversContainer.innerHTML = `
                <div class="server-placeholder">
                    <div class="placeholder-icon">
                        <i class="fas fa-server"></i>
                    </div>
                    <p>No servers found where you have administrative permissions.</p>
                    <button class="cta-button" style="margin-top: 20px;" onclick="window.open('https://discord.com/oauth2/authorize?client_id=1421445090945007637&scope=bot&permissions=8', '_blank')">
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
    
    // Show authentication screen
    function showAuthScreen() {
        hideLoading();
        hideError();
        authScreen.classList.remove('hidden');
        dashboardContent.classList.add('hidden');
    }
    
    // Show loading screen
    function showLoading() {
        loadingScreen.classList.remove('hidden');
        authScreen.classList.add('hidden');
        dashboardContent.classList.add('hidden');
        hideError();
    }
    
    // Hide loading screen
    function hideLoading() {
        loadingScreen.classList.add('hidden');
    }
    
    // Show error message
    function showError(message) {
        hideLoading();
        errorMessage.textContent = message;
        errorScreen.classList.remove('hidden');
        authScreen.classList.add('hidden');
        dashboardContent.classList.add('hidden');
    }
    
    // Hide error screen
    function hideError() {
        errorScreen.classList.add('hidden');
    }
    
    // Event Listeners
    loginBtn.addEventListener('click', function() {
        // Redirect to Discord OAuth
        window.location.href = OAUTH_URL;
    });
    
    logoutBtn.addEventListener('click', function() {
        // Clear stored data and show auth screen
        sessionStorage.removeItem('shockwave_user');
        showAuthScreen();
    });
    
    retryBtn.addEventListener('click', function() {
        showAuthScreen();
    });
    
    // Initialize the dashboard
    initDashboard();
});

