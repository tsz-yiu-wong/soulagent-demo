/**
 * Agent 新建对话视图 (views/view-agent-new.js)
 * 职责：渲染通用 Agent 新建对话居中界面
 */

function renderAgentNewView() {
  const agentName = state.currentAgent;
  const titleText = (agentName === 'MyAgent' || agentName === '默认智能体' || agentName === '默认')
    ? 'TY，今天需要帮你做什么'
    : `召唤 ${agentName.replace(/\s+/g, '')}，今天需要帮你做什么`;

  const draftText = state.chatInputDraft || '';

  return `
    <div class="chat-new-view">
      <h1 class="hero-title">${escapeHtml(titleText)}</h1>

      <div class="input-card">
        <textarea class="chat-textarea" id="chat-input" placeholder="给AI分身发送消息..." oninput="state.chatInputDraft = this.value">${escapeHtml(draftText)}</textarea>
        
        <div class="input-card-bottom">
          <div class="input-card-bottom-left">
            <button class="action-btn" title="上传附件">
              <svg class="icon" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            ${renderExpertSelectorHtml()}
          </div>
          
          <button class="action-btn send-btn" title="发送" onclick="handleSendNewChat()">
            <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}
