/**
 * 我的AI分身页面 (views/view-clones.js)
 * 职责：渲染专属分身矩阵列表、提供新建分身入口、点击卡片查看详情、提供“发起对话”直接进入对话
 */

function renderMyClonesView() {
  const clones = myClones || [];

  const cardsHtml = clones.map(clone => {
    const isDistilling = (clone.status === 'distilling');
    const filesCount = (clone.files && clone.files.length) || 0;
    const memoriesCount = (clone.memories && clone.memories.length) || 0;

    const statusPillHtml = isDistilling
      ? `<span class="clone-status-pill distilling">
           <span class="pulse-dot"></span>
           <span>提炼中 (${clone.progress || 68}%)</span>
         </span>`
      : `<span class="clone-status-pill ready">
           <span class="ready-dot"></span>
           <span>已就绪</span>
         </span>`;

    const clickAction = isDistilling
      ? `openDistillView('${clone.id}')`
      : `openCloneDetailView('${clone.id}')`;

    return `
      <div class="my-clone-card ${isDistilling ? 'is-distilling' : ''}" onclick="${clickAction}">
        <div class="clone-card-header">
          <div class="clone-avatar-badge" style="background: ${clone.gradient};">
            ${escapeHtml(clone.avatar || clone.name.charAt(0))}
          </div>
          <div class="clone-header-info">
            <div class="clone-name-row">
              <h3 class="clone-card-title">${escapeHtml(clone.name)}</h3>
              ${statusPillHtml}
            </div>
            <div class="clone-tag-pill">${escapeHtml(clone.tag || '专属分身')}</div>
          </div>
        </div>

        <p class="clone-card-desc">${escapeHtml(clone.desc || '专属定制 AI 分身')}</p>

        <div class="clone-card-meta">
          <div class="clone-meta-item">
            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>${filesCount} 个知识文件</span>
          </div>
          <div class="clone-meta-item">
            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
            <span>${memoriesCount} 条特征记忆</span>
          </div>
        </div>

        <div class="clone-card-footer">
          <span class="clone-create-time">创建于 ${escapeHtml(clone.createTime || '2026-08-18')}</span>
          <div class="clone-card-actions">
            ${isDistilling ? `
              <button class="btn-clone-chat distilling-btn" onclick="event.stopPropagation(); openDistillView('${clone.id}')">
                <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>查看进度</span>
              </button>
            ` : `
              <button class="btn-clone-chat" onclick="event.stopPropagation(); startChatWithClone('${clone.id}')" title="发起对话">
                <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>发起对话</span>
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="my-clones-view">
      <!-- 顶部 Header -->
      <div class="my-clones-header">
        <div class="my-clones-title-group">
          <div class="my-clones-avatar-badge">
            <svg class="icon" viewBox="0 0 24 24" style="width:24px;height:24px;stroke:#ec4899;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div class="my-clones-title-row">
              <h1 class="my-clones-title">我的AI分身</h1>
              <span class="clones-count-badge">${clones.length} 个分身</span>
            </div>
            <p class="my-clones-subtitle">管理您专属打造与沉淀的个人 AI 分身矩阵，沉淀人设记忆、专属知识与技能模型</p>
          </div>
        </div>

        <div class="my-clones-header-actions">
          <button class="btn btn-primary" onclick="openCreateAgentModal(event)">
            <svg class="icon" viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#fff;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>创建专属AI分身</span>
          </button>
        </div>
      </div>

      <!-- 分身卡片网格 -->
      <div class="my-clones-content">
        <div class="my-clones-grid">
          ${cardsHtml}

          <!-- 新建分身引导卡片 -->
          <div class="my-clone-card add-clone-card" onclick="openCreateAgentModal(event)">
            <div class="add-clone-icon-box">
              <svg class="icon" viewBox="0 0 24 24" style="width:24px;height:24px;stroke:#10a37f;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div class="add-clone-title">创建新的 AI 分身</div>
            <p class="add-clone-desc">上传业务语料与人设资料，快速提炼您的专属数字分身</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
