/**
 * 提炼分身视图 (views/view-distill.js)
 * 职责：渲染专属 AI 分身在创建后的模型提炼与打造页面 (Step1~Step4 模拟进度)
 */

function renderDistillView() {
  const currentAgent = state.currentAgent || '专属AI分身';
  const agentItem = agentMenuItems.find(a => a.name === currentAgent) || {
    name: currentAgent,
    avatar: currentAgent.charAt(0).toUpperCase(),
    gradient: "linear-gradient(135deg, #64748b, #475569)"
  };

  return `
    <div class="distill-view">
      <!-- 页头 Header -->
      <div class="distill-header">
        <div class="distill-title-group">
          <div class="distill-avatar-badge" style="background: ${agentItem.gradient};">
            ${escapeHtml(agentItem.avatar)}
          </div>
          <div>
            <div class="distill-title">正在创建专属分身：${escapeHtml(currentAgent)}</div>
            <div class="distill-subtitle">SoulAgent 专属引擎 · 打造您的AI分身</div>
          </div>
        </div>
        <div class="distill-status-pill">
          <span class="distill-dot-pulse"></span>
          <span>模型创建中 (68%)</span>
        </div>
      </div>

      <!-- 4-Step 进度指示条 -->
      <div class="distill-stepper-card">
        <div class="stepper-step completed">
          <div class="step-icon-circle">
            <svg class="icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="step-info">
            <div class="step-num">Step 1</div>
            <div class="step-name">上传资料</div>
          </div>
        </div>
        <div class="step-connector completed"></div>

        <div class="stepper-step completed">
          <div class="step-icon-circle">
            <svg class="icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="step-info">
            <div class="step-num">Step 2</div>
            <div class="step-name">资料确认</div>
          </div>
        </div>
        <div class="step-connector active"></div>

        <div class="stepper-step active">
          <div class="step-icon-circle pulsing">
            <svg class="icon" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div class="step-info">
            <div class="step-num">Step 3</div>
            <div class="step-name">提炼模型</div>
          </div>
        </div>
        <div class="step-connector"></div>

        <div class="stepper-step">
          <div class="step-icon-circle pending">
            <span>4</span>
          </div>
          <div class="step-info">
            <div class="step-num">Step 4</div>
            <div class="step-name">验证评估</div>
          </div>
        </div>
      </div>

      <!-- 提炼主面板 (数据源 + 运行日志) -->
      <div class="distill-main-grid">
        <!-- 左侧：提炼数据源卡片 -->
        <div class="distill-card">
          <div class="distill-card-header">
            <div class="distill-card-title">
              <svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>分身训练数据源</span>
            </div>
            <span class="badge-tag">3 个文件</span>
          </div>
          <div class="distill-file-list">
            <div class="distill-file-item">
              <div class="file-icon-box pdf">PDF</div>
              <div class="file-meta">
                <div class="file-title">专属知识库及个人总结_2026.pdf</div>
                <div class="file-sub">12.4 MB · 已解析 142 个知识节点</div>
              </div>
              <div class="file-check">✓</div>
            </div>
            <div class="distill-file-item">
              <div class="file-icon-box json">JSON</div>
              <div class="file-meta">
                <div class="file-title">经典对话样例数据集.json</div>
                <div class="file-sub">3.8 MB · 已加载 1,200 条 Prompt 样本</div>
              </div>
              <div class="file-check">✓</div>
            </div>
            <div class="distill-file-item">
              <div class="file-icon-box prompt">PROMPT</div>
              <div class="file-meta">
                <div class="file-title">性格倾向与语气表达配置文件</div>
                <div class="file-sub">系统内建模板 · 已注入系统 Prompt</div>
              </div>
              <div class="file-check">✓</div>
            </div>
          </div>
        </div>

        <!-- 右侧：实时提炼终端日志 -->
        <div class="distill-card terminal-card">
          <div class="distill-card-header">
            <div class="distill-card-title">
              <svg class="icon" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              <span>提炼引擎实时日志</span>
            </div>
            <div class="live-dot-tag"><span class="green-dot"></span> RUNNING</div>
          </div>
          <div class="terminal-console" id="terminal-console">
            <div class="log-line text-muted">[00:01] 启动 SoulAgent 混合分布式提炼集群...</div>
            <div class="log-line text-muted">[00:02] 加载预训练通用基座模型 (Soul-Large-v3)...</div>
            <div class="log-line text-success">[00:04] ✓ 数据源解析完成：抽取 1,342 个核心特征维度</div>
            <div class="log-line text-info">[00:06] 正在构建注意力掩码微调 (LoRA Matrix Adaption)...</div>
            <div class="log-line text-info">[00:09] 正在提炼人设偏好分布 (Distillation Loss: 0.0241)...</div>
            <div class="log-line highlight">[00:12] ⚡ 正在提炼 Core-Memory 特征节点 (进度: 68%)...</div>
          </div>
          <div class="terminal-progress-wrapper">
            <div class="terminal-progress-bar">
              <div class="terminal-progress-fill" style="width: 68%;"></div>
            </div>
            <div class="terminal-progress-text">已完成 68% · 预估剩余 12 秒</div>
          </div>
        </div>
      </div>

      <!-- 底部模拟调试操作（轻量可点击文字） -->
      <div class="distill-debug-footer">
        <span class="debug-text-btn" onclick="completeAgentDistill('${escapeJsString(currentAgent)}')">
          ⚡ 点击此处模拟完成提炼，直接开启专属 AI 对话 &rarr;
        </span>
      </div>
    </div>
  `;
}
