/**
 * 智能体档案视图主入口 (views/view-profile.js)
 * 职责：初始化全局档案数据、渲染顶部 Header、Tab 栏导航及分发子模块 (文件库, Agent设定, 记忆)
 */

// 默认测试数据 (若全局未定义则初始化)
if (!window.agentProfileData) {
  window.agentProfileData = {
    files: [
      { id: 'f1', name: 'SoulAgent架构设计与协议规范.pdf', size: '2.4 MB', time: '2026-08-15 14:20', status: '解析完成', type: 'pdf', tokens: '14,200' },
      { id: 'f2', name: '智源多模态大模型调优指南_v3.docx', size: '1.8 MB', time: '2026-08-14 09:45', status: '解析完成', type: 'doc', tokens: '9,800' },
      { id: 'f3', name: 'Agent长短期记忆机制研究.md', size: '512 KB', time: '2026-08-12 16:30', status: '解析完成', type: 'md', tokens: '4,150' },
      { id: 'f4', name: '2026AI智能体应用场景规划.xlsx', size: '850 KB', time: '2026-08-10 11:15', status: '解析完成', type: 'xls', tokens: '6,300' },
      { id: 'f5', name: '实时音频流处理与听会算法.pdf', size: '3.1 MB', time: '2026-08-08 18:00', status: '解析完成', type: 'pdf', tokens: '18,500' }
    ],
    settings: {
      systemPrompt: `你是一个专业、严谨且富有洞察力的 AI 智能助手 (MyAgent)。
你的核心目标是帮助用户高效处理复杂的技术架构设计、多模态任务调度、会议纪要整理以及专家AI分身协同。
在回答时，请保持逻辑清晰、结构化分明，并适时提供建设性的工程实现落地建议。`,
      model: 'Soul-LLM-v4-Ultra',
      temperature: 0.7,
      maxTokens: 4096,
      capabilities: {
        codeInterpreter: true,
        webSearch: true,
        imageGen: true,
        deepReasoning: true,
        memoryPersistence: true
      }
    },
    memories: [
      { id: 'm1', category: '用户偏好', content: '用户偏好简洁、结构化的 Markdown 响应，喜欢包含代码示例与架构图表。', time: '2026-08-16 10:12', importance: '高' },
      { id: 'm2', category: '项目事实', content: 'SoulAgent 当前版本为 v1.4，核心模块包含侧边栏调度、专家AI分身广场、帮我听会以及定时任务。', time: '2026-08-15 17:40', importance: '高' },
      { id: 'm3', category: '对话总结', content: '讨论了关于具身智能 VLA 模型的具身控制接口映射方案，认同分层解耦的设计思路。', time: '2026-08-14 21:05', importance: '中' },
      { id: 'm4', category: '人设记忆', content: '用户称呼智能体为“MyAgent”或“智源AI助手”，希望回答风格兼顾学术严谨性与产品工程化。', time: '2026-08-11 15:30', importance: '中' },
      { id: 'm5', category: '工具偏好', content: '在分析会议音频或定时任务时，优先使用异步任务队列与日志实时可视化展示。', time: '2026-08-09 13:20', importance: '低' }
    ]
  };
}

function renderProfileView() {
  const currentTab = state.profileTab || 'files';
  const agentName = state.currentAgent || 'MyAgent';

  return `
    <div class="profile-view">
      <!-- 顶部标题区 -->
      <div class="profile-header">
        <div class="profile-title-group">
          <div class="profile-avatar-badge">
            <svg class="icon" viewBox="0 0 24 24" style="width:24px;height:24px;stroke:#4f46e5;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <div>
            <div class="profile-title-row">
              <h1 class="profile-title">${escapeHtml(agentName)} 档案中心</h1>
            </div>
            <p class="profile-subtitle">管理当前智能体的专属知识库文件、长短期记忆知识图谱、人设 Prompt 设定</p>
          </div>
        </div>

        <!-- 划线 Tab 栏 (Line Tabs / Underline Tabs) -->
        <div class="profile-line-tabs">
          <div class="profile-tab-item ${currentTab === 'files' ? 'active' : ''}" onclick="switchProfileTab('files')">
            <svg class="icon" viewBox="0 0 24 24" style="width:16px;height:16px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>文件库</span>
            <span class="tab-badge">${window.agentProfileData.files.length}</span>
          </div>
          <div class="profile-tab-item ${currentTab === 'memory' ? 'active' : ''}" onclick="switchProfileTab('memory')">
            <svg class="icon" viewBox="0 0 24 24" style="width:16px;height:16px;"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
            <span>记忆</span>
            <span class="tab-badge">${window.agentProfileData.memories.length}</span>
          </div>
          <div class="profile-tab-item ${currentTab === 'settings' ? 'active' : ''}" onclick="switchProfileTab('settings')">
            <svg class="icon" viewBox="0 0 24 24" style="width:16px;height:16px;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Agent设定</span>
          </div>
        </div>
      </div>

      <!-- Tab 主体内容区 -->
      <div class="profile-body">
        ${renderProfileTabContent(currentTab)}
      </div>
    </div>
  `;
}

// 依据当前 Tab 渲染对应面板
function renderProfileTabContent(tab) {
  if (tab === 'files') {
    return renderFilesPanel();
  } else if (tab === 'memory') {
    return renderMemoryPanel();
  } else if (tab === 'settings') {
    return renderSettingsPanel();
  }
  return renderFilesPanel();
}

function switchProfileTab(tabName) {
  state.profileTab = tabName;
  renderApp();
}
