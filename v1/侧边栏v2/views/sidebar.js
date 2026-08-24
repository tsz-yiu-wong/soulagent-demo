/**
 * 侧边栏组件 (views/sidebar.js)
 * 职责：负责渲染左侧边栏、智能体召唤下拉菜单、二级菜单以及历史对话列表
 */

function renderSidebar() {
  const chats = getAgentChats(state.currentAgent);
  const labelText = (state.currentAgent === 'MyAgent' || state.currentAgent === '默认智能体')
    ? '召唤 MyAgent'
    : `召唤 ${state.currentAgent.replace(/\s+/g, '')}`;

  // 历史对话列表 HTML
  const historyItemsHtml = chats.map(title => {
    const isActive = (state.activeChatTitle === title);
    
    let iconOrBadgeHtml = `<svg class="icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    
    const conv = mockConversations[title];
    let exp = null;
    if (conv && conv.expertId) {
      exp = expertList.find(e => e.id === conv.expertId);
    } else if (title.startsWith('与') && title.endsWith('对话')) {
      const expName = title.substring(1, title.length - 2);
      exp = expertList.find(e => e.name === expName);
    }

    if (exp) {
      iconOrBadgeHtml = `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:18px;padding:0 6px;border-radius:4px;background:${exp.gradient};color:#fff;font-size:11px;font-weight:600;flex-shrink:0;white-space:nowrap;">${escapeHtml(exp.name)}</span>`;
    }

    return `
      <div class="history-item ${isActive ? 'active' : ''}" onclick="openDialogChat('${escapeJsString(title)}')">
        ${iconOrBadgeHtml}
        <span>${escapeHtml(title)}</span>
      </div>
    `;
  }).join('');

  // 平铺 AI 分身列表 HTML
  const tileItemsHtml = agentMenuItems.map(item => {
    const isActive = (item.name === state.currentAgent);
    const labelText = (item.name === 'MyAgent' || item.name === '默认智能体')
      ? '召唤 MyAgent'
      : (item.name.startsWith('召唤') ? item.name : `召唤 ${item.name.replace(/\s+/g, '')}`);

    const checkIcon = isActive ? `<svg class="icon check-icon" style="width:14px;height:14px;color:#10a37f;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>` : '';

    return `
      <div class="agent-tile-item ${isActive ? 'active' : ''}" onclick="selectAgent('${escapeJsString(item.name)}')" title="${escapeHtml(labelText)}">
        <div class="agent-tile-left">
          <div class="agent-avatar-badge" style="background: ${item.gradient};">${item.avatar}</div>
          <span>${escapeHtml(labelText)}</span>
        </div>
        ${checkIcon}
      </div>
    `;
  }).join('');

  const isPlazaActive = (state.currentView === 'plaza');
  const profileDisplay = state.currentAgent.includes('专家AI') ? 'none' : 'flex';

  // 平铺展示 AI 分身列表 & 底部的“新建AI分身”按钮
  const summonSectionHtml = `
    <div class="agent-summon-wrapper">
      <div class="agent-summon-group">
        <div class="agent-tile-list">
          ${tileItemsHtml}
        </div>
        <div class="create-agent-btn-outer" onclick="openCreateAgentModal(event)" title="新建AI分身">
          <div class="agent-avatar-badge create-badge">
            <svg class="icon" viewBox="0 0 24 24" style="width:12px;height:12px;stroke:currentColor;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <span>新建AI分身</span>
        </div>
      </div>
    </div>
  `;

  const sidebarEl = document.getElementById('sidebar-container');
  sidebarEl.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-area">
          <div class="logo-icon">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span>SoulAgent</span>
        </div>
      </div>

      <div class="divider"></div>

      ${summonSectionHtml}

      <!-- 智能体二级菜单 -->
      <div class="agent-sub-nav">
        <div class="sub-nav-item ${state.currentView === 'profile' ? 'active' : ''}" style="display: ${profileDisplay};" onclick="openProfileView(event)">
          <svg class="icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span>档案中心</span>
        </div>
        <div class="sub-nav-item ${state.currentView === 'schedule' ? 'active' : ''}" onclick="openScheduleView(event)">
          <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>定时任务</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="nav-group">
        <div class="nav-item-static ${state.currentView === 'listen' ? 'active' : ''}" onclick="openListenView(event)">
          <svg class="icon" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2H3z"/></svg>
          <span>帮我听会</span>
        </div>
        <div class="nav-item-static ${isPlazaActive ? 'active' : ''}" onclick="openPlazaView(event)">
          <svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>AI分身广场</span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 历史对话列表 -->
      <div class="history-section">
        <div class="history-title">历史对话</div>
        <div class="history-list">${historyItemsHtml}</div>
      </div>
    </aside>
  `;
}
