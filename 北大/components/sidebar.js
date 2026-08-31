/**
 * SoulAgent v1 - 侧边栏组件 (components/sidebar.js)
 * 职责：自包含样式与 DOM 挂载、根据 URL 自动高亮、根据 Store 动态渲染分身树与历史会话，监听 Bus 实时更新
 */

(function (global) {
  function getCurrentPageName() {
    const path = window.location.pathname.replace(/\\/g, '/');
    const page = path.substring(path.lastIndexOf('/') + 1) || 'new-chat.html';
    return page.toLowerCase();
  }

  function handleNewChatClick(e) {
    const currentPage = getCurrentPageName();
    if (currentPage === 'new-chat.html' || currentPage === 'index.html' || currentPage === '') {
      if (e) e.preventDefault();
      const chatInput = document.getElementById('chat-input');
      if (chatInput) {
        chatInput.value = '';
        chatInput.focus();
      }
      if (typeof global.renderRecommendCards === 'function') {
        global.renderRecommendCards();
      }
      return false;
    }
    return true;
  }
  global.handleNewChatClick = handleNewChatClick;

  function renderSidebar() {
    const currentPage = getCurrentPageName();
    const currentTitle = decodeURIComponent(global.getQueryParam('title') || '');
    const currentId = global.getQueryParam('id') || '';

    // 1. 判定各路由 active 状态
    const isNewChatActive = (currentPage === 'new-chat.html' || currentPage === 'index.html' || currentPage === '');
    const isPlazaActive = (currentPage === 'persona-plaza.html' || currentPage === 'persona-mgmt.html');
    const isDistillActive = (currentPage === 'persona-distill.html');
    const isListenActive = (currentPage === 'listen-it-for-me.html');
    const isCronActive = (currentPage === 'cron-job.html');

    // 2. 构造分身二级子树
    const clones = global.Store ? global.Store.myClones : [];
    const clonesItemsHtml = clones.map(clone => {
      const isCloneActive = ((currentPage === 'new-chat-persona.html' || currentPage === 'persona-mgmt.html') && currentId === clone.id);
      const cloneUrl = global.getPageUrl('new-chat-persona.html', { id: clone.id });

      return `
        <a class="sub-branch-item ${isCloneActive ? 'active' : ''}" href="${cloneUrl}" style="text-decoration:none;">
          <span class="branch-clone-badge" style="background:${clone.gradient};">${global.escapeHtml(clone.avatar || clone.name.charAt(0))}</span>
          <span>${global.escapeHtml(clone.name)}</span>
        </a>
      `;
    }).join('');

    const distillUrl = global.getPageUrl('persona-distill.html');
    const createCloneHtml = `
      <a class="sub-branch-item create-btn ${isDistillActive ? 'active' : ''}" href="${distillUrl}" style="text-decoration:none;">
        <span class="branch-icon-box">
          <svg class="icon" viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;stroke-width:2.5;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </span>
        <span>新建分身</span>
      </a>
    `;

    const subClonesHtml = clonesItemsHtml + createCloneHtml;

    // 3. 构造历史对话列表
    const chats = global.Store ? global.Store.getAgentChats("AI助手") : [];
    const historyItemsHtml = chats.map(title => {
      const isActive = (currentPage === 'chat-dialog.html' && currentTitle === title);
      const conv = global.Store ? global.Store.getConversation(title) : null;
      let badgeHtml = `<svg class="icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

      const isGroup = (conv && conv.type === 'group') || title.includes('群聊');
      let exp = null;
      let clone = null;

      if (!isGroup && global.Store) {
        if (conv && conv.expertId) {
          exp = (global.Store.expertList || []).find(e => e.id === conv.expertId);
        }
        if (!exp && conv && conv.cloneId) {
          clone = (global.Store.myClones || []).find(c => c.id === conv.cloneId);
        }
        if (!exp && !clone) {
          exp = (global.Store.expertList || []).find(e => title.includes(e.name));
          if (!exp) {
            clone = (global.Store.myClones || []).find(c => title.includes(c.name));
          }
        }
      }

      if (isGroup) {
        badgeHtml = `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:18px;padding:0 6px;border-radius:4px;background:linear-gradient(135deg, #8c171e, #b91c1c);color:#fff;font-size:11px;font-weight:600;flex-shrink:0;white-space:nowrap;">群聊</span>`;
      } else if (clone) {
        badgeHtml = `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:18px;padding:0 6px;border-radius:4px;background:${clone.gradient};color:#fff;font-size:11px;font-weight:600;flex-shrink:0;white-space:nowrap;">${global.escapeHtml(clone.name)}</span>`;
      } else if (exp) {
        badgeHtml = `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:18px;padding:0 6px;border-radius:4px;background:${exp.gradient};color:#fff;font-size:11px;font-weight:600;flex-shrink:0;white-space:nowrap;">${global.escapeHtml(exp.name)}</span>`;
      }

      const dialogUrl = global.getPageUrl('chat-dialog.html', { title: title });

      return `
        <a class="history-item ${isActive ? 'active' : ''}" href="${dialogUrl}" style="text-decoration:none;">
          ${badgeHtml}
          <span>${global.escapeHtml(title)}</span>
        </a>
      `;
    }).join('');

    // 4. 路由 URL
    const newChatUrl = global.getPageUrl('new-chat.html');
    const plazaUrl = global.getPageUrl('persona-plaza.html');
    const listenUrl = global.getPageUrl('listen-it-for-me.html');
    const cronUrl = global.getPageUrl('cron-job.html');

    const isInPages = window.location.pathname.includes('/pages/') || window.location.pathname.endsWith('/pages');
    const logoSrc = isInPages ? '../static/pku-logo.png' : 'static/pku-logo.png';

    const sidebarHtml = `
      <aside class="sidebar">
        <div class="sidebar-header">
          <a class="logo-area" href="${newChatUrl}" style="cursor: pointer; text-decoration: none;">
            <img class="logo-img" src="${logoSrc}" alt="北京大学" />
          </a>
        </div>

        <div class="divider"></div>

        <!-- 1. 新建对话 -->
        <div class="nav-group">
          <div class="agent-summon-wrapper">
            <a class="agent-summon-bar ${isNewChatActive ? 'active' : ''}" href="${newChatUrl}" onclick="return handleNewChatClick(event);" title="发起新建对话" style="text-decoration:none;">
              <div class="agent-summon-left">
                <svg class="icon" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/></svg>
                <span>新建对话</span>
              </div>
            </a>
          </div>
        </div>

        <div class="divider"></div>

        <!-- 2. AI分身体系 -->
        <div class="nav-group">
          <a class="nav-item-static ${isPlazaActive ? 'active' : ''}" href="${plazaUrl}" style="text-decoration:none;">
            <svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>AI分身</span>
          </a>
          <div class="agent-sub-nav">
            ${subClonesHtml}
          </div>
        </div>

        <div class="divider"></div>

        <!-- 3. 工具与协同 -->
        <div class="nav-group">
          <a class="nav-item-static ${isListenActive ? 'active' : ''}" href="${listenUrl}" style="text-decoration:none;">
            <svg class="icon" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2H3z"/></svg>
            <span>帮我听会</span>
          </a>
          <a class="nav-item-static ${isCronActive ? 'active' : ''}" href="${cronUrl}" style="text-decoration:none; margin-top: 4px;">
            <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>定时任务</span>
          </a>
        </div>

        <div class="divider"></div>

        <!-- 4. 历史对话列表 -->
        <div class="history-section">
          <div class="history-title">历史对话</div>
          <div class="history-list">${historyItemsHtml}</div>
        </div>
      </aside>
    `;

    let container = document.getElementById('sidebar-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'sidebar-container';
      document.body.insertBefore(container, document.body.firstChild);
    }
    container.innerHTML = sidebarHtml;
  }

  // 注入自包含侧边栏专属 CSS
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .sidebar {
      width: 250px;
      background-color: rgba(251, 251, 252, 0.72);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(8px);
      border-right: 1px solid var(--border-color, #e2e8f0);
      display: flex;
      flex-direction: column;
      user-select: none;
      height: 100vh;
      padding: 12px 10px;
      flex-shrink: 0;
      position: relative;
      z-index: 2;
    }
    .sidebar-header {
      padding: 6px 6px 10px 6px;
      display: flex;
      align-items: center;
    }
    .logo-area {
      display: flex;
      align-items: center;
      width: 100%;
    }
    .logo-img {
      height: 32px;
      max-width: 100%;
      object-fit: contain;
      display: block;
    }
    .divider {
      height: 1px;
      background-color: var(--border-color, #e2e8f0);
      margin: 8px 4px;
    }
    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .agent-summon-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      border-radius: 9px;
      font-size: 13.5px;
      font-weight: 600;
      color: #1e293b;
      background: #ffffff;
      border: 1px solid var(--border-color, #e2e8f0);
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .agent-summon-bar:hover, .agent-summon-bar.active {
      background: var(--primary-light, #fdf2f2);
      border-color: rgba(140, 23, 30, 0.25);
      color: var(--primary-color, #8c171e);
    }
    .agent-summon-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .agent-summon-left svg {
      stroke: var(--primary-color, #8c171e);
    }
    .nav-item-static {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 500;
      color: #334155;
      transition: all 0.15s ease;
    }
    .nav-item-static:hover, .nav-item-static.active {
      background: var(--primary-light, #fdf2f2);
      color: var(--primary-color, #8c171e);
      font-weight: 600;
    }
    .agent-sub-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-left: 12px;
      padding-left: 8px;
      border-left: 1.5px solid #e2e8f0;
      margin-top: 2px;
    }
    .sub-branch-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 8px;
      border-radius: 6px;
      font-size: 12.5px;
      color: #475569;
      transition: all 0.15s ease;
    }
    .sub-branch-item:hover, .sub-branch-item.active {
      background: var(--primary-light, #fdf2f2);
      color: var(--primary-color, #8c171e);
      font-weight: 600;
    }
    .branch-clone-badge {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      color: #fff;
      font-size: 10.5px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .branch-icon-box {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      background: #e2e8f0;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sub-branch-item.create-btn {
      color: var(--primary-color, #8c171e);
      font-weight: 500;
    }
    .history-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin-top: 4px;
    }
    .history-title {
      font-size: 11.5px;
      font-weight: 600;
      color: #94a3b8;
      padding: 6px 10px 4px 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .history-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .history-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 7px;
      font-size: 13px;
      color: #334155;
      transition: all 0.15s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .history-item:hover, .history-item.active {
      background: #f1f5f9;
      color: #0f172a;
    }
    .history-item.active {
      font-weight: 600;
      background: #e2e8f0;
    }
    .history-item span {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;
  document.head.appendChild(styleEl);

  // 监听事件自动重新渲染
  if (global.Bus) {
    global.Bus.on('sidebar:refresh', renderSidebar);
    global.Bus.on('clone:updated', renderSidebar);
    global.Bus.on('chat:created', renderSidebar);
  }

  // 初始挂载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderSidebar);
  } else {
    renderSidebar();
  }

  global.renderSidebar = renderSidebar;
})(window);
