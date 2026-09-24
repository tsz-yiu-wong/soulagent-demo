/**
 * 侧边栏组件 (js/sidebar.js)
 * 职责：负责在各页面自动渲染左侧边栏、高亮当前激活项、渲染历史对话列表并处理页面导航
 */

function getCurrentPageName() {
  const path = window.location.pathname.replace(/\\/g, '/');
  const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  return page.toLowerCase();
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function handleNewChatClick(e) {
  const currentPage = getCurrentPageName();
  if (currentPage === 'index.html' || currentPage === '' || currentPage === 'new-chat.html') {
    if (e) e.preventDefault();
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.value = '';
      chatInput.focus();
    }
    if (window.renderRecommendCards) {
      window.renderRecommendCards();
    }
    return false;
  }
  return true;
}
window.handleNewChatClick = handleNewChatClick;

function renderSidebar() {
  const currentPage = getCurrentPageName();
  const currentTitle = getQueryParam('title') || '';

  // 1. 计算各菜单项的 active 状态
  const isNewChatActive = (currentPage === 'index.html' || currentPage === '' || currentPage === 'new-chat.html');
  const isClonesActive = (currentPage === 'clones.html');
  const currentId = getQueryParam('id') || '';
  const isDistillActive = (currentPage === 'distill.html');
  const isProfileActive = (currentPage === 'profile.html');
  const isPlazaActive = (currentPage === 'plaza.html' || currentPage === 'expert-new.html');
  const isListenActive = (currentPage.includes('帮我听') || currentPage === 'listen.html');
  const isScheduleActive = (currentPage.includes('定时任务') || currentPage === 'schedule.html');

  // 2. 获取历史对话列表
  const chats = getAgentChats("AI助手");

  const historyItemsHtml = chats.map(title => {
    const isActive = (currentPage === 'dialog.html' && decodeURIComponent(currentTitle) === title);

    let iconOrBadgeHtml = `<svg class="icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

    const conv = (window.mockConversations && window.mockConversations[title]) || null;
    let exp = null;
    let clone = null;

    let isGroup = (conv && conv.type === 'group') || title.includes('群聊');

    if (isGroup) {
      iconOrBadgeHtml = `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:18px;padding:0 6px;border-radius:4px;background:linear-gradient(135deg, #7c3aed, #4f46e5);color:#fff;font-size:11px;font-weight:600;flex-shrink:0;white-space:nowrap;">群聊</span>`;
    } else if (conv && conv.expertId && conv.type === 'twin') {
      exp = window.expertList ? window.expertList.find(e => e.id === conv.expertId) : null;
    } else if (conv && conv.cloneId && conv.type === 'clone' && window.myClones) {
      clone = window.myClones.find(c => c.id === conv.cloneId);
    } else if (title.startsWith('与') && title.endsWith('对话')) {
      const targetName = title.substring(1, title.length - 2);
      exp = window.expertList ? window.expertList.find(e => e.name === targetName) : null;
      if (!exp && window.myClones) {
        clone = window.myClones.find(c => c.name === targetName);
      }
    }

    if (!isGroup) {
      if (clone) {
        iconOrBadgeHtml = `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:18px;padding:0 6px;border-radius:4px;background:${clone.gradient};color:#fff;font-size:11px;font-weight:600;flex-shrink:0;white-space:nowrap;">${escapeHtml(clone.name)}</span>`;
      } else if (exp) {
        iconOrBadgeHtml = `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:18px;padding:0 6px;border-radius:4px;background:${exp.gradient};color:#fff;font-size:11px;font-weight:600;flex-shrink:0;white-space:nowrap;">${escapeHtml(exp.name)}</span>`;
      }
    }

    const dialogUrl = getPageUrl('dialog.html', { title: title });

    return `
      <a class="history-item ${isActive ? 'active' : ''}" href="${dialogUrl}" style="text-decoration:none;">
        ${iconOrBadgeHtml}
        <span>${escapeHtml(title)}</span>
      </a>
    `;
  }).join('');

  // 3. 构造侧边栏 DOM
  const indexUrl = getPageUrl('index.html');
  const clonesUrl = getPageUrl('clones.html');
  const distillUrl = getPageUrl('distill.html');
  const profileUrl = getPageUrl('profile.html');
  const scheduleUrl = getPageUrl('定时任务.html');
  const listenUrl = getPageUrl('帮我听.html');
  const plazaUrl = getPageUrl('plaza.html');

  // 4. 根据 myClones 数量渲染召唤 MyAgent 下方的分身二级子项
  const clones = window.myClones || [];
  const clonesCount = clones.length;

  const displayClones = clones;
  const clonesItemsHtml = displayClones.map((clone, idx) => {
    const isCloneActive = (currentPage === 'clone-new.html' && currentId === clone.id);
    const cloneUrl = getPageUrl('clone-new.html', { id: clone.id });

    return `
      <a class="sub-branch-item ${isCloneActive ? 'active' : ''}" href="${cloneUrl}" style="text-decoration:none;">
        <span class="branch-clone-badge" style="background:${clone.gradient};">${escapeHtml(clone.avatar || clone.name.charAt(0))}</span>
        <span>${escapeHtml(clone.name)}</span>
      </a>
    `;
  }).join('');

  const createCloneHtml = `
    <a class="sub-branch-item create-btn ${isDistillActive ? 'active' : ''}" href="${distillUrl}" style="text-decoration:none;">
      <span class="branch-icon-box">
        <svg class="icon" viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;stroke-width:2.5;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </span>
      <span>创建我的AI分身</span>
    </a>
  `;

  let subClonesHtml = '';
  if (clonesCount === 0) {
    subClonesHtml = createCloneHtml;
  } else {
    subClonesHtml = clonesItemsHtml + createCloneHtml;
  }

  const sidebarHtml = `
    <aside class="sidebar">
      <div class="sidebar-header">
        <a class="logo-area" href="${indexUrl}" style="cursor: pointer; text-decoration: none;">
          <div class="logo-icon">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span>SoulAgent</span>
        </a>
      </div>

      <div class="divider"></div>

      <!-- 新建对话 -->
      <div class="agent-summon-wrapper">
        <a class="agent-summon-bar ${isNewChatActive ? 'active' : ''}" href="${indexUrl}" onclick="return handleNewChatClick(event);" title="发起新建对话" style="text-decoration:none;">
          <div class="agent-summon-left">
            <svg class="icon" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/></svg>
            <span>新建对话</span>
          </div>
        </a>
        <a class="nav-item-static ${isProfileActive ? 'active' : ''}" href="${profileUrl}" style="text-decoration:none;">
          <svg class="icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span>我的AI分身</span>
        </a>
      </div>

      <div class="divider"></div>

      <div class="nav-group">
      
        <a class="nav-item-static ${isListenActive ? 'active' : ''}" href="${listenUrl}" style="text-decoration:none;">
          <svg class="icon" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2H3z"/></svg>
          <span>帮我听会</span>
        </a>
        <a class="nav-item-static ${isPlazaActive ? 'active' : ''}" href="${plazaUrl}" style="text-decoration:none;">
          <svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>AI分身广场</span>
        </a>
      </div>

      <div class="divider"></div>

      <!-- 历史对话列表 -->
      <div class="history-section">
        <div class="history-title">历史对话</div>
        <div class="history-list">${historyItemsHtml}</div>
      </div>
    </aside>
  `;

  let sidebarContainer = document.getElementById('sidebar-container');
  if (!sidebarContainer) {
    sidebarContainer = document.createElement('div');
    sidebarContainer.id = 'sidebar-container';
    document.body.insertBefore(sidebarContainer, document.body.firstChild);
  }
  sidebarContainer.innerHTML = sidebarHtml;
}

// DOM 加载完成自动挂载
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderSidebar);
} else {
  renderSidebar();
}
