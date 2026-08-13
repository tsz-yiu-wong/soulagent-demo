/**
 * 专家/分身 新建对话视图 (views/view-expert-new.js)
 * 职责：渲染专家 AI 分身的顶部介绍卡片、推荐提问芯片和置底输入框
 */

function renderExpertNewView(expertObj) {
  const agentName = state.currentAgent;
  const expertMatch = expertObj || expertList.find(exp => exp.agentName === agentName || agentName.includes(exp.name));

  const exp = expertMatch || {
    name: agentName.replace('的AI分身', '').replace('AI分身', ''),
    agentName: agentName,
    role: "智源特邀 AI 分身专家",
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    desc: `我是 ${agentName}，专注于前沿技术路线与应用实践。随时与我进行深度学术交流或工程探讨。`,
    tag: "AI分身"
  };

  const p1 = `探讨 ${exp.tag || '大模型'} 前沿发展路线`;
  const p2 = `请介绍您的代表性研究成果`;
  const p3 = `如何与 SoulAgent 结合实践落地`;

  return `
    <div class="chat-new-view is-expert">
      <div class="expert-intro-card">
        <div class="intro-avatar-box" style="background: ${exp.gradient};">
          <svg viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="intro-meta">
          <h2 class="intro-name">${escapeHtml(exp.agentName || exp.name + '的AI分身')}</h2>
          <div class="intro-role">${escapeHtml(exp.role || 'AI 分身专家')}</div>
          <p class="intro-desc">${escapeHtml(exp.desc)}</p>
        </div>
        <div class="intro-prompts">
          <div class="prompt-chip" onclick="usePrompt('${escapeJsString(p1)}')">💡 ${escapeHtml(p1)}</div>
          <div class="prompt-chip" onclick="usePrompt('${escapeJsString(p2)}')">🎯 ${escapeHtml(p2)}</div>
          <div class="prompt-chip" onclick="usePrompt('${escapeJsString(p3)}')">⚙️ ${escapeHtml(p3)}</div>
        </div>
      </div>

      <div class="input-card">
        <textarea class="chat-textarea" id="chat-input" placeholder="给智能体发送消息..."></textarea>
        
        <div class="input-card-bottom">
          <button class="action-btn" title="上传附件">
            <svg class="icon" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          
          <button class="action-btn send-btn" title="发送" onclick="handleSendNewChat()">
            <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}
