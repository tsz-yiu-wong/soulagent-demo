/**
 * SoulAgent v1 - 核心底座引擎 (core.js)
 * 职责：提供轻量级 EventBus 事件总线、响应式单一数据源 Store 与全局工具函数
 */

(function (global) {
  // =========================================================================
  // 1. 全局事件总线 (EventBus)
  // =========================================================================
  class EventBus {
    constructor() {
      this.listeners = {};
    }

    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
      return () => this.off(event, callback);
    }

    off(event, callback) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
      if (!this.listeners[event]) return;
      this.listeners[event].forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[EventBus] Error in event '${event}':`, err);
        }
      });
    }
  }

  const bus = new EventBus();

  // =========================================================================
  // 2. 预设初始数据 (Mock Presets)
  // =========================================================================
  const presetCloneTemplates = [
    {
      id: "clone-poetry",
      name: "我的写诗分身",
      avatar: "诗",
      gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
      tag: "文学创作",
      desc: "精通古典律诗、绝句及现代抒情诗创作，注重意境渲染、辞藻考究与声律调优。",
      status: "ready",
      progress: 100,
      createTime: "2026-08-18",
      files: [
        { id: 'cf1', name: '古典诗词格律与平水韵精编.pdf', size: '3.2 MB', time: '2026-08-18 10:20', status: '解析完成', type: 'pdf', tokens: '24,500' },
        { id: 'cf2', name: '历代经典抒情诗意境解析.docx', size: '1.5 MB', time: '2026-08-18 11:30', status: '解析完成', type: 'doc', tokens: '12,000' }
      ],
      settings: {
        systemPrompt: "你是一个精通中国古代诗词与现代诗歌创作的专业写诗分身。擅长七言律诗、五言绝句、宋词及现代抒情诗。",
        model: "Soul-LLM-v4-Ultra",
        temperature: 0.85,
        maxTokens: 4096,
        capabilities: { codeInterpreter: false, webSearch: true, deepReasoning: true, memoryPersistence: true }
      },
      memories: [
        { id: 'cm1', category: '创作偏好', content: '用户偏好意境开阔、对仗工整的七言律诗与婉约清丽的现代诗。', time: '2026-08-18 15:20', importance: '高' },
        { id: 'cm2', category: '声律规则', content: '默认采用平水韵进行绝句律诗平仄校准。', time: '2026-08-18 16:10', importance: '中' }
      ]
    },
    {
      id: "clone-embodied",
      name: "我的具身AI分身",
      avatar: "具",
      gradient: "linear-gradient(135deg, #0284c7, #38bdf8)",
      tag: "具身控制",
      desc: "专注于机械臂轨迹规划、VLA模型端到端控制与Sim-to-Real物理仿真迁移策略。",
      status: "ready",
      progress: 100,
      createTime: "2026-08-19",
      files: [
        { id: 'cf3', name: '具身机器人仿真与Sim-to-Real接口协议.pdf', size: '5.8 MB', time: '2026-08-19 09:15', status: '解析完成', type: 'pdf', tokens: '38,200' },
        { id: 'cf4', name: 'VLA动作控制序列微调数据集.json', size: '4.1 MB', time: '2026-08-19 14:00', status: '解析完成', type: 'md', tokens: '18,600' }
      ],
      settings: {
        systemPrompt: "你是具身智能控制AI分身，专注于机器人机械臂运动规划、端到端VLA控制与物理仿真。",
        model: "Soul-LLM-v4-Ultra",
        temperature: 0.3,
        maxTokens: 4096,
        capabilities: { codeInterpreter: true, webSearch: true, deepReasoning: true, memoryPersistence: true }
      },
      memories: [
        { id: 'cm3', category: '算法框架', content: '优先采用Diffusion Policy结合跨模态残差微调架构。', time: '2026-08-19 17:30', importance: '高' }
      ]
    },
    {
      id: "clone-code-audit",
      name: "代码审计分身",
      avatar: "码",
      gradient: "linear-gradient(135deg, #8b5cf6, #6366f1)",
      tag: "工程提效",
      desc: "自动化检测分布式系统漏洞、性能瓶颈与代码异味，输出高质量重构建议。",
      status: "ready",
      progress: 100,
      createTime: "2026-08-20",
      files: [
        { id: 'cf5', name: '企业级安全编码合规规范_2026.pdf', size: '2.1 MB', time: '2026-08-20 11:00', status: '解析完成', type: 'pdf', tokens: '15,300' }
      ],
      settings: {
        systemPrompt: "你是资深架构师与代码安全审计AI分身，帮助排查死锁、内存泄露与安全合规漏洞。",
        model: "Claude-3-5-Sonnet",
        temperature: 0.2,
        maxTokens: 4096,
        capabilities: { codeInterpreter: true, webSearch: false, deepReasoning: true, memoryPersistence: true }
      },
      memories: [
        { id: 'cm4', category: '编码规范', content: '遵循 Google Clean Code 规范，严格检查高并发异步场景。', time: '2026-08-20 14:45', importance: '高' }
      ]
    },
    {
      id: "clone-brand",
      name: "我的品牌分身",
      avatar: "品",
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      tag: "品牌传播",
      desc: "精通品牌调性塑造、公关传播与高质感创意文案策划。",
      status: "ready",
      progress: 100,
      createTime: "2026-08-21",
      files: [
        { id: 'cf6', name: '品牌调性传播指南与经典案例_2026.pdf', size: '4.2 MB', time: '2026-08-21 10:00', status: '解析完成', type: 'pdf', tokens: '31,000' },
        { id: 'cf7', name: '经典文案风格与营销语料库.json', size: '2.8 MB', time: '2026-08-21 14:30', status: '解析完成', type: 'json', tokens: '18,500' }
      ],
      settings: {
        systemPrompt: "你是专业品牌公关与创意文案AI分身。擅长品牌定位、全案文案撰写、发布会演讲稿以及社交媒体爆款策划。",
        model: "Soul-LLM-v4-Ultra",
        temperature: 0.75,
        maxTokens: 4096,
        capabilities: { codeInterpreter: false, webSearch: true, deepReasoning: true, memoryPersistence: true }
      },
      memories: [
        { id: 'cm5', category: '传播调性', content: '偏好高级、克制、富有科技感与人文洞察的文案表达。', time: '2026-08-21 16:00', importance: '高' }
      ]
    }
  ];

  const defaultExpertList = [
    {
      id: "zhang-academician",
      name: "张院士",
      agentName: "张院士的AI分身",
      role: "国家重点实验室专家 · 人工智能领域",
      tag: "人工智能",
      gradient: "linear-gradient(135deg, #4f46e5, #7c3aed)",
      desc: "长期从事人工智能理论与前沿技术研究，指导前瞻方向战略布局。",
      stat: "1.8k+ 次对话"
    },
    {
      id: "zhao-academician",
      name: "赵院士",
      agentName: "赵院士的AI分身",
      role: "先进技术研究院专家 · 计算机视觉",
      tag: "计算机视觉",
      gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
      desc: "在计算机视觉与图像理解领域具有深厚造诣，指导多项前瞻性创新突破。",
      stat: "980 次对话"
    },
    {
      id: "li-phd",
      name: "李博士",
      agentName: "李博士的AI分身",
      role: "科研创新中心骨干 · 大模型架构",
      tag: "大语言模型",
      gradient: "linear-gradient(135deg, #0284c7, #38bdf8)",
      desc: "深入研究大规模语言模型预训练、长上下文推理与算法架构优化。",
      stat: "2.4k+ 次对话"
    },
    {
      id: "liu-phd",
      name: "刘博士",
      agentName: "刘博士的AI分身",
      role: "算法实验室资深研究员 · 强化学习",
      tag: "强化学习",
      gradient: "linear-gradient(135deg, #7c3aed, #a855f7)",
      desc: "专注于强化学习算法优化、复杂策略决策与智能体持续学习。",
      stat: "1.5k+ 次对话"
    },
    {
      id: "zhou-phd",
      name: "周博士",
      agentName: "周博士的AI分身",
      role: "算力工程中心高级专家 · 系统架构",
      tag: "计算系统",
      gradient: "linear-gradient(135deg, #475569, #64748b)",
      desc: "主导大规模高性能计算系统调度、分布式训练与工程效能优化。",
      stat: "1.1k+ 次对话"
    },
    {
      id: "wang-teacher",
      name: "王老师",
      agentName: "王老师的AI分身",
      role: "前沿交叉实验室专家 · 具身智能领域",
      tag: "具身智能",
      gradient: "linear-gradient(135deg, #059669, #10b981)",
      desc: "专注于具身智能技术、机器人协同控制与仿真环境落地方案。",
      stat: "1.2k+ 次对话"
    },
    {
      id: "chen-teacher",
      name: "陈老师",
      agentName: "陈老师的AI分身",
      role: "开源生态负责人 · 多智能体领域",
      tag: "多智能体",
      gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
      desc: "负责多智能体协作机制设计、开放生态建设与前沿应用场景探索。",
      stat: "860 次对话"
    },
    {
      id: "sun-teacher",
      name: "孙老师",
      agentName: "孙老师的AI分身",
      role: "前沿科学研究中心专家 · 交叉科学",
      tag: "交叉学科",
      gradient: "linear-gradient(135deg, #0d9488, #14b8a6)",
      desc: "致力于前沿基础科学与人工智能交叉融合的研究与探索。",
      stat: "720 次对话"
    }
  ];

  const defaultAgentData = {
    "AI助手": [
      "智能系统与环境仿真探讨",
      "与张院士对话",
      "与李博士对话",
      "与陈老师对话",
      "欢迎使用 SoulAgent",
      "探索AI分身多样化功能",
      "快速开始提示指南"
    ]
  };

  const defaultMockConversations = {
    "智能系统与环境仿真探讨": {
      type: "agent",
      messages: [
        {
          role: "user",
          content: "我们想在 SoulAgent 中引入环境预测模型架构，你觉得如何实现复杂环境预测与状态表征？"
        },
        {
          role: "assistant",
          htmlContent: `
            <p>引入环境预测模型是非常前瞻的技术方向。预测模型能够帮助 Agent 在虚拟环境或物理世界中建立预测能力与因果表征。</p>
            <p>推荐从三层架构切入：视觉编码感知层、潜在空间预测模型以及行动策略选择器。</p>
          `
        },
        {
          role: "user",
          content: "@张院士 请问在智能仿真环境中，预测模型如何实现跨域泛化？"
        },
        {
          role: "assistant",
          htmlContent: `
            <p>帮你咨询了<strong>张院士</strong>（国家重点实验室专家 · 人工智能领域），他的回复如下：</p>
            <div class="expert-quote-block" style="background:#f8fafc;border-left:3px solid #6366f1;padding:10px 14px;border-radius:0 8px 8px 0;margin:8px 0;color:#334155;">
              <p style="margin:0 0 6px 0;font-weight:600;color:#4f46e5;">💡 张院士 的建议：</p>
              <ol style="margin:0;padding-left:18px;line-height:1.6;">
                <li><strong>域随机化（Domain Randomization）</strong>：在仿真环境中注入物理参数（摩擦力、质量、光照）的随机扰动，提升潜在表征的鲁棒性。</li>
                <li><strong>端到端模型微调</strong>：结合真实世界少量物理交互数据，对物理预测分支进行跨模态残差微调。</li>
                <li><strong>闭环因果验证</strong>：利用预测模型在仿真环境中预演万次策略，再安全迁移至实机测试。</li>
              </ol>
            </div>
            <p>我认为张院士提出的<strong>“域随机化扰动 + 端到端残差微调”</strong>非常切中要害。在我们目前的架构下，可以优先在仿真环境中对关键控制参数做小范围闭环验证。</p>
            <p>是否需要我帮你<strong>生成一份具体的仿真参数配置清单与实验排期</strong>？</p>
          `
        }
      ]
    },
    "与张院士对话": {
      type: "twin",
      expertId: "zhang-academician",
      messages: [
        {
          role: "user",
          content: "张院士，您怎么看待人工智能前沿技术未来的发展路线与落地挑战？"
        },
        {
          role: "assistant",
          htmlContent: `
            <p>这是一个非常关键且前沿的方向。人工智能技术是将基础算法模型与实体应用场景深度结合的必由路线。</p>
            <p>结合我们在人工智能领域的布局与思考，核心观点如下：</p>
            <ol>
              <li><strong>统一表征模型是核心支撑</strong>：将多模态感知、语义理解与决策控制缝合在统一架构下，实现跨模态端到端的泛化控制。</li>
              <li><strong>高质量仿真与数据闭环</strong>：建立高逼真度的仿真平台是构建数据驱动闭环的关键。</li>
              <li><strong>自主规划与协同能力</strong>：让系统不仅能响应指令，更能自主进行复杂长程任务拆解、环境感知与自我纠错。</li>
            </ol>
            <p>总结来说，人工智能是迈向复杂物理与数字世界的关键跨越。我们要用泛化能力重新定义智能交互。</p>
          `
        }
      ]
    },
    "与李博士对话": {
      type: "twin",
      expertId: "li-phd",
      messages: [
        {
          role: "user",
          content: "李博士，对于大规模模型的长上下文推理优化，有哪些切实可行的加速方案？"
        },
        {
          role: "assistant",
          htmlContent: `
            <p>长上下文推理是大模型落地的核心技术难点之一。从工程与算法协同角度，推荐关注以下几个核心方向：</p>
            <ol>
              <li><strong>KV Cache 显存与检索压缩</strong>：结合动态稀疏注意力机制，在极低显存代价下保持大窗口的检索精度。</li>
              <li><strong>位置编码与外推优化</strong>：采用平滑插值技术，让基座模型在长文本场景下具备平滑扩展能力。</li>
              <li><strong>推测采样与流水线加速</strong>：通过草稿小模型辅助验证，显著提升长序列下的端到端生成吞吐率。</li>
            </ol>
            <p>针对具体业务场景，我们可以进一步定制显存量化方案。</p>
          `
        }
      ]
    },
    "与陈老师对话": {
      type: "twin",
      expertId: "chen-teacher",
      messages: [
        {
          role: "user",
          content: "陈老师，多AI分身生态要实现规模化协作，最核心的设计原则是什么？"
        },
        {
          role: "assistant",
          htmlContent: `
            <p>很高兴探讨多智能体的生态设计！构建一个高可用、可扩展的AI分身协作网络，核心在于三点：</p>
            <ul>
              <li><strong>清晰的角色拓扑与职责解耦</strong>：每个 Agent 专注于垂直领域的输入输出，避免单体 Agent 过于臃肿。</li>
              <li><strong>统一的通信标准与协议路由</strong>：建立标准化的消息格式、上下文传递机制与熔断策略。</li>
              <li><strong>人机协同与回退机制</strong>：在关键决策点保留人工介入通道，确保复杂长链路任务的安全可控。</li>
            </ul>
            <p>SoulAgent 正在围绕这套标准构建开放的开发者生态，非常期待更多专家与开发者共同共建！</p>
          `
        }
      ]
    }
  };

  const defaultRecommendQuestions = [
    {
      id: "rec-1",
      tag: "技术洞察",
      icon: "⚡",
      iconBg: "#eff6ff",
      iconColor: "#3b82f6",
      title: "长上下文推理与KV Cache优化",
      prompt: "深入分析大模型在超长上下文场景下的KV Cache显存压缩、分块机制与稀疏注意力演进"
    },
    {
      id: "rec-2",
      tag: "技术洞察",
      icon: "🔮",
      iconBg: "#f5f3ff",
      iconColor: "#8b5cf6",
      title: "原生多模态端到端生成机制",
      prompt: "梳理原生多模态大模型在图文音频交错理解与统一自回归生成上的主流技术路线"
    },
    {
      id: "rec-3",
      tag: "技术洞察",
      icon: "🤖",
      iconBg: "#f0fdf4",
      iconColor: "#10b981",
      title: "具身智能VLA模型控制架构",
      prompt: "探讨具身智能Vision-Language-Action模型在机械臂物理仿真与Sim-to-Real迁移中的核心挑战"
    },
    {
      id: "rec-4",
      tag: "技术洞察",
      icon: "📱",
      iconBg: "#fff7ed",
      iconColor: "#ea580c",
      title: "端侧大模型量化剪枝方案",
      prompt: "对比AWQ、GPTQ与SmoothQuant等主流权重量化算法在边缘设备推理加速与精度保持上的表现"
    },
    {
      id: "rec-5",
      tag: "技术洞察",
      icon: "🧠",
      iconBg: "#fdf2f8",
      iconColor: "#ec4899",
      title: "多智能体协同与长程记忆机制",
      prompt: "分析复杂自主Agent在长程记忆索引、反思规划、工具调用以及多Agent拓扑通信上的架构设计"
    },
    {
      id: "rec-6",
      tag: "技术洞察",
      icon: "🎯",
      iconBg: "#ecfeff",
      iconColor: "#0891b2",
      title: "强化学习与测试时计算扩展",
      prompt: "分析基于强化学习与过程监督奖励模型（PRM）在提升大模型数学与代码复杂推理能力上的原理"
    }
  ];

  // =========================================================================
  // 3. 响应式单一状态仓 (Store)
  // =========================================================================
  const STORAGE_PREFIX = 'soulagent_v1_';
  const DATA_VERSION = 'v1_20260827_r1';

  function isPageReload() {
    try {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries && navEntries.length > 0) {
        return navEntries[0].type === 'reload';
      }
      if (window.performance && window.performance.navigation) {
        return window.performance.navigation.type === 1;
      }
    } catch (e) {}
    return false;
  }

  class DataStore {
    constructor() {
      if (isPageReload()) {
        this._clearStorage();
      }
      this.myClones = this._load('myClones', []);
      this.expertList = defaultExpertList;
      this.presetTemplates = presetCloneTemplates;
      this.agentData = this._load('agentData', defaultAgentData);
      this.mockConversations = this._load('mockConversations', defaultMockConversations);
      this.recommendQuestions = defaultRecommendQuestions;
    }

    _clearStorage() {
      try {
        ['localStorage', 'sessionStorage'].forEach(storeName => {
          const s = window[storeName];
          if (s) {
            Object.keys(s).forEach(k => {
              if (k.startsWith(STORAGE_PREFIX)) s.removeItem(k);
            });
          }
        });
      } catch (e) {}
    }

    _load(key, fallback) {
      try {
        const raw = sessionStorage.getItem(STORAGE_PREFIX + key) || localStorage.getItem(STORAGE_PREFIX + key);
        return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(fallback));
      } catch (e) {
        return JSON.parse(JSON.stringify(fallback));
      }
    }

    _save(key, val) {
      try {
        const str = JSON.stringify(val);
        sessionStorage.setItem(STORAGE_PREFIX + key, str);
        localStorage.setItem(STORAGE_PREFIX + key, str);
      } catch (e) {}
    }

    save() {
      this._save('myClones', this.myClones);
      this._save('agentData', this.agentData);
      this._save('mockConversations', this.mockConversations);
    }

    // 分身操作
    addClone(cloneData) {
      this.myClones.unshift(cloneData);
      this.save();
      bus.emit('clone:updated', { type: 'add', clone: cloneData });
      bus.emit('sidebar:refresh');
    }

    updateClone(id, updates) {
      const idx = this.myClones.findIndex(c => c.id === id);
      if (idx !== -1) {
        this.myClones[idx] = { ...this.myClones[idx], ...updates };
        this.save();
        bus.emit('clone:updated', { type: 'update', clone: this.myClones[idx] });
        bus.emit('sidebar:refresh');
      }
    }

    completeAgentDistill(agentName, cloneId, extraMeta = {}) {
      let clone = null;
      if (cloneId) {
        clone = this.myClones.find(c => c.id === cloneId);
      }
      if (!clone && agentName) {
        clone = this.myClones.find(c => c.name === agentName);
      }

      if (!clone) {
        const presets = this.presetTemplates || [];
        let template = presets.find(t => (cloneId && t.id === cloneId) || (agentName && t.name === agentName));
        if (!template) {
          template = presets.find(p => !this.myClones.some(c => c.id === p.id || c.name === p.name)) || presets[0];
        }
        if (template) {
          clone = JSON.parse(JSON.stringify(template));
          if (agentName) clone.name = agentName;
          clone.status = 'ready';
          clone.progress = 100;
          this.myClones.unshift(clone);
        } else {
          clone = {
            id: cloneId || ('clone-' + Date.now()),
            name: agentName || '专属AI分身',
            avatar: (agentName || '分').charAt(0),
            gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
            tag: extraMeta.tag || '专属分身',
            desc: extraMeta.desc || '专注于业务场景的高精度定制分身',
            status: 'ready',
            progress: 100,
            createTime: new Date().toISOString().split('T')[0],
            files: [
              { id: 'cf_' + Date.now(), name: `${agentName || '分身'}_专业知识库.pdf`, size: '3.4 MB', time: '刚刚', status: '解析完成', type: 'pdf', tokens: '22,400' }
            ],
            settings: {
              systemPrompt: `你是 ${agentName || '专属分身'}，专注于特定业务场景，具备高专业度与严谨逻辑。`,
              model: 'Soul-LLM-v4-Ultra',
              temperature: 0.7,
              maxTokens: 4096,
              capabilities: { codeInterpreter: true, webSearch: true, deepReasoning: true, memoryPersistence: true }
            },
            memories: [
              { id: 'cm_' + Date.now(), category: '核心人设', content: `分身设定为【${agentName || '专属分身'}】，提供专业解答。`, time: '刚刚', importance: '高' }
            ]
          };
          this.myClones.unshift(clone);
        }
      } else {
        clone.status = 'ready';
        clone.progress = 100;
        if (extraMeta.desc) clone.desc = extraMeta.desc;
        if (extraMeta.tag) clone.tag = extraMeta.tag;
      }

      this.save();
      bus.emit('clone:updated', { type: 'complete', clone });
      bus.emit('sidebar:refresh');
      return clone;
    }

    getClone(id) {
      return this.myClones.find(c => c.id === id) || null;
    }

    // 对话会话操作
    getAgentChats(agentName = "AI助手") {
      if (this.agentData[agentName]) return this.agentData[agentName];
      return this.agentData["AI助手"] || [];
    }

    createConversation(title, dataOrMsg, authorName, type, targetId) {
      const chats = this.getAgentChats("AI助手");
      if (!chats.includes(title)) {
        chats.unshift(title);
        this.agentData["AI助手"] = chats;
      }

      if (dataOrMsg && typeof dataOrMsg === 'object' && dataOrMsg.messages) {
        this.mockConversations[title] = dataOrMsg;
      } else {
        const msgText = typeof dataOrMsg === 'string' ? dataOrMsg : `关于“${title}”的对话探讨`;
        const convType = type || (title.includes('群聊') ? 'group' : (targetId ? (authorName && authorName.includes('分身') ? 'clone' : 'expert') : 'agent'));
        
        this.mockConversations[title] = {
          type: convType,
          expertId: convType === 'expert' ? targetId : undefined,
          cloneId: convType === 'clone' ? targetId : undefined,
          messages: [
            { role: 'user', content: msgText },
            {
              role: 'assistant',
              expertId: convType === 'expert' ? targetId : undefined,
              cloneId: convType === 'clone' ? targetId : undefined,
              htmlContent: `<p>你好，我是SoulAgent。针对关于“<strong>${escapeHtml(msgText)}</strong>”的提问与需求，已为您准备好专业解答与推演建议。</p>`
            }
          ]
        };
      }

      this.save();
      bus.emit('chat:created', { title, data: this.mockConversations[title] });
      bus.emit('sidebar:refresh');
    }

    appendMessage(title, message) {
      if (!this.mockConversations[title]) {
        this.mockConversations[title] = { type: 'agent', messages: [] };
      } else if (!Array.isArray(this.mockConversations[title].messages)) {
        this.mockConversations[title].messages = [];
      }
      this.mockConversations[title].messages.push(message);
      this.save();
      bus.emit('message:appended', { title, message });
    }

    getConversation(title) {
      let conv = this.mockConversations[title];
      if (!conv || !Array.isArray(conv.messages)) {
        // 自动初始化合理结构
        let expertId, cloneId, type = 'agent';
        if (title.includes('群聊')) {
          type = 'group';
        } else {
          const exp = (this.expertList || []).find(e => title.includes(e.name));
          if (exp) {
            type = 'expert';
            expertId = exp.id;
          }
          const cln = (this.myClones || []).find(c => title.includes(c.name));
          if (cln) {
            type = 'clone';
            cloneId = cln.id;
          }
        }

        conv = {
          type,
          expertId,
          cloneId,
          messages: [
            { role: 'user', content: `关于“${title}”，我们来探讨一下具体方案。` },
            {
              role: 'assistant',
              expertId,
              cloneId,
              htmlContent: `<p>你好，我是SoulAgent。针对主题 <strong>“${escapeHtml(title)}”</strong>，我已经结合专属上下文为你准备好了相关资料。</p>`
            }
          ]
        };
        this.mockConversations[title] = conv;
        this.save();
      }
      return conv;
    }

    getRandomRecommend(count = 3) {
      const list = [...this.recommendQuestions].sort(() => 0.5 - Math.random());
      return list.slice(0, count);
    }

    resetDefaults() {
      this.myClones = [];
      this.agentData = JSON.parse(JSON.stringify(defaultAgentData));
      this.mockConversations = JSON.parse(JSON.stringify(defaultMockConversations));
      this.save();
      bus.emit('sidebar:refresh');
    }
  }

  const store = new DataStore();

  function getExpertOpinion(exp, query) {
    if (!exp) return `针对“${query || '当前课题'}”，我赞同大家的方向，建议继续深挖工程与实践细节。`;
    
    const opinions = {
      "zhang-academician": `从国家级战略与顶层架构来看，针对“${query || '当前议题'}”，核心是要保障统一表征底座的跨域泛化能力，打通基础算法与垂类任务的因果逻辑链。`,
      "zhao-academician": `从计算机视觉与空间多维感知角度，“${query || '当前议题'}”需要重视高保真几何先验与跨模态特征对齐，提升在复杂真实场景下的视觉理解精度。`,
      "li-phd": `从大模型底层架构与推理加速来看，处理“${query || '当前议题'}”时重点是长上下文注意力稀疏化与 KV Cache 显存优化，保障高吞吐与极低延迟。`,
      "liu-phd": `从强化学习与策略博弈角度，建议在“${query || '当前议题'}”中引入多步环境反馈与自适应奖励函数塑形（Reward Shaping），促使智能体持续自我对齐。`,
      "zhou-phd": `从大规模分布式算力与系统工程层面，“${query || '当前议题'}”需要精细化调度 GPU 集群通信流水线与显存拓扑，消除大规模并发下的工程瓶颈。`,
      "wang-teacher": `在具身智能控制与物理仿真落地方面，针对“${query || '当前议题'}”，关键是控制 Sim-to-Real 的迁移误差，推荐结合域随机化与端到端残差微调策略。`,
      "chen-teacher": `从多智能体协作生态与标准化协议来看，“${query || '当前议题'}”最重要的是明确各专家垂直分身的通信路由与任务容错回退机制，形成协同闭环。`,
      "sun-teacher": `从交叉科学融合与前沿推演视角，“${query || '当前议题'}”可以通过跨学科第一性原理，结合高精度科学计算与数据驱动加速关键突破。`
    };

    if (opinions[exp.id]) {
      return opinions[exp.id];
    }

    return `结合我在【${exp.role || exp.tag || '专业领域'}】的研究，“${query || '当前议题'}”最关键的是将理论推演与实际业务场景深度契合，建议重点推进落地验证。`;
  }

  function getCloneOpinion(clone, query) {
    return `
      <p>针对“<strong>${escapeHtml(query)}</strong>”，已结合我的专属知识库与设定完成深度分析，建议如下：</p>
      <ol style="margin:8px 0;padding-left:18px;line-height:1.6;">
        <li><strong>核心逻辑拆解</strong>：精准提取相关业务规则与关键要素；</li>
        <li><strong>方案结构化推演</strong>：严格依据专属人设与沉淀知识输出执行路径；</li>
        <li><strong>落地与执行建议</strong>：提供清晰的实施步骤，支持随时提出更具体的要求进一步细化。</li>
      </ol>
    `;
  }

  /**
   * Agent 协同模式下咨询分身或专家（类似“智能系统与环境仿真探讨”）
   */
  function generateConsultingReply(target, userQuery, isClone) {
    const cleanQuery = userQuery.replace(new RegExp(`@${target.name}\\s*`, 'g'), '').trim() || userQuery;
    const targetName = target.name;
    const targetRole = target.role || target.tag || (isClone ? '我的分身' : '领域专家');

    let quoteContentHtml = '';
    let agentAnalysisHtml = '';
    let followUpHtml = '';

    if (isClone) {
      if (target.id === 'clone-poetry' || targetName.includes('诗')) {
        const topic = cleanQuery.includes('秋月') ? '秋月' : (cleanQuery.length > 0 && cleanQuery.length <= 8 ? cleanQuery : '抒怀');
        quoteContentHtml = `
          <p style="margin:0 0 6px 0;font-weight:600;color:#e11d48;">💡 ${escapeHtml(targetName)} 的创作与格律解析：</p>
          <div class="poem-block" style="background:#ffffff;border-left:3px solid #ec4899;padding:10px 14px;border-radius:0 8px 8px 0;margin:8px 0;line-height:1.8;color:#1e293b;font-size:14.5px;">
            <strong>《咏${escapeHtml(topic)}》</strong><br>
            碧落霜清夜气森，广寒光满浸枫林。<br>
            孤轮高挂乾坤静，万象遥相岁月深。<br>
            关山客路思乡泪，竹影桐阴抚琴心。<br>
            莫道凭栏无限意，露华沉浸到衣襟。
          </div>
          <p style="margin:6px 0 0 0;font-size:13px;color:#64748b;">
            <strong>声律说明</strong>：遵循平水韵，首联起兴描景，颔联时空哲思，颈联情景交融，尾联含蓄收束。
          </p>
        `;
        agentAnalysisHtml = `你的专属分身已依据知识库中的古典格律规则完成创作。整首诗在意境构建与对仗上非常工整。`;
        followUpHtml = `是否需要我针对其中的<strong>特定词句、押韵或现代诗体裁</strong>做进一步调优？`;
      } else if (target.id === 'clone-embodied' || targetName.includes('具身') || targetName.includes('控制')) {
        quoteContentHtml = `
          <p style="margin:0 0 6px 0;font-weight:600;color:#0284c7;">💡 ${escapeHtml(targetName)} 的推演与架构建议：</p>
          <ol style="margin:0;padding-left:18px;line-height:1.6;">
            <li><strong>端到端 VLA 分级控制</strong>：采用高频位姿跟踪与低频语义动作规划的双层架构，保障机械臂操作实时性；</li>
            <li><strong>Sim-to-Real 跨域迁移</strong>：在仿真环境中引入物理参数域随机化扰动，缩减虚实迁移鸿沟；</li>
            <li><strong>闭环阻抗控制与安全约束</strong>：结合动力学模型预估接触力，确保作业过程柔顺与防碰撞。</li>
          </ol>
        `;
        agentAnalysisHtml = `分身提出的<strong>“分级架构 + 域随机化扰动”</strong>方案与系统物理仿真接口协议完全契合。`;
        followUpHtml = `是否需要我为你<strong>生成具体的仿真参数配置文件与控制代码示例</strong>？`;
      } else if (target.id === 'clone-code-audit' || targetName.includes('代码') || targetName.includes('审计')) {
        quoteContentHtml = `
          <p style="margin:0 0 6px 0;font-weight:600;color:#7c3aed;">💡 ${escapeHtml(targetName)} 的审计与重构建议：</p>
          <ol style="margin:0;padding-left:18px;line-height:1.6;">
            <li><strong>高并发瓶颈与死锁排查</strong>：重点检查异步流水线中的通道锁竞争与无界队列积压风险；</li>
            <li><strong>资源生命周期闭环</strong>：严格审计连接池与句柄释放逻辑，消除潜在的内存泄漏点；</li>
            <li><strong>解耦与模式重构</strong>：推荐引入事件总线机制降低模块间强耦合度，提升系统健壮性。</li>
          </ol>
        `;
        agentAnalysisHtml = `分身已结合企业级安全编码合规规范给出了模块化重构路径。`;
        followUpHtml = `是否需要我为你<strong>输出重构后的关键类设计与单元测试用例</strong>？`;
      } else {
        quoteContentHtml = `
          <p style="margin:0 0 6px 0;font-weight:600;color:#4f46e5;">💡 ${escapeHtml(targetName)} 的专业见解：</p>
          <p style="margin:0 0 6px 0;line-height:1.6;">针对“${escapeHtml(cleanQuery)}”，基于专属语料与特征记忆推演：</p>
          <ol style="margin:0;padding-left:18px;line-height:1.6;">
            <li><strong>领域知识映射</strong>：精准提取专属业务规则与核心逻辑链路；</li>
            <li><strong>结构化推演</strong>：严格依据分身人设与知识库拆解落地路径；</li>
            <li><strong>交付与协同</strong>：提供可验证的执行方案与关键风险防范建议。</li>
          </ol>
        `;
        agentAnalysisHtml = `分身已针对你的需求完成了针对性解析。`;
        followUpHtml = `是否需要我为你<strong>制定具体的执行清单与落地排期</strong>？`;
      }
    } else {
      const opinionText = getExpertOpinion(target, cleanQuery);
      quoteContentHtml = `
        <p style="margin:0 0 6px 0;font-weight:600;color:#4f46e5;">💡 ${escapeHtml(targetName)} 的建议：</p>
        <div style="line-height:1.6;color:#334155;">${escapeHtml(opinionText)}</div>
      `;
      agentAnalysisHtml = `我认为${escapeHtml(targetName)}提出的观点非常切中要害，契合当前技术方案的演进路线。`;
      followUpHtml = `是否需要我帮你<strong>生成一份具体的实施步骤与实验方案</strong>？`;
    }

    return `
      <p>帮你咨询了<strong>${escapeHtml(targetName)}</strong>（${escapeHtml(targetRole)}），回复如下：</p>
      <div class="expert-quote-block" style="background:#f8fafc;border-left:3px solid #6366f1;padding:10px 14px;border-radius:0 8px 8px 0;margin:8px 0;color:#334155;">
        ${quoteContentHtml}
      </div>
      <p>${agentAnalysisHtml}</p>
      <p>${followUpHtml}</p>
    `;
  }

  // =========================================================================
  // 4. 通用工具函数 (Helpers)
  // =========================================================================
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeJsString(str) {
    if (!str) return '';
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  function getPageUrl(targetPageName, params = {}) {
    const path = window.location.pathname.replace(/\\/g, '/');
    const isInPages = path.includes('/pages/') || path.endsWith('/pages');
    
    // 如果已经在 pages 目录下，则相对平级跳转，否则进入 pages/
    let base = isInPages ? targetPageName : `pages/${targetPageName}`;
    if (targetPageName === 'index.html') {
      base = isInPages ? '../index.html' : 'index.html';
    }

    const queryParts = [];
    for (const k in params) {
      if (params[k] !== undefined && params[k] !== null) {
        queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`);
      }
    }
    return queryParts.length > 0 ? `${base}?${queryParts.join('&')}` : base;
  }

  // 挂载到全局 window 对象
  global.Bus = bus;
  global.Store = store;
  global.getExpertOpinion = getExpertOpinion;
  global.getCloneOpinion = getCloneOpinion;
  global.generateConsultingReply = generateConsultingReply;
  global.escapeHtml = escapeHtml;
  global.escapeJsString = escapeJsString;
  global.getQueryParam = getQueryParam;
  global.getPageUrl = getPageUrl;

})(window);
