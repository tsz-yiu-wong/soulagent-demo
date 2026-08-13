/**
 * 调度中心 (app.js)
 * 职责：维护 SPA 原型状态、响应菜单点击无缝切换右侧视图、处理新建智能体 modal & toast 交互
 */

// 全局响应式状态
const state = {
  currentAgent: "MyAgent",       // 当前选中的智能体
  currentView: "new-chat",       // 当前视图: 'new-chat' | 'expert-chat-new' | 'dialog' | 'plaza'
  activeChatTitle: null,          // 当前激活的历史对话标题
  activeExpert: null,             // 当前选择的专家对象 (用于专家新对话视图)
  isDropdownOpen: false,          // 下拉菜单显隐
  plazaSearchKeyword: ""         // 广场搜索关键字
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
  } else if (state.currentView === 'expert-chat-new') {
    mainEl.innerHTML = renderExpertNewView(state.activeExpert);
  } else if (state.currentView === 'dialog') {
    mainEl.innerHTML = renderDialogView();
    // 自动滚动到底部
    const msgContainer = document.getElementById('dialog-messages');
    if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
  } else {
    // new-chat (普通智能体或智能体下拉选择的专家分身)
    const isExpert = isExpertAgent(state.currentAgent);
    if (isExpert) {
      const expertMatch = expertList.find(exp => exp.agentName === state.currentAgent || state.currentAgent.includes(exp.name));
      mainEl.innerHTML = renderExpertNewView(expertMatch);
    } else {
      mainEl.innerHTML = renderAgentNewView();
    }
  }
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
// 交互事件处理函数
// -------------------------------------------------------------

// 点击侧边栏“召唤 MyAgent”或左侧热区发起新建对话
function startNewChat(e) {
  if (e) e.stopPropagation();
  state.activeChatTitle = null;
  state.activeExpert = null;
  state.currentView = 'new-chat';
  state.isDropdownOpen = false;
  renderApp();
}

// 打开历史对话
function openDialogChat(chatTitle) {
  state.activeChatTitle = chatTitle;

  // 检查是否是与专家的对话（格式：与XX对话）
  if (chatTitle.startsWith('与') && chatTitle.endsWith('对话')) {
    const expName = chatTitle.substring(1, chatTitle.length - 2);
    const exp = expertList.find(e => e.name === expName);
    if (exp) {
      // 专家对话：跳转至只有专家介绍无历史聊天的新对话界面
      state.activeExpert = exp;
      state.currentView = 'expert-chat-new';
      state.isDropdownOpen = false;
      renderApp();
      return;
    }
  }

  state.activeExpert = null;
  state.currentView = 'dialog';
  state.isDropdownOpen = false;
  renderApp();
}

// 切换智能体
function selectAgent(agentName) {
  state.currentAgent = agentName;
  state.activeChatTitle = null;
  state.activeExpert = null;
  state.currentView = 'new-chat';
  state.isDropdownOpen = false;

  // 清除选中智能体的未读蓝点标记
  const item = agentMenuItems.find(i => i.name === agentName);
  if (item) {
    item.unread = false;
  }

  renderApp();
}

// 切换下拉菜单
function toggleAgentMenu(e) {
  if (e) e.stopPropagation();
  state.isDropdownOpen = !state.isDropdownOpen;
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
  renderApp();
}

// 打开帮我听会
function openListenView(e) {
  if (e) e.stopPropagation();
  state.activeChatTitle = null;
  state.activeExpert = null;
  state.currentView = 'listen';
  state.isDropdownOpen = false;
  renderApp();
}

// 打开定时任务
function openScheduleView(e) {
  if (e) e.stopPropagation();
  state.activeChatTitle = null;
  state.activeExpert = null;
  state.currentView = 'schedule';
  state.isDropdownOpen = false;
  renderApp();
}

