/**
 * 我的分身 新建对话独立视图 (views/view-clone-new.js)
 * 职责：渲染专属 AI 分身的独立新建对话界面（包含分身人设卡片、推荐提问芯片和置底输入框）
 */

function renderCloneNewView(cloneObj) {
  const clone = cloneObj || myClones.find(c => c.id === state.activeCloneId) || myClones[0];
  if (!clone) return '';

  let p1 = `请介绍你在 ${clone.tag || '专属领域'} 的核心专长与能力`;
  let p2 = `基于你的专属知识库，帮我梳理关键要点`;
  let p3 = `针对当前业务目标，给出落地执行方案`;

  if (clone.name.includes('诗')) {
    p1 = `以“秋月”为题，创作一首七言律诗`;
    p2 = `优化宋词意境与平水韵声律`;
    p3 = `规划现代抒情诗歌创作提纲`;
  } else if (clone.name.includes('具身')) {
    p1 = `探讨具身智能物理仿真与VLA模型控制`;
    p2 = `Sim-to-Real 跨域迁移算法实践建议`;
    p3 = `机械臂运动轨迹规划策略`;
  } else if (clone.name.includes('代码') || clone.name.includes('审计')) {
    p1 = `扫描系统架构中的并发性能瓶颈与异味`;
    p2 = `审查微服务高可用与安全合规规范`;
    p3 = `提供模块解耦与代码重构优化方案`;
  }

  return `
    <div class="chat-new-view is-expert is-clone">
      <div class="expert-intro-card clone-intro-card">
        <div class="intro-avatar-box clone-avatar-box" style="background: ${clone.gradient};">
          <span style="font-size:28px;font-weight:700;color:#fff;">${escapeHtml(clone.avatar || clone.name.charAt(0))}</span>
        </div>
        <div class="intro-meta">
          <div class="clone-intro-header-row" style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
            <h2 class="intro-name" style="margin-bottom:0;">${escapeHtml(clone.name)}</h2>
            <span class="clone-status-pill ready"><span class="ready-dot"></span>已就绪</span>
          </div>
          <div class="intro-role" style="background:#fce7f3;color:#be185d;">${escapeHtml(clone.tag || '专属AI分身')} · 我的分身</div>
          <p class="intro-desc">${escapeHtml(clone.desc || '专注于该业务领域的专属定制AI分身')}</p>
        </div>
        <div class="intro-prompts">
          <div class="prompt-chip" onclick="usePrompt('${escapeJsString(p1)}')">💡 ${escapeHtml(p1)}</div>
          <div class="prompt-chip" onclick="usePrompt('${escapeJsString(p2)}')">🎯 ${escapeHtml(p2)}</div>
          <div class="prompt-chip" onclick="usePrompt('${escapeJsString(p3)}')">⚙️ ${escapeHtml(p3)}</div>
        </div>
      </div>

      <div class="input-card">
        <textarea class="chat-textarea" id="chat-input" placeholder="给 ${escapeHtml(clone.name)} 发送消息..."></textarea>
        
        <div class="input-card-bottom">
          <div class="input-card-bottom-left">
            <button class="action-btn" title="上传附件">
              <svg class="icon" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
          </div>
          
          <button class="action-btn send-btn" title="发送" onclick="handleSendNewChat()">
            <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}
