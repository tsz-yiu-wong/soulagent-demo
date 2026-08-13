/**
 * 对话详情视图 (views/view-dialog.js)
 * 职责：渲染历史对话详情消息流与对话框交互
 */

function renderDialogView() {
  const chatTitle = state.activeChatTitle;
  const isTwin = state.currentAgent.includes('分身') || (chatTitle && (chatTitle.includes('具身') || chatTitle.includes('VLA') || chatTitle.includes('机器人')));

  let convData = mockConversations[chatTitle];
  if (!convData) {
    convData = generateDynamicConversation(chatTitle, isTwin);
  }

  const messagesHtml = convData.messages.map(msg => {
    if (msg.role === 'user') {
      return `
        <div class="msg-row user">
          <div class="msg-bubble-user">${escapeHtml(msg.content)}</div>
        </div>
      `;
    } else {
      if (convData.type === 'twin') {
        return `
          <div class="msg-row assistant twin-assistant">
            <div class="twin-avatar-box" title="AI分身">
              <svg class="icon" viewBox="0 0 24 24" style="width:20px;height:20px;stroke:#ffffff;fill:none;">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="msg-content-twin msg-text">
              ${msg.htmlContent || escapeHtml(msg.content)}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="msg-row assistant">
            <div class="msg-content-agent msg-text">
              ${msg.htmlContent || escapeHtml(msg.content)}
            </div>
          </div>
        `;
      }
    }
  }).join('');

  return `
    <div class="chat-dialog-view">
      <div class="dialog-header">
        <div class="dialog-header-title">
          <span>${escapeHtml(chatTitle)}</span>
        </div>
      </div>
      
      <div class="dialog-messages" id="dialog-messages">
        ${messagesHtml}
      </div>

      <div class="dialog-bottom-input">
        <div class="input-card" style="border-radius: 16px; padding: 12px 14px;">
          <textarea class="chat-textarea" id="dialog-chat-input" style="min-height: 48px; max-height: 120px;" placeholder="发送消息..."></textarea>
          
          <div class="input-card-bottom">
            <button class="action-btn" title="上传附件">
              <svg class="icon" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            
            <button class="action-btn send-btn" title="发送" onclick="handleSendDialogChat()">
              <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateDynamicConversation(title, isTwin) {
  if (isTwin) {
    return {
      type: "twin",
      messages: [
        { role: "user", content: `关于“${title}”，想听听您的核心思路和战略建议。` },
        {
          role: "assistant",
          htmlContent: `
            <p>针对<strong>“${escapeHtml(title)}”</strong>，我的思考主要分为三个重点维度：</p>
            <ol>
              <li><strong>核心抓手</strong>：聚焦高价值场景，形成数据与业务流程的深度融合。</li>
              <li><strong>关键路线</strong>：通过模块化解耦与可扩展架构，保证高可用性与迭代效率。</li>
              <li><strong>复盘与沉淀</strong>：建立长效反馈机制，将实践经验快速转化为能力壁垒。</li>
            </ol>
            <p>我们可以先从第一阶段的试点工作切入，快速验证收益。</p>
          `
        }
      ]
    };
  } else {
    return {
      type: "agent",
      messages: [
        { role: "user", content: `请帮我整理关于“${title}”的概要和核心要点。` },
        {
          role: "assistant",
          htmlContent: `
            <p>已为您梳理关于<strong>“${escapeHtml(title)}”</strong>的核心要点：</p>
            <ul>
              <li><strong>需求目标</strong>：明确业务边界，提升整体协同效率。</li>
              <li><strong>具体方案</strong>：遵循模块化设计原则，分阶段逐步落地。</li>
              <li><strong>预期收益</strong>：优化流程体验，大幅降低运营沟通成本。</li>
            </ul>
            <p>如需进一步补充细节或深化某一部分，请随时告知。</p>
          `
        }
      ]
    };
  }
}