// 推荐提问芯片点击
function usePrompt(promptText) {
  const input = document.getElementById('chat-input');
  if (input) {
    input.value = promptText;
    handleSendNewChat();
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

// 发送新对话
function handleSendNewChat() {
  const input = document.getElementById('chat-input');
  const val = input ? input.value.trim() : '';
  if (!val) return;

  const chats = getAgentChats(state.currentAgent);
  chats.unshift(val);
  
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

  const isTwin = state.currentAgent.includes('分身') || (state.activeChatTitle && (state.activeChatTitle.includes('具身') || state.activeChatTitle.includes('VLA')));

  // 2. 模拟 AI 回复
  setTimeout(() => {
    const botRow = document.createElement('div');
    if (isTwin) {
      botRow.className = 'msg-row assistant twin-assistant';
      botRow.innerHTML = `
        <div class="twin-avatar-box" title="AI分身">
          <svg class="icon" viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#ffffff;fill:none;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="msg-content-twin msg-text">
          <p>收到你的想法：<strong>“${escapeHtml(val)}”</strong>。</p>
          <p>从分身视角来看，这方向非常值得持续深挖。后续我们可以配合团队进一步做策略验证。</p>
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

// 点击专家卡片 -> 立即对话（关键点：保持当前智能体，加到历史对话顶部，历史对话展示人名标签，右侧展现只有专家介绍的新对话视图）
function onExpertCardClick(expertId, event) {
  if (!event.target.closest('.expert-card-hover-action') && !event.target.closest('.btn-add-agent')) {
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

  const chatTitle = `与${exp.name}对话`;
  
  // 1. 保持在当前智能体（如 MyAgent）的历史对话中追加
  const chats = getAgentChats(state.currentAgent);
  if (!chats.includes(chatTitle)) {
    chats.unshift(chatTitle);
  }

  // 2. 状态更新：激活当前对话项并进入专家新对话视图（无历史聊天记录，只有专家介绍）
  state.activeChatTitle = chatTitle;
  state.activeExpert = exp;
  state.currentView = 'expert-chat-new';
  state.isDropdownOpen = false;

  renderApp();
}

// 飞向召唤智能体按钮的抛物线动画 (类似购物车飞入效果)
function flyToSummonButton(startX, startY, exp, onComplete) {
  const targetEl = document.getElementById('agent-summon-wrapper') || document.querySelector('.agent-summon-bar');
  let targetX = 140;
  let targetY = 65;
  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    targetX = rect.right - 24;
    targetY = rect.top + rect.height / 2;
  }

  const firstChar = exp.name ? exp.name.charAt(0) : 'A';
  const flyingDot = document.createElement('div');
  flyingDot.className = 'flying-agent-dot';
  flyingDot.style.background = exp.gradient || 'linear-gradient(135deg, #4f46e5, #7c3aed)';
  flyingDot.innerText = firstChar;

  flyingDot.style.left = `${startX - 16}px`;
  flyingDot.style.top = `${startY - 16}px`;
  document.body.appendChild(flyingDot);

  const startTime = performance.now();
  const duration = 650;

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const currentX = startX + (targetX - startX) * easeProgress;
    const arc = -90 * Math.sin(progress * Math.PI);
    const currentY = startY + (targetY - startY) * easeProgress + arc;

    const scale = 1 + 0.3 * Math.sin(progress * Math.PI) - 0.45 * progress;
    const opacity = progress > 0.88 ? (1 - progress) / 0.12 : 1;

    flyingDot.style.transform = `translate3d(${currentX - startX}px, ${currentY - startY}px, 0) scale(${Math.max(scale, 0.35)})`;
    flyingDot.style.opacity = opacity;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      flyingDot.remove();
      if (targetEl) {
        targetEl.classList.remove('pulse-bounce');
        void targetEl.offsetWidth;
        targetEl.classList.add('pulse-bounce');
      }
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(step);
}

// 添加专家到我的智能体（添加到智能体下拉菜单中，标注 unread 未读蓝点，触发抛物线飞入动画）
function toggleAddAgent(expertId, event) {
  let startX = null, startY = null;
  if (event) {
    event.stopPropagation();
    if (event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }
  }

  const exp = expertList.find(item => item.id === expertId);
  if (!exp) return;

  exp.added = true;

  if (!agentData[exp.agentName]) {
    agentData[exp.agentName] = [];
  }

  // 查找是否已存在于下拉菜单中，若不存在则添加并带 unread: true 标记
  let existingItem = agentMenuItems.find(item => item.name === exp.agentName);
  if (!existingItem) {
    const firstChar = exp.name.charAt(0);
    existingItem = {
      name: exp.agentName,
      avatar: firstChar,
      gradient: exp.gradient,
      unread: true
    };
    agentMenuItems.push(existingItem);
  } else {
    existingItem.unread = true;
  }

  showToast(`已添加“${exp.name}”到我的智能体`);
  renderApp();

  // 触发抛物线飞入视觉动效
  if (startX !== null && startY !== null) {
    flyToSummonButton(startX, startY, exp);
  }
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
    alert('请输入智能体名称');
    return;
  }

  const newAgentName = nameInput.endsWith('智能体') || nameInput.includes('分身') ? nameInput : `${nameInput} 智能体`;

  if (!agentData[newAgentName]) {
    agentData[newAgentName] = [
      `${newAgentName} 初始化对话`,
      `关于 ${newAgentName} 的使用指南`
    ];

    const firstChar = nameInput.charAt(0).toUpperCase();
    agentMenuItems.push({
      name: newAgentName,
      avatar: firstChar,
      gradient: "linear-gradient(135deg, #0284c7, #38bdf8)"
    });
  }

  closeCreateAgentModal();
  selectAgent(newAgentName);
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
window.addEventListener('click', () => {
  closeAgentMenu();
});
