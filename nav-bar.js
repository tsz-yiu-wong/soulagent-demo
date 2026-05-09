
class NavBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const activeTab = this.getAttribute('active');
        this.render(activeTab);
        
        // Listen for custom event to refresh navbar
        window.addEventListener('user-mode-changed', () => {
            this.render(this.getAttribute('active'));
        });
    }

    render(activeTab) {
        const theme = this.getAttribute('theme') || 'light';
        const userMode = localStorage.getItem('userMode') || 'normal';
        const isExpert = userMode.startsWith('expert');
        const agentTabName = (userMode === 'expert') ? 'AI助手' : '小小曜';
        const twinTab = isExpert ? `<a href="twin-manage.html" class="nav-tab ${activeTab === 'twin-manage' ? 'active' : ''}">我的分身</a>` : '';

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                width: 100%;
                position: relative;
                z-index: 1000;
            }
            .navbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 32px;
                background-color: #FFFFFF;
                border-bottom: 1px solid var(--border-color, #FEE7DB);
                z-index: 1000;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                transition: all 0.3s ease;
                position: relative;
            }

            /* Dark Theme Styles */
            .navbar.dark {
                background-color: rgba(10, 10, 15, 0.7);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                color: #FFFFFF;
            }

            .nav-left {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .nav-title {
                font-size: 20px;
                font-weight: 800;
                color: var(--primary-color, #F37021);
            }

            .navbar.dark .nav-title {
                color: #FFFFFF;
            }

            .perspective-label {
                font-size: 14px;
                color: #9CA3AF;
                cursor: pointer;
                margin-left: 4px;
                font-weight: 500;
                padding: 4px 8px;
                border-radius: 6px;
                transition: all 0.2s;
                user-select: none;
            }

            .perspective-label:hover {
                background-color: #F3F4F6;
                color: var(--primary-color, #F37021);
            }

            .navbar.dark .perspective-label {
                color: rgba(255, 255, 255, 0.5);
            }

            .navbar.dark .perspective-label:hover {
                background-color: rgba(255, 255, 255, 0.1);
                color: #FFFFFF;
            }

            .logo-placeholder {
                width: 32px;
                height: 32px;
                background-color: var(--border-color, #FEE7DB);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--primary-color, #F37021);
                font-size: 12px;
                font-weight: bold;
            }

            .navbar.dark .logo-placeholder {
                background-color: rgba(255, 255, 255, 0.1);
                color: #FFFFFF;
            }

            .nav-center {
                display: flex;
                gap: 32px;
            }

            .nav-tab {
                font-size: 16px;
                font-weight: 600;
                color: #9CA3AF;
                cursor: pointer;
                text-decoration: none;
                padding-bottom: 4px;
                transition: all 0.2s;
            }

            .nav-tab:hover {
                color: var(--text-color, #333333);
            }

            .navbar.dark .nav-tab:hover {
                color: #FFFFFF;
            }

            .nav-tab.active {
                color: var(--text-color, #333333);
                border-bottom: 3px solid var(--primary-color, #F37021);
            }

            .navbar.dark .nav-tab.active {
                color: #FFFFFF;
                border-bottom-color: var(--twin-color, #9D85FF);
            }

            .nav-right {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .status-tag {
                background-color: #ECFDF5;
                color: #10B981;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
                border: 1px solid #A7F3D0;
            }

            .navbar.dark .status-tag {
                background-color: rgba(16, 185, 129, 0.1);
                color: #10B981;
                border-color: rgba(16, 185, 129, 0.3);
            }

            .avatar-container {
                position: relative;
                cursor: pointer;
            }

            .avatar-placeholder {
                width: 36px;
                height: 36px;
                background-color: #E5E7EB;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #6B7280;
                font-weight: bold;
                user-select: none;
            }

            .navbar.dark .avatar-placeholder {
                background-color: rgba(255, 255, 255, 0.1);
                color: #FFFFFF;
            }

            .avatar-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 8px;
                background: white;
                border: 1px solid var(--border-color, #FEE7DB);
                border-radius: 12px;
                padding: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                display: none;
                flex-direction: column;
                gap: 4px;
                min-width: 160px;
                z-index: 200;
            }

            .navbar.dark .avatar-dropdown {
                background: #1A1A1F;
                border-color: rgba(255, 255, 255, 0.1);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            }

            .avatar-dropdown.active {
                display: flex;
            }

            .dropdown-item {
                padding: 10px 12px;
                border-radius: 8px;
                font-size: 14px;
                color: var(--text-color, #333333);
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
                text-decoration: none;
            }

            .navbar.dark .dropdown-item {
                color: #CBD5E0;
            }

            .dropdown-item:hover {
                background: #FFF7F5;
                color: var(--primary-color, #F37021);
            }

            .navbar.dark .dropdown-item:hover {
                background: rgba(255, 255, 255, 0.05);
                color: #FFFFFF;
            }

            svg {
                flex-shrink: 0;
            }
        </style>
        <div class="navbar ${theme}">
            <div class="nav-left">
                <div class="logo-placeholder">Logo</div>
                <div class="nav-title">SoulAgent</div>
                <div id="perspective-toggle" class="perspective-label">
                    [${isExpert ? '专家视角' : '用户视角'}]
                </div>
            </div>
            
            <div class="nav-center">
                <a href="agent.html" class="nav-tab ${activeTab === 'agent' ? 'active' : ''}">${agentTabName}</a>
                <a href="metaverse.html" class="nav-tab ${activeTab === 'metaverse' ? 'active' : ''}">数字世界</a>
                ${twinTab}
            </div>
            
            <div class="nav-right">
                <div class="status-tag">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    当前环境：安全
                </div>
                <div class="avatar-container">
                    <div class="avatar-placeholder">头像</div>
                    <div class="avatar-dropdown" id="avatar-dropdown">
                        <a href="skill-center.html" class="dropdown-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                            技能广场
                        </a>
                        <a href="agent-archives.html" class="dropdown-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            小小曜档案库
                        </a>
                    </div>
                </div>
            </div>
        </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const avatarContainer = this.shadowRoot.querySelector('.avatar-container');
        const dropdown = this.shadowRoot.querySelector('#avatar-dropdown');
        const perspectiveToggle = this.shadowRoot.querySelector('#perspective-toggle');
        
        if (perspectiveToggle) {
            perspectiveToggle.addEventListener('click', () => {
                const currentMode = localStorage.getItem('userMode') || 'normal';
                if (currentMode.startsWith('expert')) {
                    localStorage.setItem('userMode', 'normal');
                    window.location.href = 'user.html';
                } else {
                    localStorage.setItem('userMode', 'expert');
                    window.location.href = 'expert.html';
                }
            });
        }

        avatarContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            if (localStorage.getItem('userMode') === 'expert') return;
            if (!e.target.closest('.avatar-dropdown')) {
                dropdown.classList.toggle('active');
            }
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });
    }
}

customElements.define('nav-bar', NavBar);
