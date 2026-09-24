/**
 * 智能体档案 - Agent 设定模块 (views/view-profile-settings.js)
 * 职责：渲染系统提示词/人设、底层模型与参数、拓展能力开关及保存与重置逻辑
 */

function renderSettingsPanel() {
  const s = window.agentProfileData.settings;

  return `
    <div class="settings-panel">
      <form onsubmit="saveProfileSettings(event)">
        <!-- 1. 系统提示词 / 人设 -->
        <div class="settings-card">
          <div class="settings-card-header">
            <div>
              <h3 class="settings-card-title">系统提示词 (System Prompt)</h3>
              <p class="settings-card-desc">定义AI分身的角色定位、语气风格、核心能力边界及默认行为逻辑</p>
            </div>
            <button type="button" class="btn-text-secondary" onclick="resetSystemPrompt()">重置默认</button>
          </div>
          <div class="prompt-textarea-wrapper">
            <textarea id="setting-system-prompt" class="settings-textarea" rows="6" placeholder="请输入AI分身的人设与指令...">${escapeHtml(s.systemPrompt)}</textarea>
            <div class="textarea-footer-info">
              <span>Markdown 格式支持</span>
              <span id="prompt-char-count">${s.systemPrompt.length} 字符</span>
            </div>
          </div>
        </div>

        <!-- 2. 模型与参数配置 -->
        <div class="settings-card">
          <h3 class="settings-card-title">基础模型与推理参数</h3>
          <p class="settings-card-desc">调整底层大模型及采样随机度以优化回答准确性与创造力</p>

          <div class="settings-grid">
            <div class="setting-item">
              <label class="setting-label">核心模型 (Model)</label>
              <select id="setting-model" class="settings-select">
                <option value="Soul-LLM-v4-Ultra" ${s.model === 'Soul-LLM-v4-Ultra' ? 'selected' : ''}>Soul-LLM v4 Ultra (推荐 · 高智商旗舰)</option>
                <option value="Soul-LLM-v3-Turbo" ${s.model === 'Soul-LLM-v3-Turbo' ? 'selected' : ''}>Soul-LLM v3 Turbo (极速高并发)</option>
                <option value="Claude-3-5-Sonnet" ${s.model === 'Claude-3-5-Sonnet' ? 'selected' : ''}>Claude 3.5 Sonnet (代码与分析强)</option>
                <option value="GPT-4o-Mini" ${s.model === 'GPT-4o-Mini' ? 'selected' : ''}>GPT-4o (多模态图文对话)</option>
              </select>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <span>随机度 (Temperature): <strong id="temp-val-label">${s.temperature}</strong></span>
                <span class="label-tag">精准平衡</span>
              </label>
              <input type="range" id="setting-temperature" min="0" max="1" step="0.05" value="${s.temperature}" class="settings-range" oninput="document.getElementById('temp-val-label').innerText = this.value">
              <div class="range-labels">
                <span>0.0 (严谨精确)</span>
                <span>0.5 (标准)</span>
                <span>1.0 (极具创意)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 高级能力开关 -->
        <div class="settings-card">
          <h3 class="settings-card-title">增强功能拓展</h3>
          <p class="settings-card-desc">启用AI分身可调用的插件与工具链</p>

          <div class="capability-switches-grid">
            <div class="switch-item">
              <div class="switch-info">
                <div class="switch-name">代码解释器 (Code Interpreter)</div>
                <div class="switch-desc">允许 Agent 实时编写并执行 Python/JS 代码处理数据</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="cap-code" ${s.capabilities.codeInterpreter ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>

            <div class="switch-item">
              <div class="switch-info">
                <div class="switch-name">实时联网搜索 (Web Search)</div>
                <div class="switch-desc">允许 Agent 获取最新的网页信息与行业动态</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="cap-search" ${s.capabilities.webSearch ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>

            <div class="switch-item">
              <div class="switch-info">
                <div class="switch-name">深度推理思考 (Deep Thinking)</div>
                <div class="switch-desc">在生成复杂回答前展现思维链推理过程</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="cap-deep" ${s.capabilities.deepReasoning ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>

            <div class="switch-item">
              <div class="switch-info">
                <div class="switch-name">长短期记忆持久化 (Memory Sync)</div>
                <div class="switch-desc">自动将对话关键信息提炼为记忆实体存储</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="cap-memory" ${s.capabilities.memoryPersistence ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- 底部保存浮条 -->
        <div class="settings-footer-actions">
          <button type="submit" class="btn btn-primary" style="padding:10px 24px;font-size:14px;">保存 Agent 设定</button>
        </div>
      </form>
    </div>
  `;
}

function saveProfileSettings(e) {
  if (e) e.preventDefault();

  const prompt = document.getElementById('setting-system-prompt').value;
  const model = document.getElementById('setting-model').value;
  const temp = parseFloat(document.getElementById('setting-temperature').value);

  window.agentProfileData.settings.systemPrompt = prompt;
  window.agentProfileData.settings.model = model;
  window.agentProfileData.settings.temperature = temp;
  window.agentProfileData.settings.capabilities.codeInterpreter = document.getElementById('cap-code').checked;
  window.agentProfileData.settings.capabilities.webSearch = document.getElementById('cap-search').checked;
  window.agentProfileData.settings.capabilities.deepReasoning = document.getElementById('cap-deep').checked;
  window.agentProfileData.settings.capabilities.memoryPersistence = document.getElementById('cap-memory').checked;

  showToast('Agent 设定与提示词已保存生效！');
}

function resetSystemPrompt() {
  const defaultPrompt = `你是一个专业、严谨且富有洞察力的 AI 智能助手 (MyAgent)。
你的核心目标是帮助用户高效处理复杂的技术架构设计、多模态任务调度、会议纪要整理以及专家AI分身协同。
在回答时，请保持逻辑清晰、结构化分明，并适时提供建设性的工程实现落地建议。`;
  document.getElementById('setting-system-prompt').value = defaultPrompt;
  document.getElementById('prompt-char-count').innerText = `${defaultPrompt.length} 字符`;
  showToast('系统提示词已重置为默认值');
}
