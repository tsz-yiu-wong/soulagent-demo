/**
 * 侧边栏组件 (views/sidebar.js)
 * 职责：负责渲染左侧边栏、智能体召唤下拉菜单、二级菜单以及历史对话列表
 */

function renderSidebar() {
  const activeAgentItem = agentMenuItems.find(i => i.name === state.currentAgent);
  const isCurrentPending = activeAgentItem && activeAgentItem.isPending;

  const chats = getAgentChats(state.currentAgent);

  // 历史对话列表 HTML (蒸馏中则显示空状态提示)
  let historyItemsHtml = '';
  if (isCurrentPending) {
    historyItemsHtml = `
      <div class="history-pending-box">
        <svg class="icon" viewBox="0 0 24 24" style="width:20px;height:20px;color:#94a3b8;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span>分身正在创建中<br>暂无历史对话</span>
      </div>
    `;
  } else {
    historyItemsHtml = chats.map(title => {
      const isActive = (state.activeChatTitle === title);

      let iconOrBadgeHtml = `<svg class="icon" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

      const conv = mockConversations[title];
      let exp = null;
      let clone = null;
      // 仅通过列表卡片点击发起、具有独立新对话页面的会话，才在历史对话中展示专家/分身标签
      if (conv && conv.expertId && conv.type === 'twin') {
        exp = expertList.find(e => e.id === conv.expertId);
      } else if (conv && conv.cloneId && conv.type === 'clone' && typeof myClones !== 'undefined') {
        clone = myClones.find(c => c.id === conv.cloneId);
      } else if (title.startsWith('与') && title.endsWith('对话')) {
        const targetName = title.substring(1, title.length - 2);
        exp = expertList.find(e => e.name === targetName);
        if (!exp && typeof myClones !== 'undefined') {
          clone = myClones.find(c => c.name === targetName);
        }
      }

      if (clone) {
        iconOrBadgeHtml = `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:18px;padding:0 6px;border-radius:4px;background:${clone.gradient};color:#fff;font-size:11px;font-weight:600;flex-shrink:0;white-space:nowrap;">${escapeHtml(clone.name)}</span>`;
      } else if (exp) {
        iconOrBadgeHtml = `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:18px;padding:0 6px;border-radius:4px;background:${exp.gradient};color:#fff;font-size:11px;font-weight:600;flex-shrink:0;white-space:nowrap;">${escapeHtml(exp.name)}</span>`;
      }

      return `
        <div class="history-item ${isActive ? 'active' : ''}" onclick="openDialogChat('${escapeJsString(title)}')">
          ${iconOrBadgeHtml}
          <span>${escapeHtml(title)}</span>
        </div>
      `;
    }).join('');
  }

  const isClonesActive = (state.currentView === 'clones' || state.currentView === 'clone-detail' || state.currentView === 'distill');
  const isPlazaActive = (state.currentView === 'plaza');
  const isNewChatActive = (state.currentView === 'new-chat');

  const summonSectionHtml = `
    <div class="agent-summon-wrapper">
      <div class="agent-summon-bar ${isNewChatActive ? 'active' : ''}" onclick="startNewChat(event)" title="发起新建对话">
        <div class="agent-summon-left">
          <svg class="icon" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/></svg>
          <span>召唤 AI助手</span>
        </div>
        <span class="cmd-shortcut" style="font-size:11px;color:#94a3b8;border:1px solid #e2e8f0;border-radius:4px;padding:1px 5px;background:#f8fafc;">⌘K</span>
      </div>
    </div>
  `;

  const sidebarEl = document.getElementById('sidebar-container');
  sidebarEl.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-area" onclick="startNewChat(event)" style="cursor: pointer;">
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
        <div class="sub-nav-item ${isClonesActive ? 'active' : ''}" onclick="openMyClonesView(event)">
          <svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>我的AI分身</span>
        </div>
        <div class="sub-nav-item ${state.currentView === 'profile' ? 'active' : ''}" onclick="openProfileView(event)">
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
          <span>专家AI分身</span>
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
