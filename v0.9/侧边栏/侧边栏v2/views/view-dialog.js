/**
 * 对话详情视图 (views/view-dialog.js)
 * 职责：渲染历史对话详情消息流与对话框交互
 */

function renderDialogView() {
  const chatTitle = state.activeChatTitle;
  const conv = mockConversations[chatTitle];
  let dialogExp = null;
  if (conv && conv.expertId) {
    dialogExp = expertList.find(e => e.id === conv.expertId) || null;
  } else if (chatTitle && chatTitle.startsWith('与') && chatTitle.endsWith('对话')) {
    const expName = chatTitle.substring(1, chatTitle.length - 2);
    dialogExp = expertList.find(e => e.name === expName) || null;
  }

  const isTwin = dialogExp || (conv && conv.type === 'twin') || state.currentAgent.includes('分身') || (chatTitle && (chatTitle.includes('具身') || chatTitle.includes('VLA') || chatTitle.includes('机器人')));

  let convData = conv;
  if (!convData) {
    convData = generateDynamicConversation(chatTitle, isTwin, dialogExp);
  }

  // 专家介绍卡片（仅在真正的专家历史对话中展示）
  let expertCardHtml = '';
  if (dialogExp) {
    const p1 = `探讨 ${dialogExp.tag || '大模型'} 前沿发展路线`;
    const p2 = `请介绍您的代表性研究成果`;
    const p3 = `如何与 SoulAgent 结合实践落地`;

    expertCardHtml = `
      <div class="expert-intro-card" style="margin-top: 0; margin-bottom: 8px;">
        <div class="intro-avatar-box" style="background: ${dialogExp.gradient};">
          <svg viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="intro-meta">
          <h2 class="intro-name">${escapeHtml(dialogExp.name)}的AI分身</h2>
          <div class="intro-role">${escapeHtml(dialogExp.role || 'AI 分身专家')}</div>
          <p class="intro-desc">${escapeHtml(dialogExp.desc)}</p>
        </div>
        <div class="intro-prompts">
          <div class="prompt-chip" onclick="usePrompt('${escapeJsString(p1)}')">💡 ${escapeHtml(p1)}</div>
          <div class="prompt-chip" onclick="usePrompt('${escapeJsString(p2)}')">🎯 ${escapeHtml(p2)}</div>
          <div class="prompt-chip" onclick="usePrompt('${escapeJsString(p3)}')">⚙️ ${escapeHtml(p3)}</div>
        </div>
      </div>
    `;
  }

  const messagesHtml = convData.messages.map(msg => {
    if (msg.role === 'user') {
      return `
        <div class="msg-row user">
          <div class="msg-bubble-user">${escapeHtml(msg.content)}</div>
        </div>
      `;
    } else {
      // Check if this specific message has an @mentioned expert header
      const msgMentionedExp = msg.mentionedExpertId
        ? expertList.find(e => e.id === msg.mentionedExpertId)
        : null;

      if (convData.type === 'twin' || isTwin) {
        const avatarGradient = dialogExp ? dialogExp.gradient : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
        const twinTitle = dialogExp ? `${escapeHtml(dialogExp.name)}的AI分身` : 'AI分身';
        return `
          <div class="msg-row assistant twin-assistant">
            <div class="twin-avatar-box" style="background: ${avatarGradient};" title="${twinTitle}">
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
      } else if (msgMentionedExp) {
        // Normal agent reply but with @expert header
        return `
          <div class="msg-row assistant with-expert-header">
            ${_buildExpertHeaderHtml(msgMentionedExp)}
            <div class="msg-content-agent msg-text">
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

  // 底部输入栏左侧内容：Agent历史对话放专家 Selector，专家历史对话不放
  const bottomInputLeftHtml = !isTwin
    ? `<div class="input-card-bottom-left">
         <button class="action-btn" title="上传附件">
           <svg class="icon" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
         </button>
         ${renderExpertSelectorHtml()}
       </div>`
    : `<button class="action-btn" title="上传附件">
         <svg class="icon" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
       </button>`;

  return `
    <div class="chat-dialog-view">
      <div class="dialog-header">
        <div class="dialog-header-title">
          <span>${escapeHtml(chatTitle)}</span>
        </div>
      </div>
      
      <div class="dialog-messages" id="dialog-messages">
        ${expertCardHtml}
        ${messagesHtml}
      </div>

      <div class="dialog-bottom-input">
        <div class="input-card" style="border-radius: 16px; padding: 12px 14px;">
          <textarea class="chat-textarea" id="dialog-chat-input" style="min-height: 48px; max-height: 120px;" placeholder="给${dialogExp ? escapeHtml(dialogExp.name) + '的AI分身' : 'AI分身'}发送消息..."></textarea>
          
          <div class="input-card-bottom">
            ${bottomInputLeftHtml}
            
            <button class="action-btn send-btn" title="发送" onclick="handleSendDialogChat()">
              <svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateDynamicConversation(title, isTwin, exp) {
  if (exp) {
    return {
      type: "twin",
      messages: [
        { role: "user", content: `您好${exp.name}老师，想向您请教关于“${exp.tag || 'AI前沿'}”在 SoulAgent 中的前沿应用与思考。` },
        {
          role: "assistant",
          htmlContent: `
            <p>你好！我是<strong>${escapeHtml(exp.name)}的AI分身</strong>。关于<strong>${escapeHtml(exp.tag || 'AI前沿')}</strong>与 SoulAgent 的结合，我的核心观点如下：</p>
            <ol>
              <li><strong>架构协同</strong>：通过专业领域知识图谱与多AI分身框架无缝对接，实现精准推理与任务执行。</li>
              <li><strong>持续对齐</strong>：基于高精度的专家策略库与实时环境反馈，保证策略输出的高鲁棒性。</li>
              <li><strong>工程落地</strong>：兼顾算力效率与泛化能力，打造端到端的AI分身工作流。</li>
            </ol>
            <p>欢迎随时提出具体问题或探讨相关研究方向！</p>
          `
        }
      ]
    };
  } else if (isTwin) {
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
