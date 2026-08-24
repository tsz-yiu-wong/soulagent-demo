/**
 * 调度中心 (app.js)
 * 职责：维护 SPA 原型状态、响应菜单点击无缝切换右侧视图、处理新建智能体 modal & toast 交互
 */

// 全局响应式状态
// 全局响应式状态
const state = {
  currentAgent: "AI助手",       // 当前选中的智能体
  hasCreatedAvatar: false,        // 是否已新建过AI分身 (用于控制侧边栏初始化 vs 列表视图)
  currentView: "new-chat",       // 当前视图: 'new-chat' | 'expert-chat-new' | 'dialog' | 'plaza' | 'profile' | ...
  activeChatTitle: null,          // 当前激活的历史对话标题
  activeExpert: null,             // 当前选择的专家对象 (用于专家新对话视图)
  expertSelectMode: null,         // 专家选择来源: 'direct' (广场卡片进)
  chatInputDraft: "",             // 新建对话输入框文本草稿
  isDropdownOpen: false,          // 智能体下拉菜单显隐
  isExpertDropdownOpen: false,    // 专家AI分身下拉菜单显隐
  isListenDropdownOpen: false,    // 帮我听会下拉菜单显隐
  plazaSearchKeyword: "",         // 广场搜索关键字
  profileTab: "files"             // 档案页 Tab: 'files' | 'settings' | 'memory'
};

// 初始化逻辑
window.addEventListener('DOMContentLoaded', () => {
  renderApp();
});

// 全局主渲染器（无缝刷新 DOM）
function renderApp() {
  // 1. 渲染侧边栏
  renderSidebar();

  // 2. 渲染右侧主视图内容
  const mainEl = document.getElementById('main-container');
  if (state.currentView === 'plaza') {
    mainEl.innerHTML = renderPlazaView();
  } else if (state.currentView === 'listen') {
    mainEl.innerHTML = `<iframe src="./帮我听.html#embed" style="width:100%;height:100%;border:none;"></iframe>`;
  } else if (state.currentView === 'schedule') {
    mainEl.innerHTML = `<iframe src="./定时任务.html#embed" style="width:100%;height:100%;border:none;"></iframe>`;
  } else if (state.currentView === 'profile') {
    mainEl.innerHTML = renderProfileView();
  } else if (state.currentView === 'expert-chat-new') {
    mainEl.innerHTML = renderExpertNewView(state.activeExpert);
  } else if (state.currentView === 'distill') {
    mainEl.innerHTML = renderDistillView();
  } else if (state.currentView === 'dialog') {
    mainEl.innerHTML = renderDialogView();
    // 自动滚动到底部
    const msgContainer = document.getElementById('dialog-messages');
    if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
  } else {
    // new-chat
    mainEl.innerHTML = renderAgentNewView();
  }
}

// Helper: build expert reply header HTML (used by mock messages with mentioned expert)
function _buildExpertHeaderHtml(exp) {
  return `
    <div class="expert-reply-header">
      <div class="expert-reply-avatar-mini" style="background: ${exp.gradient};">
        <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </div>
      <div class="expert-reply-meta">
        <div class="expert-reply-name">${escapeHtml(exp.name)} 的 AI 分身</div>
        <div class="expert-reply-role">${escapeHtml(exp.role)}</div>
      </div>
    </div>
  `;
}

// 帮助函数
function isExpertAgent(agentName) {
  return agentName.includes('分身') || expertList.some(e => e.agentName === agentName);
}

