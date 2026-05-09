
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

            .status-container {
                position: relative;
                cursor: pointer;
            }

            .status-dropdown {
                position: absolute;
                top: 100%;
                right: 50%;
                transform: translateX(50%);
                margin-top: 8px;
                background: white;
                border: 1px solid var(--border-color, #FEE7DB);
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                display: none;
                flex-direction: column;
                gap: 10px;
                min-width: 160px;
                z-index: 200;
            }

            .navbar.dark .status-dropdown {
                background: #1A1A1F;
                border-color: rgba(255, 255, 255, 0.1);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            }

            .status-dropdown.active {
                display: flex;
            }

            .status-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: var(--text-color, #333333);
                font-weight: 500;
            }

            .navbar.dark .status-item {
                color: #CBD5E0;
            }

            .rescan-btn {
                background: #F3F4F6;
                color: #4B5563;
                border: none;
                border-radius: 8px;
                padding: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
                margin-top: 4px;
            }

            .rescan-btn:hover {
                background: #E5E7EB;
                color: var(--primary-color, #F37021);
            }

            .navbar.dark .rescan-btn {
                background: rgba(255, 255, 255, 0.1);
                color: #E2E8F0;
            }

            .navbar.dark .rescan-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .item-loading-icon {
                animation: spin 1s linear infinite;
                display: none;
                color: var(--primary-color, #F37021);
            }
            .status-item.loading .item-check-icon {
                display: none;
            }
            .status-item.loading .item-loading-icon {
                display: block;
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
                    [${isExpert ? '切换用户视角' : '切换专家视角'}]
                </div>
            </div>
            
            <div class="nav-center">
                <a href="agent.html" class="nav-tab ${activeTab === 'agent' ? 'active' : ''}">${agentTabName}</a>
                <a href="metaverse.html" class="nav-tab ${activeTab === 'metaverse' ? 'active' : ''}">数字世界</a>
                ${twinTab}
            </div>
            
            <div class="nav-right">
                <div class="status-container" id="status-container">
                    <div class="status-tag" id="status-tag">
                        <svg class="normal-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <span id="status-text">当前环境：安全</span>
                    </div>
                    <div class="status-dropdown" id="status-dropdown">
                        <div class="status-item"><span class="item-check-icon">✅</span><svg class="item-loading-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> 对话内容安全</div>
                        <div class="status-item"><span class="item-check-icon">✅</span><svg class="item-loading-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> 技能状态安全</div>
                        <div class="status-item"><span class="item-check-icon">✅</span><svg class="item-loading-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> 服务器安全</div>
                        <button class="rescan-btn" id="rescan-btn">重新扫描</button>
                    </div>
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
        const statusContainer = this.shadowRoot.querySelector('#status-container');
        const statusDropdown = this.shadowRoot.querySelector('#status-dropdown');
        const rescanBtn = this.shadowRoot.querySelector('#rescan-btn');
        const statusTag = this.shadowRoot.querySelector('#status-tag');
        const statusText = this.shadowRoot.querySelector('#status-text');

        if (statusContainer) {
            statusContainer.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!e.target.closest('.status-dropdown')) {
                    statusDropdown.classList.toggle('active');
                }
            });
        }

        if (rescanBtn) {
            rescanBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const statusItems = statusDropdown.querySelectorAll('.status-item');
                statusItems.forEach(item => item.classList.add('loading'));
                rescanBtn.textContent = '扫描中...';
                rescanBtn.style.pointerEvents = 'none';
                
                statusItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.remove('loading');
                    }, 600 * (index + 1));
                });

                setTimeout(() => {
                    rescanBtn.textContent = '重新扫描';
                    rescanBtn.style.pointerEvents = 'auto';
                }, 600 * statusItems.length + 200);
            });
        }
        
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
            if (statusDropdown) statusDropdown.classList.remove('active');
        });
    }
}

customElements.define('nav-bar', NavBar);
