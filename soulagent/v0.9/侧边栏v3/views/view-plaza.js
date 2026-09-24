/**
 * 分身广场视图 (views/view-plaza.js)
 * 职责：渲染专家网格卡片、搜索过滤、卡片 hover 交互
 */

function renderPlazaView() {
  const filtered = expertList.filter(exp => {
    const keyword = state.plazaSearchKeyword;
    return !keyword || exp.name.includes(keyword) || exp.role.includes(keyword) || exp.desc.includes(keyword) || exp.tag.includes(keyword);
  });

  let cardsHtml = '';
  if (filtered.length === 0) {
    cardsHtml = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0; color: var(--text-muted); font-size: 14px;">
        未找到匹配的专家分身
      </div>
    `;
  } else {
    cardsHtml = filtered.map(exp => {
      return `
        <div class="expert-card" onclick="onExpertCardClick('${exp.id}', event)">
          <div class="expert-avatar-container">
            <div class="expert-avatar-box" style="background: ${exp.gradient};">
              <svg class="expert-person-svg" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="expert-status-badge"></div>
          </div>
          <div class="expert-name">${escapeHtml(exp.name)}</div>
          <div class="expert-role">${escapeHtml(exp.role)}</div>
          <div class="expert-desc">${escapeHtml(exp.desc)}</div>

          <div class="expert-footer">
            <span>${escapeHtml(exp.stat)}</span>
            <span>·</span>
            <span>智源专家广场</span>
          </div>

          <div class="expert-card-hover-action">
            <button class="btn-chat-now" onclick="startChatWithExpertBtn('${exp.id}', event)">
              <svg class="icon" style="width:14px;height:14px;stroke:currentColor;" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>新建对话</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  return `
    <div class="plaza-view">
      <div class="plaza-header">
        <div class="plaza-title-row">
          <div>
            <h2 class="plaza-title">AI分身广场</h2>
          </div>
          <div class="plaza-search-box">
            <svg class="icon" viewBox="0 0 24 24" style="width:16px;height:16px;stroke:var(--text-muted);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="plaza-search-input" id="plaza-search-input" value="${escapeHtml(state.plazaSearchKeyword)}" placeholder="搜索专家姓名、领域或关键词..." oninput="handlePlazaSearch(this.value)">
          </div>
        </div>
      </div>

      <div class="plaza-content">
        <div class="expert-grid">
          ${cardsHtml}
        </div>
      </div>
    </div>
  `;
}