function getAgentChats(agentName) {
  if (agentData[agentName]) return agentData[agentName];
  const cleanName = agentName.replace(/\s+/g, '');
  for (let k in agentData) {
    if (k.replace(/\s+/g, '') === cleanName) return agentData[k];
  }
  const defaultChats = [`${cleanName} 对话记录一`, `${cleanName} 策略研讨`, `${cleanName} 实践记录`];
  agentData[agentName] = defaultChats;
  return defaultChats;
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeJsString(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// -------------------------------------------------------------
// 帮我听会 选择器组件及交互处理
// -------------------------------------------------------------

function renderListenSelectorHtml() {
  const listenItems = [
    { name: '智源大会', desc: '北京智源人工智能大会' },
    { name: 'GDEC', desc: '全球数字经济大会' },
    { name: 'WAIC', desc: '世界人工智能大会' }
  ];

  const dropdownItemsHtml = listenItems.map(item => `
    <div class="expert-dropdown-item" onclick="selectListenOptionFromDropdown('${escapeJsString(item.name)}', event)">
      <div class="listen-item-icon">🎧</div>
      <div class="expert-item-info">
        <div class="expert-item-name">${escapeHtml(item.name)}</div>
        <div class="expert-item-role">${escapeHtml(item.desc)}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="expert-select-wrapper" id="listen-select-wrapper">
      <button class="expert-select-btn ${state.isListenDropdownOpen ? 'open' : ''}" onclick="toggleListenSelectDropdown(event)" title="帮我听会">
        <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
        <span>帮我听会</span>
        <svg class="icon chevron-icon" viewBox="0 0 24 24" style="width: 12px; height: 12px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>

      <div class="expert-select-dropdown ${state.isListenDropdownOpen ? 'show' : ''}">
        <div class="expert-dropdown-header">选择帮我听会频道</div>
        <div class="expert-dropdown-list">
          ${dropdownItemsHtml}
        </div>
      </div>
    </div>
  `;
}

function toggleListenSelectDropdown(e) {
  if (e) e.stopPropagation();
  state.isListenDropdownOpen = !state.isListenDropdownOpen;
  state.isExpertDropdownOpen = false;
  state.isDropdownOpen = false;
  renderApp();
}

function selectListenOptionFromDropdown(meetingName, e) {
  if (e) e.stopPropagation();
  const fillText = `帮我听 ${meetingName}`;
  state.chatInputDraft = fillText;
  state.isListenDropdownOpen = false;

  const input = document.getElementById('chat-input') || document.getElementById('dialog-chat-input');
  if (input) {
    input.value = fillText;
  }

  renderApp();

  setTimeout(() => {
    const newInput = document.getElementById('chat-input') || document.getElementById('dialog-chat-input');
    if (newInput) {
      newInput.focus();
      newInput.setSelectionRange(newInput.value.length, newInput.value.length);
    }
  }, 0);
}

// -------------------------------------------------------------
// 专家 AI 分身 选择器组件及交互处理
// -------------------------------------------------------------

function renderExpertSelectorHtml() {
  const dropdownItemsHtml = expertList.map(exp => `
    <div class="expert-dropdown-item" onclick="selectExpertFromDropdown('${exp.id}', event)">
      <div class="expert-item-avatar" style="background: ${exp.gradient};">
        <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </div>
      <div class="expert-item-info">
        <div class="expert-item-name">${escapeHtml(exp.name)}</div>
        <div class="expert-item-role">${escapeHtml(exp.role)}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="expert-select-wrapper" id="expert-select-wrapper">
      <button class="expert-select-btn ${state.isExpertDropdownOpen ? 'open' : ''}" onclick="toggleExpertSelectDropdown(event)" title="选择专家AI分身">
        <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>专家AI分身</span>
        <svg class="icon chevron-icon" viewBox="0 0 24 24" style="width: 12px; height: 12px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>

      <div class="expert-select-dropdown ${state.isExpertDropdownOpen ? 'show' : ''}">
        <div class="expert-dropdown-header">选择专家 AI 分身</div>
        <div class="expert-dropdown-list">
          ${dropdownItemsHtml}
        </div>
      </div>
    </div>
  `;
}

function toggleExpertSelectDropdown(e) {
  if (e) e.stopPropagation();
  state.isExpertDropdownOpen = !state.isExpertDropdownOpen;
  state.isListenDropdownOpen = false;
  state.isDropdownOpen = false;
  renderApp();
}

function selectExpertFromDropdown(expertId, e) {
  if (e) e.stopPropagation();
  const exp = expertList.find(item => item.id === expertId);
  if (!exp) return;

  const input = document.getElementById('chat-input');
  let currentVal = input ? input.value : (state.chatInputDraft || '');
  expertList.forEach(item => {
    currentVal = currentVal.replace(new RegExp(`@${item.name}\\s*`, 'g'), '');
  });
  state.chatInputDraft = `@${exp.name} ` + currentVal.trimStart();
  state.isExpertDropdownOpen = false;
  renderApp();

  setTimeout(() => {
    const newInput = document.getElementById('chat-input');
    if (newInput) {
      newInput.focus();
      newInput.setSelectionRange(newInput.value.length, newInput.value.length);
    }
  }, 0);
}

// -------------------------------------------------------------
// 交互事件处理函数
// -------------------------------------------------------------

// 点击侧边栏“召唤 MyAgent”或左侧热区发起新建对话
function startNewChat(e) {
  if (e) e.stopPropagation();
  state.activeChatTitle = null;
  state.activeExpert = null;
  state.expertSelectMode = null;
  state.chatInputDraft = '';
  state.currentView = 'new-chat';
  state.isDropdownOpen = false;
  state.isExpertDropdownOpen = false;
  renderApp();
}

// 打开历史对话
function openDialogChat(chatTitle) {
  state.activeChatTitle = chatTitle;

  // 检查是否是与专家的对话（格式：与XX对话 或 包含关联专家）
  const conv = mockConversations[chatTitle];
  if (conv && conv.expertId) {
    state.activeExpert = expertList.find(e => e.id === conv.expertId) || null;
  } else if (chatTitle.startsWith('与') && chatTitle.endsWith('对话')) {
    const expName = chatTitle.substring(1, chatTitle.length - 2);
    const exp = expertList.find(e => e.name === expName);
    state.activeExpert = exp || null;
  } else {
    state.activeExpert = null;
  }

  state.currentView = 'dialog';
  state.isDropdownOpen = false;
  state.isExpertDropdownOpen = false;
  renderApp();
}

// 切换智能体
function selectAgent(agentName) {
  state.currentAgent = agentName;
  state.activeChatTitle = null;
  state.activeExpert = null;

  const targetAgent = agentMenuItems.find(a => a.name === agentName);
  if (targetAgent && targetAgent.isPending) {
    state.currentView = 'distill';
  } else {
    state.currentView = 'new-chat';
  }

  state.isDropdownOpen = false;
  state.isExpertDropdownOpen = false;
  renderApp();
}

// 切换下拉菜单
function toggleAgentMenu(e) {
  if (e) e.stopPropagation();
  state.isDropdownOpen = !state.isDropdownOpen;
  state.isExpertDropdownOpen = false;
  renderSidebar();
}

function closeAgentMenu() {
  if (state.isDropdownOpen) {
    state.isDropdownOpen = false;
    renderSidebar();
  }
}

// 打开分身广场
function openPlazaView(e) {
  if (e) e.stopPropagation();
  state.activeChatTitle = null;
  state.activeExpert = null;
  state.currentView = 'plaza';
  state.isDropdownOpen = false;
  state.isExpertDropdownOpen = false;
  renderApp();
}

// 打开帮我听会
function openListenView(e) {
  if (e) e.stopPropagation();
  state.activeChatTitle = null;
  state.activeExpert = null;
  state.currentView = 'listen';
  state.isDropdownOpen = false;
  state.isExpertDropdownOpen = false;
  renderApp();
}

// 打开定时任务
function openScheduleView(e) {
  if (e) e.stopPropagation();
  state.activeChatTitle = null;
  state.activeExpert = null;
  state.currentView = 'schedule';
  state.isDropdownOpen = false;
  state.isExpertDropdownOpen = false;
  renderApp();
}

// 打开智能体档案
function openProfileView(e) {
  if (e) e.stopPropagation();
  state.activeChatTitle = null;
  state.activeExpert = null;
  state.currentView = 'profile';
  state.isDropdownOpen = false;
  state.isExpertDropdownOpen = false;
  renderApp();
}

// 推荐提问芯片点击
function usePrompt(promptText) {
  const input = document.getElementById('dialog-chat-input') || document.getElementById('chat-input');
  if (input) {
    input.value = promptText;
    if (state.currentView === 'dialog') {
      handleSendDialogChat();
    } else {
      handleSendNewChat();
    }
  }
}

// 供 iframe (如帮我听) 调用，添加历史对话记录
window.addHistoryChatFromIframe = function(title) {
  if (!title) return;
  const chats = getAgentChats(state.currentAgent);
  if (!chats.includes(title)) {
    chats.unshift(title);
    renderSidebar();
  }
};

// 发送新对话（来自专家新建页或普通新建页）
function handleSendNewChat() {
  const input = document.getElementById('chat-input');
  const val = input ? input.value.trim() : (state.chatInputDraft || '').trim();
  if (!val) return;

  state.chatInputDraft = '';
  let currentExp = state.activeExpert;
  if (!currentExp && val.includes('@')) {
    currentExp = expertList.find(e => val.includes(`@${e.name}`));
  }

  // 1. 如果当前处于专家新建对话视图，为该首条消息初始化专家对话 mock 数据
  if (currentExp) {
    mockConversations[val] = {
      type: "twin",
      expertId: currentExp.id,
      messages: [
        {
          role: "user",
          content: val
        },
        {
          role: "assistant",
          htmlContent: `
            <p>你好！收到你的问题：<strong>"${escapeHtml(val)}"</strong>。</p>
            <p>作为<strong>${escapeHtml(currentExp.name)}的AI分身</strong>，在<strong>${escapeHtml(currentExp.tag || '前沿技术')}</strong>方向上，我的核心建议是聚焦场景价值与关键路径设计，分阶段推动技术突破与工程落地。</p>
            <p>后续我们可以针对具体细节做进一步深入探讨！</p>
          `
        }
      ]
    };
  }

  // 2. 将用户发送的消息作为新会话标题加入历史记录
  const chats = getAgentChats(state.currentAgent);
  if (!chats.includes(val)) {
    chats.unshift(val);
  }
  
  // 3. 打开该对话
  openDialogChat(val);
}

// 发送对话视图中的追加消息
function handleSendDialogChat() {
  const input = document.getElementById('dialog-chat-input');
  const val = input ? input.value.trim() : '';
  if (!val) return;

  input.value = '';
  const msgContainer = document.getElementById('dialog-messages');
  if (!msgContainer) return;

  // 1. 追加用户消息
  const userRow = document.createElement('div');
  userRow.className = 'msg-row user';
  userRow.innerHTML = `<div class="msg-bubble-user">${escapeHtml(val)}</div>`;
  msgContainer.appendChild(userRow);

  const selectedExp = state.activeExpert;
  const chatTitle = state.activeChatTitle;
  const conv = mockConversations[chatTitle];
  let dialogExp = null;
  if (conv && conv.expertId) {
    dialogExp = expertList.find(e => e.id === conv.expertId) || null;
  } else if (chatTitle && chatTitle.startsWith('与') && chatTitle.endsWith('对话')) {
    const expName = chatTitle.substring(1, chatTitle.length - 2);
    dialogExp = expertList.find(e => e.name === expName) || null;
  }

  const isTwin = dialogExp || (conv && conv.type === 'twin') || state.currentAgent.includes('分身') || (chatTitle && (chatTitle.includes('具身') || chatTitle.includes('VLA')));

  // 2. 模拟 AI 回复
  setTimeout(() => {
    const botRow = document.createElement('div');
    if (isTwin) {
      const exp = dialogExp || selectedExp;
      const avatarGradient = exp ? exp.gradient : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
      const expName = exp ? exp.name : 'AI分身';
      botRow.className = 'msg-row assistant twin-assistant';
      botRow.innerHTML = `
        <div class="twin-avatar-box" style="background: ${avatarGradient};" title="${escapeHtml(expName)}的AI分身">
          <svg class="icon" viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#ffffff;fill:none;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="msg-content-twin msg-text">
          <p>收到你的想法：<strong>"${escapeHtml(val)}"</strong>。</p>
          <p>从<strong>${escapeHtml(expName)}</strong>分身视角来看，这方向非常值得持续深挖。后续我们可以配合团队进一步做策略验证。</p>
        </div>
      `;
    } else if (selectedExp) {
      botRow.className = 'msg-row assistant with-expert-header';
      botRow.innerHTML = `
        ${_buildExpertHeaderHtml(selectedExp)}
        <div class="msg-content-agent msg-text">
          <p>你好！我是<strong>${escapeHtml(selectedExp.name)}的AI分身</strong>。</p>
          <p>针对你在 Agent 对话中提出的：<strong>“${escapeHtml(val)}”</strong>，我的建议是关注关键路径与场景落地。</p>
        </div>
      `;
    } else {
      botRow.className = 'msg-row assistant';
      botRow.innerHTML = `
        <div class="msg-content-agent msg-text">
          <p>理解你的要求：<strong>“${escapeHtml(val)}”</strong>。</p>
          <p>已为你更新对话上下文，随时可提出后续分析或生成任务！</p>
        </div>
      `;
    }
    msgContainer.appendChild(botRow);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }, 500);

  msgContainer.scrollTop = msgContainer.scrollHeight;
}

// 分身广场卡片搜索
function handlePlazaSearch(val) {
  state.plazaSearchKeyword = val.trim();
  const mainEl = document.getElementById('main-container');
  mainEl.innerHTML = renderPlazaView();
  const searchInput = document.getElementById('plaza-search-input');
  if (searchInput) {
    searchInput.focus();
    searchInput.setSelectionRange(val.length, val.length);
  }
}

// 点击专家卡片 -> 进入专家新建对话页（发送首条消息后再生成历史记录）
function onExpertCardClick(expertId, event) {
  if (!event.target.closest('.expert-card-hover-action')) {
    startChatWithExpertById(expertId);
  }
}

function startChatWithExpertBtn(expertId, event) {
  if (event) event.stopPropagation();
  startChatWithExpertById(expertId);
}

function startChatWithExpertById(expertId) {
  const exp = expertList.find(item => item.id === expertId);
  if (!exp) return;

  // 状态更新：从专家广场进入该专家的新建对话视图
  state.activeChatTitle = null;
  state.activeExpert = exp;
  state.expertSelectMode = 'direct';
  state.currentView = 'expert-chat-new';
  state.isDropdownOpen = false;
  state.isExpertDropdownOpen = false;

  renderApp();
}

// Modal 弹窗
function openCreateAgentModal(e) {
  if (e) e.stopPropagation();
  closeAgentMenu();
  document.getElementById('create-modal').classList.add('show');
}

function closeCreateAgentModal() {
  document.getElementById('create-modal').classList.remove('show');
  document.getElementById('new-agent-name').value = '';
}

function closeModalOnOverlay(e) {
  if (e.target.id === 'create-modal') {
    closeCreateAgentModal();
  }
}

function confirmCreateAgent() {
  const nameInput = document.getElementById('new-agent-name').value.trim();
  if (!nameInput) {
    alert('请输入AI分身名称');
    return;
  }

  const newAgentName = nameInput;

  if (!agentData[newAgentName]) {
    agentData[newAgentName] = [
      `${newAgentName} 初始化对话`,
      `关于 ${newAgentName} 的使用指南`
    ];

    const gradients = [
      "linear-gradient(135deg, #0284c7, #38bdf8)",
      "linear-gradient(135deg, #10b981, #059669)",
      "linear-gradient(135deg, #f59e0b, #d97706)",
      "linear-gradient(135deg, #8b5cf6, #6366f1)",
      "linear-gradient(135deg, #ec4899, #f43f5e)",
      "linear-gradient(135deg, #06b6d4, #0891b2)"
    ];
    const assignedGradient = gradients[agentMenuItems.length % gradients.length];

    const firstChar = nameInput.charAt(0).toUpperCase();
    agentMenuItems.push({
      name: newAgentName,
      avatar: firstChar,
      gradient: assignedGradient,
      isPending: true
    });
  }

  state.hasCreatedAvatar = true;
  closeCreateAgentModal();
  selectAgent(newAgentName);
}

// 模拟完成 AI 分身提炼
function completeAgentDistill(agentName) {
  const item = agentMenuItems.find(a => a.name === agentName);
  if (item) {
    item.isPending = false;
  }
  showToast(`专属AI分身【${agentName}】模型提炼完成！`);
  selectAgent(agentName);
}

// Toast
function showToast(msg) {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// 点击空白关闭下拉
window.addEventListener('click', (e) => {
  closeAgentMenu();
  if (state.isExpertDropdownOpen || state.isListenDropdownOpen) {
    state.isExpertDropdownOpen = false;
    state.isListenDropdownOpen = false;
    renderApp();
  }
  if (e && !e.target.closest('#at-expert-mention-popup') && !e.target.classList.contains('chat-textarea')) {
    hideAtMentionPopup();
  }
});

// -------------------------------------------------------------
// 艾特 (@) 专家列表 动态输入与光标跟踪定位
// -------------------------------------------------------------

const atMentionState = {
  active: false,
  inputEl: null,
  atIndex: -1,
  query: "",
  selectedIndex: 0,
  matches: []
};

// 计算 input/textarea 内指定字符 (或光标) 的屏幕绝对坐标
function getCaretCoordinates(element, position) {
  let div = document.getElementById('textarea-caret-mirror-div');
  if (!div) {
    div = document.createElement('div');
    div.id = 'textarea-caret-mirror-div';
    document.body.appendChild(div);
  }

  const style = div.style;
  const computed = window.getComputedStyle(element);

  style.whiteSpace = 'pre-wrap';
  style.wordWrap = 'break-word';
  style.position = 'absolute';
  style.visibility = 'hidden';
  style.overflow = 'hidden';

  const properties = [
    'direction', 'boxSizing', 'width', 'height',
    'overflowX', 'overflowY',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch',
    'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily',
    'textAlign', 'textTransform', 'textIndent', 'letterSpacing', 'wordSpacing'
  ];

  properties.forEach(prop => {
    style[prop] = computed[prop];
  });

  style.width = element.clientWidth + 'px';

  div.textContent = element.value.substring(0, position);

  const span = document.createElement('span');
  span.textContent = element.value.substring(position, position + 1) || '@';
  div.appendChild(span);

  const coordinates = {
    top: span.offsetTop - element.scrollTop,
    left: span.offsetLeft - element.scrollLeft,
    height: span.offsetHeight || parseInt(computed.lineHeight) || 20
  };

  return coordinates;
}

function handleTextareaInput(e) {
  const input = e.target;
  if (!input || !input.classList.contains('chat-textarea')) return;

  const val = input.value;
  const caretPos = input.selectionStart;
  if (caretPos === undefined) {
    hideAtMentionPopup();
    return;
  }

  const atIndex = val.lastIndexOf('@', caretPos - 1);
  if (atIndex !== -1) {
    const textBetween = val.substring(atIndex + 1, caretPos);
    if (/^\S*$/.test(textBetween)) {
      const query = textBetween.toLowerCase();
      const matches = expertList.filter(exp => 
        exp.name.toLowerCase().includes(query) ||
        exp.role.toLowerCase().includes(query) ||
        (exp.tag && exp.tag.toLowerCase().includes(query))
      );

      atMentionState.active = true;
      atMentionState.inputEl = input;
      atMentionState.atIndex = atIndex;
      atMentionState.query = query;
      atMentionState.matches = matches;
      if (atMentionState.selectedIndex >= matches.length) {
        atMentionState.selectedIndex = 0;
      }

      showAtMentionPopup(input, atIndex);
      return;
    }
  }

  hideAtMentionPopup();
}

function handleTextareaKeydown(e) {
  const input = e.target;
  if (!input || !input.classList.contains('chat-textarea')) return;

  if (atMentionState.active && atMentionState.matches.length > 0) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      atMentionState.selectedIndex = (atMentionState.selectedIndex + 1) % atMentionState.matches.length;
      updateAtMentionPopupList();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      atMentionState.selectedIndex = (atMentionState.selectedIndex - 1 + atMentionState.matches.length) % atMentionState.matches.length;
      updateAtMentionPopupList();
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const selectedExp = atMentionState.matches[atMentionState.selectedIndex];
      if (selectedExp) {
        selectAtExpert(selectedExp.id);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      hideAtMentionPopup();
      return;
    }
  }
}

function renderAtMentionPopupHtml(matches, selectedIndex) {
  if (!matches || matches.length === 0) {
    return `<div style="padding: 12px; font-size: 13px; color: var(--text-muted); text-align: center;">未找到匹配专家</div>`;
  }
  const itemsHtml = matches.map((exp, idx) => `
    <div class="at-expert-mention-item ${idx === selectedIndex ? 'selected' : ''}" 
         onmousedown="event.preventDefault(); selectAtExpert('${exp.id}')">
      <div class="expert-item-avatar" style="background: ${exp.gradient};">
        <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </div>
      <div class="expert-item-info">
        <div class="expert-item-name">${escapeHtml(exp.name)}</div>
        <div class="expert-item-role">${escapeHtml(exp.role)}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="expert-dropdown-header">选择专家 AI 分身</div>
    <div class="expert-dropdown-list">
      ${itemsHtml}
    </div>
  `;
}

function showAtMentionPopup(input, atIndex) {
  let popup = document.getElementById('at-expert-mention-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'at-expert-mention-popup';
    popup.className = 'at-expert-mention-popup';
    document.body.appendChild(popup);
  }

  popup.innerHTML = renderAtMentionPopupHtml(atMentionState.matches, atMentionState.selectedIndex);
  popup.classList.add('show');

  const coords = getCaretCoordinates(input, atIndex);
  const inputRect = input.getBoundingClientRect();

  const absoluteLeft = inputRect.left + coords.left - input.scrollLeft;
  const absoluteTop = inputRect.top + coords.top - input.scrollTop;

  const popupHeight = popup.offsetHeight || 240;
  let top = absoluteTop - popupHeight - 8;
  let left = absoluteLeft;

  if (top < 10) {
    top = absoluteTop + coords.height + 6;
  }
  if (left + 280 > window.innerWidth - 10) {
    left = window.innerWidth - 290;
  }
  if (left < 10) left = 10;

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

function updateAtMentionPopupList() {
  const popup = document.getElementById('at-expert-mention-popup');
  if (popup && atMentionState.active) {
    popup.innerHTML = renderAtMentionPopupHtml(atMentionState.matches, atMentionState.selectedIndex);
    const selectedEl = popup.querySelector('.at-expert-mention-item.selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }
}

function hideAtMentionPopup() {
  atMentionState.active = false;
  atMentionState.inputEl = null;
  atMentionState.atIndex = -1;
  atMentionState.query = "";
  atMentionState.matches = [];
  atMentionState.selectedIndex = 0;

  const popup = document.getElementById('at-expert-mention-popup');
  if (popup) {
    popup.classList.remove('show');
  }
}

function selectAtExpert(expertId) {
  const exp = expertList.find(e => e.id === expertId);
  const input = atMentionState.inputEl || document.activeElement;
  if (!exp || !input) return;

  const val = input.value;
  const atIndex = atMentionState.atIndex >= 0 ? atMentionState.atIndex : val.lastIndexOf('@');
  const caretPos = input.selectionStart || val.length;

  if (atIndex !== -1) {
    const before = val.substring(0, atIndex);
    const after = val.substring(caretPos);
    const insertText = `@${exp.name} `;
    input.value = before + insertText + after;
    state.chatInputDraft = input.value;

    const newCaretPos = before.length + insertText.length;
    input.focus();
    input.setSelectionRange(newCaretPos, newCaretPos);
  }

  hideAtMentionPopup();
}

// 绑定全局事件监听器
document.addEventListener('input', handleTextareaInput);
document.addEventListener('keydown', handleTextareaKeydown);

