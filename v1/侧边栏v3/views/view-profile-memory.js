/**
 * 智能体档案 - 记忆模块 (views/view-profile-memory.js)
 * 职责：渲染长短期记忆与实体统计面板、处理记忆添加、遗忘与清空交互
 */

function renderMemoryPanel() {
  const memories = window.agentProfileData.memories;

  const memoryCardsHtml = memories.map(mem => {
    let impBg = '#f1f5f9';
    let impColor = '#475569';
    if (mem.importance === '高') {
      impBg = '#fee2e2'; impColor = '#991b1b';
    } else if (mem.importance === '中') {
      impBg = '#fef3c7'; impColor = '#92400e';
    }

    return `
      <div class="memory-card">
        <div class="memory-card-header">
          <div class="memory-tag-box">
            <span class="memory-category-tag">${escapeHtml(mem.category)}</span>
            <span class="memory-importance-tag" style="background:${impBg};color:${impColor};">重要度: ${escapeHtml(mem.importance)}</span>
          </div>
          <button class="icon-btn-small" onclick="deleteProfileMemory('${mem.id}')" title="忘记此条记忆">
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
          <div class="stat-label">已学习记忆条目</div>
        </div>
        <div class="stat-box">
          <div class="stat-num">8</div>
          <div class="stat-label">关联核心实体</div>
        </div>
        <div class="stat-box">
          <div class="stat-num">98%</div>
          <div class="stat-label">记忆可用健康度</div>
        </div>
        <div class="stat-box-action">
          <button class="btn" onclick="openAddMemoryModal()" style="font-size:13px;display:flex;align-items:center;gap:6px;">
            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>手动添加记忆</span>
          </button>
          <button class="btn" onclick="clearAllProfileMemories()" style="font-size:13px;color:#dc2626;border-color:#fecaca;">
            <span>清空所有记忆</span>
          </button>
        </div>
      </div>

      <div class="memory-grid">
        ${memories.length > 0 ? memoryCardsHtml : '<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-muted);font-size:14px;">暂无已被记录的AI分身记忆</div>'}
      </div>
    </div>
  `;
}

function deleteProfileMemory(id) {
  window.agentProfileData.memories = window.agentProfileData.memories.filter(m => m.id !== id);
  showToast('已遗忘该条记忆');
  renderApp();
}

function clearAllProfileMemories() {
  if (confirm('确认清空该AI分身所有的记忆积累吗？此操作无法撤销。')) {
    window.agentProfileData.memories = [];
    showToast('记忆已清空');
    renderApp();
  }
}

function openAddMemoryModal() {
  const text = prompt('请输入想要让 Agent 记住的事实或偏好：', '');
  if (text && text.trim()) {
    const newMem = {
      id: 'm_' + Date.now(),
      category: '手动学习',
      content: text.trim(),
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      importance: '高'
    };
    window.agentProfileData.memories.unshift(newMem);
    showToast('已添加新记忆！');
    renderApp();
  }
}
