/**
 * 分身详情页面 (views/view-clone-detail.js)
 * 职责：渲染专属分身的详情页，包含返回按钮、分身概要、知识文件、记忆特征以及Agent设定 Tab 切换
 */

function renderCloneDetailView() {
  const cloneId = state.activeCloneId || 'clone-poetry';
  const clone = myClones.find(c => c.id === cloneId) || myClones[0];
  if (!clone) {
    return `<div class="p-8 text-center text-muted">未找到该分身数据</div>`;
  }

  const currentTab = state.cloneDetailTab || 'files';
  const files = clone.files || [];
  const memories = clone.memories || [];
  const s = clone.settings || {
    systemPrompt: `你是 ${clone.name}，专注于 ${clone.tag || '专业领域'}。`,
    model: 'Soul-LLM-v4-Ultra',
    temperature: 0.7,
    maxTokens: 4096,
    capabilities: { codeInterpreter: true, webSearch: true, deepReasoning: true, memoryPersistence: true }
  };

  return `
    <div class="clone-detail-view">
      <!-- 顶部返回栏 -->
      <div class="clone-detail-nav">
        <button class="btn-back-link" onclick="openMyClonesView()">
          <svg class="icon" viewBox="0 0 24 24" style="width:16px;height:16px;"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          <span>返回我的AI分身</span>
        </button>
      </div>

      <!-- 分身 Hero 卡片 -->
      <div class="clone-hero-card">
        <div class="clone-hero-left">
          <div class="clone-hero-avatar" style="background: ${clone.gradient};">
            ${escapeHtml(clone.avatar || clone.name.charAt(0))}
          </div>
          <div class="clone-hero-meta">
            <div class="clone-hero-name-row">
              <h1 class="clone-hero-name">${escapeHtml(clone.name)}</h1>
              <span class="clone-status-pill ready">
                <span class="ready-dot"></span>
                <span>已就绪</span>
              </span>
              <span class="clone-hero-tag">${escapeHtml(clone.tag || '专属分身')}</span>
            </div>
            <p class="clone-hero-desc">${escapeHtml(clone.desc || '专注于特定业务领域的高精度定制分身')}</p>
          </div>
        </div>

        <div class="clone-hero-actions">
          <button class="btn btn-primary" onclick="startChatWithClone('${clone.id}')" title="与该分身发起对话">
            <svg class="icon" viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#fff;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>发起对话</span>
          </button>
        </div>
      </div>

      <!-- 划线 Tab 栏 (Underline Tabs) -->
      <div class="clone-line-tabs">
        <div class="profile-tab-item ${currentTab === 'files' ? 'active' : ''}" onclick="switchCloneDetailTab('files')">
          <svg class="icon" viewBox="0 0 24 24" style="width:16px;height:16px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>知识文件</span>
          <span class="tab-badge">${files.length}</span>
        </div>
        <div class="profile-tab-item ${currentTab === 'memory' ? 'active' : ''}" onclick="switchCloneDetailTab('memory')">
          <svg class="icon" viewBox="0 0 24 24" style="width:16px;height:16px;"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
          <span>记忆特征</span>
          <span class="tab-badge">${memories.length}</span>
        </div>
        <div class="profile-tab-item ${currentTab === 'settings' ? 'active' : ''}" onclick="switchCloneDetailTab('settings')">
          <svg class="icon" viewBox="0 0 24 24" style="width:16px;height:16px;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>Agent设定</span>
        </div>
      </div>

      <!-- Tab 主体内容 -->
      <div class="clone-detail-body">
        ${renderCloneDetailTabContent(clone, currentTab)}
      </div>
    </div>
  `;
}

function renderCloneDetailTabContent(clone, tab) {
  if (tab === 'files') {
    return renderCloneFilesPanel(clone);
  } else if (tab === 'memory') {
    return renderCloneMemoryPanel(clone);
  } else if (tab === 'settings') {
    return renderCloneSettingsPanel(clone);
  }
  return renderCloneFilesPanel(clone);
}

