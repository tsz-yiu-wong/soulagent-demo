/**
 * 全局应用控制器 (js/app.js)
 * 职责：处理全局交互（新建分身弹窗、Toast、@Mention 联想、选择器下拉、发送对话及 Tab 切换）
 */

// 全局响应式状态
const appState = {
  isListenDropdownOpen: false,
  isExpertDropdownOpen: false,
  plazaSearchKeyword: '',
  profileFileSourceFilter: 'all',
  profileTab: 'files',
  cloneDetailTab: 'files'
};

// =============================================================
// 1. Toast 提示
// =============================================================
function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" style="width:18px;height:18px;stroke:#10b981;">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span id="toast-message">${escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);
  } else {
    const msgEl = toast.querySelector('#toast-message');
    if (msgEl) msgEl.innerText = message;
  }

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// =============================================================
// 2. 创建专属分身 Modal
// =============================================================
function openCreateAgentModal(e) {
  if (e) e.stopPropagation();
  let modal = document.getElementById('create-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'create-modal';
    modal.className = 'modal-overlay';
    modal.onclick = closeModalOnOverlay;
    modal.innerHTML = `
      <div class="modal-card" onclick="event.stopPropagation();">
        <div class="modal-title">创建 专属AI分身</div>
        <input type="text" class="modal-input" id="new-agent-name" placeholder="请输入AI分身名称，例如：我的翻译分身">
        <div class="modal-actions">
          <button class="btn" onclick="closeCreateAgentModal()">取消</button>
          <button class="btn btn-primary" onclick="confirmCreateAgent()">确认新建</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.classList.add('active');
  setTimeout(() => {
    const input = document.getElementById('new-agent-name');
    if (input) {
      input.value = '';
      input.focus();
    }
  }, 50);
}

function closeCreateAgentModal() {
  const modal = document.getElementById('create-modal');
  if (modal) modal.classList.remove('active');
}

function closeModalOnOverlay(e) {
  if (e && e.target && e.target.id === 'create-modal') {
    closeCreateAgentModal();
  }
}

function confirmCreateAgent() {
  const input = document.getElementById('new-agent-name');
  const name = input ? input.value.trim() : '';
  if (!name) {
    alert('请输入分身名称！');
    return;
  }

  const newId = 'clone-' + Date.now();
  const gradients = [
    'linear-gradient(135deg, #ec4899, #f43f5e)',
    'linear-gradient(135deg, #0284c7, #38bdf8)',
    'linear-gradient(135deg, #8b5cf6, #6366f1)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)'
  ];
  const randGradient = gradients[Math.floor(Math.random() * gradients.length)];

  const newClone = {
    id: newId,
    name: name,
    avatar: name.charAt(0),
    gradient: randGradient,
    tag: "专属分身",
    desc: `专注于 ${name} 业务场景的高精度定制分身，具备专业领域知识与自我调优能力。`,
    status: "distilling",
    progress: 68,
    createTime: new Date().toISOString().split('T')[0],
    files: [
      { id: 'cf_' + Date.now(), name: `${name}_基础知识库语料.pdf`, size: '2.4 MB', time: new Date().toLocaleString('zh-CN', { hour12: false }), status: '解析中', type: 'pdf', tokens: '14,200' }
    ],
    settings: {
      systemPrompt: `你是 ${name}，专注于特定业务场景。具备专业知识沉淀与严谨逻辑。`,
      model: "Soul-LLM-v4-Ultra",
      temperature: 0.7,
      maxTokens: 4096,
      capabilities: { codeInterpreter: true, webSearch: true, deepReasoning: true, memoryPersistence: true }
    },
    memories: [
      { id: 'cm_' + Date.now(), category: '初始人设', content: `分身名称设定为【${name}】，优先遵循用户指定的领域知识进行响应。`, time: new Date().toLocaleString('zh-CN', { hour12: false }), importance: '高' }
    ]
  };

  window.myClones.unshift(newClone);
  window.syncDataToStorage();

  closeCreateAgentModal();
  showToast(`已成功创建【${name}】，正在提炼模型...`);

  setTimeout(() => {
    window.location.href = getPageUrl('distill.html', { id: newId });
  }, 400);
}

// 模拟完成提炼
function completeAgentDistill(agentName, cloneId) {
  let clone = null;
  if (cloneId) {
    clone = (window.myClones || []).find(c => c.id === cloneId);
  }
  if (!clone && agentName) {
    clone = (window.myClones || []).find(c => c.name === agentName);
  }

  // 若尚未在 myClones 中，则从 presetCloneTemplates 中寻找对应模板并加入
  if (!clone) {
    const presets = window.presetCloneTemplates || [];
    let template = presets.find(t => (cloneId && t.id === cloneId) || (agentName && t.name === agentName));
    if (!template) {
      template = presets.find(p => !(window.myClones || []).some(c => c.id === p.id || c.name === p.name)) || presets[0];
    }
    if (template) {
      clone = JSON.parse(JSON.stringify(template));
      clone.status = 'ready';
      clone.progress = 100;
      window.myClones.push(clone);
    } else {
      clone = {
        id: cloneId || ('clone-' + Date.now()),
        name: agentName || '专属AI分身',
        avatar: (agentName || '分').charAt(0),
        gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
        tag: '专属分身',
        desc: '专注于业务场景的定制分身',
        status: 'ready',
        progress: 100,
        createTime: new Date().toISOString().split('T')[0],
        files: [],
        settings: {},
        memories: []
      };
      window.myClones.push(clone);
    }
  } else {
    clone.status = 'ready';
    clone.progress = 100;
  }

  window.syncDataToStorage();
  showToast(`🎉【${clone.name}】模型提炼完成，已就绪！`);
  setTimeout(() => {
    window.location.href = getPageUrl('profile.html', { id: clone.id });
  }, 500);
}

// =============================================================
// 3. 帮我听会 & AI分身 选择器组件渲染与交互
// =============================================================

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
      <button type="button" class="expert-select-btn ${appState.isListenDropdownOpen ? 'open' : ''}" onclick="toggleListenSelectDropdown(event)" title="帮我听会">
        <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2H3z"/></svg>
        <span>帮我听会</span>
        <svg class="icon chevron-icon" viewBox="0 0 24 24" style="width: 12px; height: 12px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>

      <div class="expert-select-dropdown ${appState.isListenDropdownOpen ? 'show' : ''}">
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
  appState.isListenDropdownOpen = !appState.isListenDropdownOpen;
  appState.isExpertDropdownOpen = false;
  refreshSelectorsUI();
}

function selectListenOptionFromDropdown(meetingName, e) {
  if (e) e.stopPropagation();
  const fillText = `帮我听 ${meetingName}`;
  const input = document.getElementById('chat-input') || document.getElementById('dialog-chat-input');
  if (input) {
    input.value = fillText;
    input.focus();
  }
  appState.isListenDropdownOpen = false;
  refreshSelectorsUI();
}

function renderExpertSelectorHtml() {
  const readyClones = (window.myClones || []).filter(c => c.status === 'ready');

  const clonesItemsHtml = readyClones.map(clone => `
    <div class="expert-dropdown-item" onclick="selectCloneFromDropdown('${clone.id}', event)">
      <div class="expert-item-avatar clone-avatar" style="background: ${clone.gradient};">
        <span>${escapeHtml(clone.avatar || clone.name.charAt(0))}</span>
      </div>
      <div class="expert-item-info">
        <div class="expert-item-name">${escapeHtml(clone.name)}</div>
        <div class="expert-item-role">${escapeHtml(clone.tag || '我的分身')}</div>
      </div>
    </div>
  `).join('');

  const expertsItemsHtml = (window.expertList || []).map(exp => `
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
      <button type="button" class="expert-select-btn ${appState.isExpertDropdownOpen ? 'open' : ''}" onclick="toggleExpertSelectDropdown(event)" title="选择 AI分身">
        <svg class="icon" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>AI分身</span>
        <svg class="icon chevron-icon" viewBox="0 0 24 24" style="width: 12px; height: 12px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>

      <div class="expert-select-dropdown ${appState.isExpertDropdownOpen ? 'show' : ''}">
        <div class="expert-dropdown-header">选择 AI 分身</div>
        <div class="expert-dropdown-list">
          ${readyClones.length > 0 ? `
            <div class="dropdown-category-header">我的分身</div>
            ${clonesItemsHtml}
          ` : ''}
          <div class="dropdown-category-header">专家分身</div>
          ${expertsItemsHtml}
        </div>
      </div>
    </div>
  `;
}

function toggleExpertSelectDropdown(e) {
  if (e) e.stopPropagation();
  appState.isExpertDropdownOpen = !appState.isExpertDropdownOpen;
  appState.isListenDropdownOpen = false;
  refreshSelectorsUI();
}

function selectCloneFromDropdown(cloneId, e) {
  if (e) e.stopPropagation();
  const clone = (window.myClones || []).find(item => item.id === cloneId);
  if (!clone) return;

  const input = document.getElementById('chat-input') || document.getElementById('dialog-chat-input');
  if (input) {
    let currentVal = input.value;
    (window.myClones || []).forEach(item => {
      currentVal = currentVal.replace(new RegExp(`@${item.name}\\s*`, 'g'), '');
    });
    (window.expertList || []).forEach(item => {
      currentVal = currentVal.replace(new RegExp(`@${item.name}\\s*`, 'g'), '');
    });
    input.value = `@${clone.name} ` + currentVal.trimStart();
    input.focus();
  }
  appState.isExpertDropdownOpen = false;
  refreshSelectorsUI();
}

function selectExpertFromDropdown(expertId, e) {
  if (e) e.stopPropagation();
  const exp = (window.expertList || []).find(item => item.id === expertId);
  if (!exp) return;

  const input = document.getElementById('chat-input') || document.getElementById('dialog-chat-input');
  if (input) {
    let currentVal = input.value;
    (window.myClones || []).forEach(item => {
      currentVal = currentVal.replace(new RegExp(`@${item.name}\\s*`, 'g'), '');
    });
    (window.expertList || []).forEach(item => {
      currentVal = currentVal.replace(new RegExp(`@${item.name}\\s*`, 'g'), '');
    });
    input.value = `@${exp.name} ` + currentVal.trimStart();
    input.focus();
  }
  appState.isExpertDropdownOpen = false;
  refreshSelectorsUI();
}

function refreshSelectorsUI() {
  const listenWrap = document.getElementById('listen-select-wrapper');
  if (listenWrap) {
    const btn = listenWrap.querySelector('.expert-select-btn');
    const dropdown = listenWrap.querySelector('.expert-select-dropdown');
    if (btn) btn.classList.toggle('open', appState.isListenDropdownOpen);
    if (dropdown) dropdown.classList.toggle('show', appState.isListenDropdownOpen);
  }

  const expertWrap = document.getElementById('expert-select-wrapper');
  if (expertWrap) {
    const btn = expertWrap.querySelector('.expert-select-btn');
    const dropdown = expertWrap.querySelector('.expert-select-dropdown');
    if (btn) btn.classList.toggle('open', appState.isExpertDropdownOpen);
    if (dropdown) dropdown.classList.toggle('show', appState.isExpertDropdownOpen);
  }
}

// 点击外部关闭下拉菜单
document.addEventListener('click', (e) => {
  if (!e.target.closest('#listen-select-wrapper') && appState.isListenDropdownOpen) {
    appState.isListenDropdownOpen = false;
    refreshSelectorsUI();
  }
  if (!e.target.closest('#expert-select-wrapper') && appState.isExpertDropdownOpen) {
    appState.isExpertDropdownOpen = false;
    refreshSelectorsUI();
  }
});

// =============================================================
// 4. 对话发送与推荐提示词 (Send Chat & Prompt Chips)
// =============================================================

function usePrompt(promptText) {
  const input = document.getElementById('dialog-chat-input') || document.getElementById('chat-input');
  if (input) {
    input.value = promptText;
    const isDialog = window.location.pathname.includes('dialog.html');
    if (isDialog) {
      handleSendDialogChat();
    } else {
      handleSendNewChat();
    }
  }
}

/**
 * 检查文本中是否包含 @ 的分身或专家
 */
function detectMentionedTarget(text) {
  if (!text) return null;
  for (let c of (window.myClones || [])) {
    if (text.includes(`@${c.name}`)) {
      return { target: c, isClone: true, type: 'clone' };
    }
  }
  for (let e of (window.expertList || [])) {
    if (text.includes(`@${e.name}`)) {
      return { target: e, isClone: false, type: 'twin' };
    }
  }
  return null;
}
window.detectMentionedTarget = detectMentionedTarget;

/**
 * 根据 @ 的分身或专家，生成类似“智能系统与环境仿真探讨”中的 Agent 协同咨询回复
 */
function generateConsultingReply(target, userQuery, isClone) {
  const cleanQuery = userQuery.replace(new RegExp(`@${target.name}\\s*`, 'g'), '').trim() || userQuery;
  const targetName = target.name;
  const targetRole = target.role || target.tag || (isClone ? '我的分身' : '领域专家');
  const targetGradient = target.gradient || 'linear-gradient(135deg, #6366f1, #8b5cf6)';

  let quoteContentHtml = '';
  let agentAnalysisHtml = '';
  let followUpHtml = '';

  if (isClone) {
    // 1. 诗词文学创作分身
    if (target.id === 'clone-poetry' || targetName.includes('诗') || targetRole.includes('文学')) {
      const topic = cleanQuery.includes('秋月') ? '秋月' : (cleanQuery.length > 0 && cleanQuery.length <= 8 ? cleanQuery : '抒怀');
      quoteContentHtml = `
        <p style="margin:0 0 6px 0;font-weight:600;color:#e11d48;">💡 ${escapeHtml(targetName)} 的创作与格律解析：</p>
        <div class="poem-block" style="background:#ffffff;border-left:3px solid #ec4899;padding:10px 14px;border-radius:0 8px 8px 0;margin:8px 0;line-height:1.8;color:#1e293b;font-size:14.5px;">
          <strong>《咏${escapeHtml(topic)}》</strong><br>
          碧落霜清夜气森，广寒光满浸枫林。<br>
          孤轮高挂乾坤静，万象遥相岁月深。<br>
          关山客路思乡泪，竹影桐阴抚琴心。<br>
          莫道凭栏无限意，露华沉浸到衣襟。
        </div>
        <p style="margin:6px 0 0 0;font-size:13px;color:#64748b;">
          <strong>声律说明</strong>：遵循平水韵（下平十一尤韵），首联起兴描景，颔联时空哲思，颈联情景交融，尾联含蓄收束。
        </p>
      `;
      agentAnalysisHtml = `你的专属分身已依据知识库中的古典格律规则完成创作。我认为整首诗在意境构建与对仗上非常工整。`;
      followUpHtml = `是否需要我针对其中的<strong>特定词句、押韵或现代诗体裁</strong>做进一步调优？`;
    } 
    // 2. 具身智能控制分身
    else if (target.id === 'clone-embodied' || targetName.includes('具身') || targetRole.includes('具身') || targetRole.includes('控制')) {
      quoteContentHtml = `
        <p style="margin:0 0 6px 0;font-weight:600;color:#0284c7;">💡 ${escapeHtml(targetName)} 的推演与架构建议：</p>
        <ol style="margin:0;padding-left:18px;line-height:1.6;">
          <li><strong>端到端 VLA 分级控制</strong>：采用高频位姿跟踪与低频语义动作规划的双层架构，保障机械臂操作实时性；</li>
          <li><strong>Sim-to-Real 跨域迁移</strong>：在仿真环境中引入物理参数（阻尼、摩擦力、光照）域随机化扰动，缩减虚实迁移鸿沟；</li>
          <li><strong>闭环阻抗控制与安全约束</strong>：结合动力学模型预估接触力，确保作业过程柔顺与防碰撞。</li>
        </ol>
      `;
      agentAnalysisHtml = `分身提出的<strong>“分级架构 + 域随机化扰动”</strong>方案与系统物理仿真接口协议完全契合。`;
      followUpHtml = `是否需要我为你<strong>生成具体的仿真参数配置文件与控制代码示例</strong>？`;
    } 
    // 3. 代码安全审计分身
    else if (target.id === 'clone-code-audit' || targetName.includes('代码') || targetName.includes('审计') || targetRole.includes('工程')) {
      quoteContentHtml = `
        <p style="margin:0 0 6px 0;font-weight:600;color:#7c3aed;">💡 ${escapeHtml(targetName)} 的审计与重构建议：</p>
        <ol style="margin:0;padding-left:18px;line-height:1.6;">
          <li><strong>高并发瓶颈与死锁排查</strong>：重点检查异步流水线中的通道锁竞争与无界队列积压风险；</li>
          <li><strong>资源生命周期闭环</strong>：严格审计连接池与句柄释放逻辑，消除潜在的内存泄漏点；</li>
          <li><strong>解耦与模式重构</strong>：推荐引入观察者/事件总线机制降低模块间强耦合度，提升可测试性。</li>
        </ol>
      `;
      agentAnalysisHtml = `分身已结合企业级安全编码合规规范给出了模块化重构路径。`;
      followUpHtml = `是否需要我为你<strong>输出重构后的关键类设计与单元测试用例</strong>？`;
    } 
    // 4. 其他自定义分身
    else {
      quoteContentHtml = `
        <p style="margin:0 0 6px 0;font-weight:600;color:#4f46e5;">💡 ${escapeHtml(targetName)} 的专业见解：</p>
        <p style="margin:0 0 6px 0;line-height:1.6;">针对“${escapeHtml(cleanQuery)}”，基于专属语料与特征记忆推演：</p>
        <ol style="margin:0;padding-left:18px;line-height:1.6;">
          <li><strong>领域知识映射</strong>：精准提取专属业务规则与核心逻辑链路；</li>
          <li><strong>结构化推演</strong>：严格依据分身人设与算法边界拆解落地路径；</li>
          <li><strong>交付与协同</strong>：提供可验证的执行方案与关键风险防范建议。</li>
        </ol>
      `;
      agentAnalysisHtml = `分身已针对你的需求完成了针对性解析。`;
      followUpHtml = `是否需要我为你<strong>制定具体的执行清单与落地排期</strong>？`;
    }
  } else {
    // 5. 广场专家分身
    const opinionText = (typeof getExpertOpinion === 'function')
      ? getExpertOpinion(target, cleanQuery)
      : `针对“${cleanQuery}”，最核心的是将前沿算法与业务场景实现闭环，建议重点推进落地验证。`;

    quoteContentHtml = `
      <p style="margin:0 0 6px 0;font-weight:600;color:#4f46e5;">💡 ${escapeHtml(targetName)} 的建议：</p>
      <div style="line-height:1.6;color:#334155;">${escapeHtml(opinionText)}</div>
    `;
    agentAnalysisHtml = `我认为${escapeHtml(targetName)}提出的观点非常切中要害，契合当前技术方案的演进路线。`;
    followUpHtml = `是否需要我帮你<strong>生成一份具体的实施步骤与实验方案</strong>？`;
  }

  return `
    <p>帮你咨询了<strong>${escapeHtml(targetName)}</strong>（${escapeHtml(targetRole)}），回复如下：</p>
    <div class="expert-quote-block" style="background:#f8fafc;border-left:3px solid #6366f1;padding:10px 14px;border-radius:0 8px 8px 0;margin:8px 0;color:#334155;">
      ${quoteContentHtml}
    </div>
    <p>${agentAnalysisHtml}</p>
    <p>${followUpHtml}</p>
  `;
}
window.generateConsultingReply = generateConsultingReply;

function handleSendNewChat(targetExpertId, targetCloneId) {
  const input = document.getElementById('chat-input');
  const val = input ? input.value.trim() : '';
  if (!val) return;

  const urlParams = new URLSearchParams(window.location.search);
  const expertId = targetExpertId || urlParams.get('expertId') || (window.location.pathname.includes('expert') ? urlParams.get('id') : null);
  const cloneId = targetCloneId || urlParams.get('cloneId') || (window.location.pathname.includes('clone') ? urlParams.get('id') : null);

  let directExp = null;
  let directClone = null;
  if (expertId && (targetExpertId || window.location.pathname.includes('expert'))) {
    directExp = (window.expertList || []).find(e => e.id === expertId);
  } else if (cloneId && (targetCloneId || window.location.pathname.includes('clone'))) {
    directClone = (window.myClones || []).find(c => c.id === cloneId);
  }

  const chatTitle = val.length > 20 ? val.substring(0, 20) + '...' : val;
  let newConv = null;

  if (directClone) {
    // 从 clone-new 页面直接发起的专属 1v1 对话
    newConv = {
      type: "clone",
      cloneId: directClone.id,
      messages: [
        { role: "user", content: val },
        {
          role: "assistant",
          htmlContent: `
            <p>你好！我是<strong>${escapeHtml(directClone.name)}</strong>（${escapeHtml(directClone.tag || '我的分身')}）。</p>
            <p>基于我学习的知识文件与特征记忆，针对你的问题，我的解答如下：</p>
            <ol>
              <li>已根据专属语料抽取核心规则；</li>
              <li>严格按照分身人设进行推演与结构化输出；</li>
              <li>可继续追问以进行深度润色或调优。</li>
            </ol>
          `
        }
      ]
    };
  } else if (directExp) {
    // 从 expert-new 页面直接发起的专属 1v1 对话
    newConv = {
      type: "twin",
      expertId: directExp.id,
      messages: [
        { role: "user", content: val },
        {
          role: "assistant",
          htmlContent: `
            <p>你好！我是<strong>${escapeHtml(directExp.name)}</strong>的 AI 分身。</p>
            <p>很高兴与你交流！关于“${escapeHtml(val)}”，结合我的专业研究，我有以下见解：</p>
            <p>在 ${escapeHtml(directExp.tag || '该领域')} 中，最核心的是将前沿算法与业务场景实现闭环。随时提出更具体的问题，我们可以共同深入探讨！</p>
          `
        }
      ]
    };
  } else {
    // 在主页 (index.html) 或 AI助手 (MyAgent) 会话中：@分身/专家为 Agent 协同咨询模式
    const mentioned = detectMentionedTarget(val);
    let replyHtml = '';
    if (mentioned) {
      replyHtml = generateConsultingReply(mentioned.target, val, mentioned.isClone);
    } else {
      replyHtml = `
        <p>你好，我是SoulAgent。</p>
        <p>已收到你的需求：<strong>${escapeHtml(val)}</strong>。</p>
        <p>我将从全局架构、具体步骤与落地验证三方面为你提供支持。</p>
      `;
    }

    newConv = {
      type: "agent",
      messages: [
        { role: "user", content: val },
        { role: "assistant", htmlContent: replyHtml }
      ]
    };
  }

  window.mockConversations[chatTitle] = newConv;

  const currentChats = getAgentChats("AI助手");
  if (!currentChats.includes(chatTitle)) {
    currentChats.unshift(chatTitle);
  }
  window.syncDataToStorage();

  window.location.href = getPageUrl('dialog.html', { title: chatTitle });
}

let isGroupGenerating = false;

function triggerGroupSequentialReplies(conv, userPrompt, onComplete) {
  if (!conv || isGroupGenerating) return;

  let groupExps = [];
  if (conv.expertIds && Array.isArray(conv.expertIds)) {
    groupExps = conv.expertIds.map(id => (window.expertList || []).find(e => e.id === id)).filter(Boolean);
  }
  if (groupExps.length === 0 && window.expertList) {
    groupExps = window.expertList.slice(0, 3);
  }

  if (groupExps.length === 0) {
    if (onComplete) onComplete();
    return;
  }

  isGroupGenerating = true;
  const sendBtn = document.querySelector('.dialog-bottom-input .send-btn');
  const chatInput = document.getElementById('dialog-chat-input');
  if (sendBtn) sendBtn.style.opacity = '0.5';
  if (chatInput) chatInput.disabled = true;

  let currentIdx = 0;

  function processNext() {
    if (currentIdx >= groupExps.length) {
      isGroupGenerating = false;
      if (sendBtn) sendBtn.style.opacity = '1';
      if (chatInput) {
        chatInput.disabled = false;
        chatInput.focus();
      }
      window.syncDataToStorage();
      if (typeof renderDialogMessages === 'function') {
        renderDialogMessages(null);
      }
      if (onComplete) onComplete();
      return;
    }

    const exp = groupExps[currentIdx];

    // 先展示该专家正在思考输入
    if (typeof renderDialogMessages === 'function') {
      renderDialogMessages(exp);
    }

    // 延时生成该专家消息（每个专家独立延时，拟人化依次输出）
    setTimeout(() => {
      const opinion = (typeof getExpertOpinion === 'function')
        ? getExpertOpinion(exp, userPrompt)
        : `结合我的专业领域，“${userPrompt}”核心是打通基础算法与业务落地闭环。`;

      conv.messages.push({
        role: 'assistant',
        expertId: exp.id,
        expertName: exp.name,
        expertRole: exp.role,
        expertGradient: exp.gradient,
        htmlContent: `<p>${escapeHtml(opinion)}</p>`
      });

      window.syncDataToStorage();

      if (typeof renderDialogMessages === 'function') {
        renderDialogMessages(null);
      }

      currentIdx++;
      // 下一个专家思考前自然间隔
      setTimeout(processNext, 450);
    }, 1150);
  }

  // 初始等待片刻开始第一位专家思考
  setTimeout(processNext, 350);
}
window.triggerGroupSequentialReplies = triggerGroupSequentialReplies;

function handleSendDialogChat() {
  if (isGroupGenerating) return;

  const input = document.getElementById('dialog-chat-input');
  const val = input ? input.value.trim() : '';
  if (!val) return;

  const urlParams = new URLSearchParams(window.location.search);
  const currentTitle = decodeURIComponent(urlParams.get('title') || '新对话');

  let conv = window.mockConversations[currentTitle];
  if (!conv) {
    conv = generateDynamicConversation(currentTitle, false, null, null);
    window.mockConversations[currentTitle] = conv;
  }

  const isGroup = (conv && conv.type === 'group') || currentTitle.includes('群聊');

  // 追加用户消息
  conv.messages.push({ role: 'user', content: val });
  input.value = '';

  window.syncDataToStorage();
  if (typeof renderDialogMessages === 'function') {
    renderDialogMessages();
  }

  if (isGroup) {
    triggerGroupSequentialReplies(conv, val);
  } else {
    // 检查是否有 @分身 或 @专家
    const mentioned = detectMentionedTarget(val);

    setTimeout(() => {
      let replyHtml = '';
      if (mentioned) {
        replyHtml = generateConsultingReply(mentioned.target, val, mentioned.isClone);
      } else if (conv.type === 'clone') {
        const clone = (window.myClones || []).find(c => c.id === conv.cloneId) || { name: '分身', tag: '专属分身' };
        replyHtml = `<p>已收到你的追问：“${escapeHtml(val)}”。</p><p>我是<strong>${escapeHtml(clone.name)}</strong>，正根据我的专属知识库进行深度分析与回复生成中...</p>`;
      } else if (conv.type === 'twin') {
        const exp = (window.expertList || []).find(e => e.id === conv.expertId) || { name: '专家' };
        replyHtml = `<p>已收到你的问题：“${escapeHtml(val)}”。</p><p>我是<strong>${escapeHtml(exp.name)}</strong>的 AI 分身，正结合专业研究持续为你完善方案中...</p>`;
      } else {
        replyHtml = `<p>已收到你的最新问题：“${escapeHtml(val)}”。</p><p>正在结合上下文与知识库持续推演并完善方案中...如需特定分身或专家协助，可随时输入 <code>@分身名称</code> 召唤。</p>`;
      }

      conv.messages.push({ role: 'assistant', htmlContent: replyHtml });
      window.syncDataToStorage();

      // 重新渲染消息区
      if (typeof renderDialogMessages === 'function') {
        renderDialogMessages();
      }
    }, 400);
  }
}

// =============================================================
// 5. @ Mention 专家/分身 联想弹窗逻辑
// =============================================================

const atMentionState = {
  active: false,
  inputEl: null,
  atIndex: -1,
  query: "",
  matches: [],
  selectedIndex: 0
};

function handleTextareaInput(e) {
  const input = e.target;
  if (!input || (!input.classList.contains('chat-textarea') && !input.classList.contains('dialog-textarea'))) return;

  const val = input.value;
  const caretPos = input.selectionStart;
  const textBefore = val.substring(0, caretPos);
  const lastAtIndex = textBefore.lastIndexOf('@');

  if (lastAtIndex !== -1) {
    const charBeforeAt = lastAtIndex > 0 ? textBefore[lastAtIndex - 1] : ' ';
    if (charBeforeAt === ' ' || charBeforeAt === '\n' || lastAtIndex === 0) {
      const query = textBefore.substring(lastAtIndex + 1);
      if (!query.includes(' ') && !query.includes('\n')) {
        atMentionState.active = true;
        atMentionState.inputEl = input;
        atMentionState.atIndex = lastAtIndex;
        atMentionState.query = query;

        const allCandidates = [
          ...(window.myClones || []).map(c => ({ id: c.id, name: c.name, role: c.tag || '我的分身', gradient: c.gradient, isClone: true })),
          ...(window.expertList || []).map(e => ({ id: e.id, name: e.name, role: e.role, gradient: e.gradient, isClone: false }))
        ];

        atMentionState.matches = allCandidates.filter(item =>
          !query || item.name.toLowerCase().includes(query.toLowerCase()) || item.role.toLowerCase().includes(query.toLowerCase())
        );
        atMentionState.selectedIndex = 0;
        showAtMentionPopup(input, lastAtIndex);
        return;
      }
    }
  }

  hideAtMentionPopup();
}

function handleTextareaKeydown(e) {
  const input = e.target;
  if (!input || (!input.classList.contains('chat-textarea') && !input.classList.contains('dialog-textarea'))) return;

  if (e.key === 'Enter' && !e.shiftKey) {
    if (atMentionState.active && atMentionState.matches.length > 0) {
      e.preventDefault();
      selectAtExpert(atMentionState.matches[atMentionState.selectedIndex].id);
      return;
    }
    e.preventDefault();
    if (input.id === 'chat-input') {
      handleSendNewChat();
    } else if (input.id === 'dialog-chat-input') {
      handleSendDialogChat();
    }
    return;
  }

  if (atMentionState.active) {
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
    if (e.key === 'Escape') {
      e.preventDefault();
      hideAtMentionPopup();
      return;
    }
  }
}

function showAtMentionPopup(input, atIndex) {
  let popup = document.getElementById('at-expert-mention-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'at-expert-mention-popup';
    popup.className = 'at-expert-mention-popup';
    document.body.appendChild(popup);
  }

  if (atMentionState.matches.length === 0) {
    popup.innerHTML = `<div style="padding: 12px; font-size: 13px; color: var(--text-muted); text-align: center;">未找到匹配的分身或专家</div>`;
  } else {
    const itemsHtml = atMentionState.matches.map((item, idx) => `
      <div class="at-expert-mention-item ${idx === atMentionState.selectedIndex ? 'selected' : ''}" 
           onmousedown="event.preventDefault(); selectAtExpert('${item.id}')">
        <div class="expert-item-avatar" style="background: ${item.gradient};">
          <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <div class="expert-item-info">
          <div class="expert-item-name">${escapeHtml(item.name)}</div>
          <div class="expert-item-role">${escapeHtml(item.role)}</div>
        </div>
      </div>
    `).join('');

    popup.innerHTML = `
      <div class="expert-dropdown-header">选择 AI 分身 / 专家</div>
      <div class="expert-dropdown-list">${itemsHtml}</div>
    `;
  }

  popup.classList.add('show');
  const inputRect = input.getBoundingClientRect();
  const popupHeight = popup.offsetHeight || 240;
  let top = inputRect.top - popupHeight - 8;
  let left = inputRect.left + 16;
  if (top < 10) top = inputRect.bottom + 8;
  if (left + 280 > window.innerWidth - 10) left = window.innerWidth - 290;
  if (left < 10) left = 10;

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

function updateAtMentionPopupList() {
  const popup = document.getElementById('at-expert-mention-popup');
  if (popup && atMentionState.active) {
    showAtMentionPopup(atMentionState.inputEl, atMentionState.atIndex);
  }
}

function hideAtMentionPopup() {
  atMentionState.active = false;
  const popup = document.getElementById('at-expert-mention-popup');
  if (popup) popup.classList.remove('show');
}

function selectAtExpert(itemId) {
  const allCandidates = [
    ...(window.myClones || []).map(c => ({ id: c.id, name: c.name })),
    ...(window.expertList || []).map(e => ({ id: e.id, name: e.name }))
  ];
  const target = allCandidates.find(item => item.id === itemId);
  const input = atMentionState.inputEl || document.activeElement;
  if (!target || !input) return;

  const val = input.value;
  const atIndex = atMentionState.atIndex >= 0 ? atMentionState.atIndex : val.lastIndexOf('@');
  const caretPos = input.selectionStart || val.length;

  if (atIndex !== -1) {
    const before = val.substring(0, atIndex);
    const after = val.substring(caretPos);
    const insertText = `@${target.name} `;
    input.value = before + insertText + after;
    const newCaretPos = before.length + insertText.length;
    input.focus();
    input.setSelectionRange(newCaretPos, newCaretPos);
  }

  hideAtMentionPopup();
}

document.addEventListener('input', handleTextareaInput);
document.addEventListener('keydown', handleTextareaKeydown);