function renderCloneFilesPanel(clone) {
  const files = clone.files || [];

  const fileRowsHtml = files.map(file => {
    let typeBg = '#e0f2fe'; let typeColor = '#0369a1'; let typeLabel = 'PDF';
    if (file.type === 'doc') { typeBg = '#dbeafe'; typeColor = '#1d4ed8'; typeLabel = 'DOC'; }
    else if (file.type === 'md') { typeBg = '#fce7f3'; typeColor = '#be185d'; typeLabel = 'MD'; }
    else if (file.type === 'xls') { typeBg = '#dcfce7'; typeColor = '#15803d'; typeLabel = 'XLS'; }

    return `
      <tr class="file-table-row">
        <td>
          <div class="file-name-cell">
            <div class="file-type-icon" style="background:${typeBg};color:${typeColor};">${typeLabel}</div>
            <div class="file-title-info">
              <span class="file-name-text" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
              <span class="file-tokens-text">已提取约 ${file.tokens} Tokens</span>
            </div>
          </div>
        </td>
        <td class="file-size-cell">${file.size}</td>
        <td>
          <span class="file-status-badge">
            <span class="status-dot"></span>
            ${escapeHtml(file.status)}
          </span>
        </td>
        <td class="file-time-cell">${file.time}</td>
        <td class="file-actions-cell">
          <button class="icon-btn-text" onclick="previewCloneFile('${clone.id}', '${file.id}')">
            <span>预览</span>
          </button>
          <button class="icon-btn-text danger" onclick="deleteCloneFile('${clone.id}', '${file.id}')">
            <span>删除</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="files-panel">
      <div class="files-top-bar">
        <div class="files-storage-info">
          <div class="storage-text-row">
            <span>分身专属语料容量</span>
            <strong>${files.length} 个知识文件 · 约 4.7 MB</strong>
          </div>
          <div class="storage-progress-bar">
            <div class="storage-progress-inner" style="width: 25%;"></div>
          </div>
        </div>

        <div class="files-action-btns">
          <button class="btn btn-primary" onclick="triggerCloneFileUpload('${clone.id}')">
            <svg class="icon" viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#fff;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>上传分身知识文件</span>
          </button>
        </div>
      </div>

      <div class="file-upload-dropzone" onclick="triggerCloneFileUpload('${clone.id}')">
        <div class="dropzone-icon-box">
          <svg class="icon" viewBox="0 0 24 24" style="width:28px;height:28px;stroke:#4f46e5;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="dropzone-text">
          <span class="dropzone-highlight">点击上传</span> 或将文件拖拽至此处
        </div>
        <div class="dropzone-subtext">支持 PDF、DOCX、TXT、MD、XLSX 格式，将用于该分身模型推理与向量增强</div>
      </div>

      <div class="files-table-card">
        <div class="table-header-title">
          <span>专属知识文件 (${files.length})</span>
        </div>

        <table class="files-table">
          <thead>
            <tr>
              <th>文件名</th>
              <th>大小</th>
              <th>解析状态</th>
              <th>上传时间</th>
              <th style="text-align:right;">操作</th>
            </tr>
          </thead>
          <tbody>
            ${files.length > 0 ? fileRowsHtml : '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">暂无上传的文件</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCloneMemoryPanel(clone) {
  const memories = clone.memories || [];

  const memoryCardsHtml = memories.map(mem => {
    let impBg = '#f1f5f9'; let impColor = '#475569';
    if (mem.importance === '高') { impBg = '#fee2e2'; impColor = '#991b1b'; }
    else if (mem.importance === '中') { impBg = '#fef3c7'; impColor = '#92400e'; }

    return `
      <div class="memory-card">
        <div class="memory-card-header">
          <div class="memory-tag-box">
            <span class="memory-category-tag">${escapeHtml(mem.category)}</span>
            <span class="memory-importance-tag" style="background:${impBg};color:${impColor};">重要度: ${escapeHtml(mem.importance)}</span>
          </div>
          <button class="icon-btn-small" onclick="deleteCloneMemory('${clone.id}', '${mem.id}')" title="忘记此条记忆">
            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
        <div class="memory-content-text">${escapeHtml(mem.content)}</div>
        <div class="memory-footer-time">
          <svg class="icon" viewBox="0 0 24 24" style="width:12px;height:12px;stroke:var(--text-muted);"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>记录时间: ${mem.time}</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="memory-panel">
      <div class="memory-top-stats">
        <div class="stat-box">
          <div class="stat-num">${memories.length}</div>
          <div class="stat-label">专属人设与偏好记忆</div>
        </div>
        <div class="stat-box">
          <div class="stat-num">100%</div>
          <div class="stat-label">记忆可用一致性</div>
        </div>
        <div class="stat-box-action">
          <button class="btn" onclick="openAddCloneMemoryModal('${clone.id}')" style="font-size:13px;display:flex;align-items:center;gap:6px;">
            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>添加分身特征记忆</span>
          </button>
        </div>
      </div>

      <div class="memory-grid">
        ${memories.length > 0 ? memoryCardsHtml : '<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-muted);font-size:14px;">暂无该分身的特征记忆</div>'}
      </div>
    </div>
  `;
}

function renderCloneSettingsPanel(clone) {
  const s = clone.settings || {
    systemPrompt: `你是 ${clone.name}。`,
    model: 'Soul-LLM-v4-Ultra',
    temperature: 0.7,
    maxTokens: 4096,
    capabilities: { codeInterpreter: true, webSearch: true, deepReasoning: true, memoryPersistence: true }
  };

  return `
    <div class="settings-panel">
      <form onsubmit="saveCloneSettings('${clone.id}', event)">
        <!-- 1. 系统提示词 / 人设 -->
        <div class="settings-card">
          <div class="settings-card-header">
            <div>
              <h3 class="settings-card-title">分身人设提示词 (System Prompt)</h3>
              <p class="settings-card-desc">定义该专属分身的角色定位、语言风格、专业领域知识与行为约束</p>
            </div>
          </div>
          <div class="prompt-textarea-wrapper">
            <textarea id="clone-setting-prompt" class="settings-textarea" rows="6">${escapeHtml(s.systemPrompt)}</textarea>
            <div class="textarea-footer-info">
              <span>Markdown 格式支持</span>
              <span id="clone-prompt-char-count">${s.systemPrompt.length} 字符</span>
            </div>
          </div>
        </div>

        <!-- 2. 模型与参数配置 -->
        <div class="settings-card">
          <h3 class="settings-card-title">底层基座模型与推理参数</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <label class="setting-label">核心大模型</label>
              <select id="clone-setting-model" class="settings-select">
                <option value="Soul-LLM-v4-Ultra" ${s.model === 'Soul-LLM-v4-Ultra' ? 'selected' : ''}>Soul-LLM v4 Ultra (推荐 · 高智商旗舰)</option>
                <option value="Soul-LLM-v3-Turbo" ${s.model === 'Soul-LLM-v3-Turbo' ? 'selected' : ''}>Soul-LLM v3 Turbo (极速推理)</option>
                <option value="Claude-3-5-Sonnet" ${s.model === 'Claude-3-5-Sonnet' ? 'selected' : ''}>Claude 3.5 Sonnet (强逻辑推理)</option>
              </select>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <span>采样温度 (Temperature): <strong id="clone-temp-val-label">${s.temperature}</strong></span>
              </label>
              <input type="range" id="clone-setting-temp" min="0" max="1" step="0.05" value="${s.temperature}" class="settings-range" oninput="document.getElementById('clone-temp-val-label').innerText = this.value">
            </div>
          </div>
        </div>

        <!-- 3. 高级能力开关 -->
        <div class="settings-card">
          <h3 class="settings-card-title">增强技能扩展</h3>
          <div class="capability-switches-grid">
            <div class="switch-item">
              <div class="switch-info">
                <div class="switch-name">代码解释器 (Code Interpreter)</div>
                <div class="switch-desc">允许执行 Python/JS 处理复杂计算或图表生成</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="clone-cap-code" ${s.capabilities.codeInterpreter ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>

            <div class="switch-item">
              <div class="switch-info">
                <div class="switch-name">实时联网搜索 (Web Search)</div>
                <div class="switch-desc">允许分身实时获取前沿外部资讯与文献</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="clone-cap-search" ${s.capabilities.webSearch ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>

            <div class="switch-item">
              <div class="switch-info">
                <div class="switch-name">深度思维链推理 (Deep Thinking)</div>
                <div class="switch-desc">输出前展开链式推理过程</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="clone-cap-deep" ${s.capabilities.deepReasoning ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="settings-footer-actions">
          <button type="submit" class="btn btn-primary" style="padding:10px 24px;">保存分身设定</button>
        </div>
      </form>
    </div>
  `;
}

function switchCloneDetailTab(tabName) {
  state.cloneDetailTab = tabName;
  renderApp();
}

function triggerCloneFileUpload(cloneId) {
  const clone = myClones.find(c => c.id === cloneId);
  if (!clone) return;

  const newFile = {
    id: 'cf_' + Date.now(),
    name: `${clone.name}_参考语料文档_` + Math.floor(Math.random() * 899 + 100) + '.pdf',
    size: '1.8 MB',
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    status: '解析完成',
    type: 'pdf',
    tokens: '11,200'
  };
  clone.files.unshift(newFile);
  showToast(`已向【${clone.name}】追加知识文件！`);
  renderApp();
}

function deleteCloneFile(cloneId, fileId) {
  const clone = myClones.find(c => c.id === cloneId);
  if (!clone) return;
  clone.files = clone.files.filter(f => f.id !== fileId);
  showToast('知识文件已移除');
  renderApp();
}

function previewCloneFile(cloneId, fileId) {
  const clone = myClones.find(c => c.id === cloneId);
  if (!clone) return;
  const f = clone.files.find(item => item.id === fileId);
  if (f) {
    alert(`【文件预览】\n所属分身: ${clone.name}\n文件名: ${f.name}\n大小: ${f.size}\nTokens: ${f.tokens}\n状态: ${f.status}`);
  }
}

function deleteCloneMemory(cloneId, memId) {
  const clone = myClones.find(c => c.id === cloneId);
  if (!clone) return;
  clone.memories = clone.memories.filter(m => m.id !== memId);
  showToast('已移除该条特征记忆');
  renderApp();
}

function openAddCloneMemoryModal(cloneId) {
  const text = prompt('请输入想要让该分身记住的特征或人设偏好：', '');
  if (text && text.trim()) {
    const clone = myClones.find(c => c.id === cloneId);
    if (!clone) return;
    const newMem = {
      id: 'cm_' + Date.now(),
      category: '人工特征',
      content: text.trim(),
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      importance: '高'
    };
    clone.memories.unshift(newMem);
    showToast(`已添加新特征记忆至【${clone.name}】！`);
    renderApp();
  }
}

function saveCloneSettings(cloneId, e) {
  if (e) e.preventDefault();
  const clone = myClones.find(c => c.id === cloneId);
  if (!clone) return;

  clone.settings.systemPrompt = document.getElementById('clone-setting-prompt').value;
  clone.settings.model = document.getElementById('clone-setting-model').value;
  clone.settings.temperature = parseFloat(document.getElementById('clone-setting-temp').value);
  clone.settings.capabilities.codeInterpreter = document.getElementById('clone-cap-code').checked;
  clone.settings.capabilities.webSearch = document.getElementById('clone-cap-search').checked;
  clone.settings.capabilities.deepReasoning = document.getElementById('clone-cap-deep').checked;

  showToast(`【${clone.name}】设定已保存并生效！`);
}
