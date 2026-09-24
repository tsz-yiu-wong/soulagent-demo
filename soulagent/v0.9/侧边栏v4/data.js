/**
 * SoulAgent 原型 - 数据中心 (data.js)
 * 所有长文案、长对话、富文本 HTML、专家列表统一抽取在此文件
 */

// =============================================
// 1. 智能体下拉菜单定义
// =============================================
const agentMenuItems = [
  { name: "AI助手", avatar: "A", gradient: "linear-gradient(135deg, #4f46e5, #6366f1)" }
];

// =============================================
// 1.1 我的专属AI分身矩阵 (My Clones)
// =============================================
const myClones = [
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
      systemPrompt: `你是一个精通中国古代诗词与现代诗歌创作的专业写诗分身。
擅长七言律诗、五言绝句、宋词及现代抒情诗。
在创作时，注重情景交融、对仗工整、音律悠扬，并能根据用户提出的修改意见进行精妙的字句微调。`,
      model: "Soul-LLM-v4-Ultra",
      temperature: 0.85,
      maxTokens: 4096,
      capabilities: {
        codeInterpreter: false,
        webSearch: true,
        deepReasoning: true,
        memoryPersistence: true
      }
    },
    memories: [
      { id: 'cm1', category: '创作偏好', content: '用户偏好意境开阔、对仗工整的七言律诗与婉约清丽的现代诗。', time: '2026-08-18 15:20', importance: '高' },
      { id: 'cm2', category: '声律规则', content: '默认采用平水韵进行绝句律诗平仄校准。', time: '2026-08-18 16:10', importance: '中' }
    ]
  },
  {
    id: "clone-embodied",
    name: "具身AI分身",
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
      systemPrompt: `你是具身智能控制AI分身，专注于机器人机械臂运动规划、端到端VLA控制与物理仿真。
具备严谨的工程与数学推导能力，提供高鲁棒性的 Sim-to-Real 迁移方案与代码实现。`,
      model: "Soul-LLM-v4-Ultra",
      temperature: 0.3,
      maxTokens: 4096,
      capabilities: {
        codeInterpreter: true,
        webSearch: true,
        deepReasoning: true,
        memoryPersistence: true
      }
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
      systemPrompt: `你是资深架构师与代码安全审计AI分身。
帮助用户在复杂代码库中排查并发死锁、内存泄露、安全合规漏洞与架构异味，并提供工业级重构方案。`,
      model: "Claude-3-5-Sonnet",
      temperature: 0.2,
      maxTokens: 4096,
      capabilities: {
        codeInterpreter: true,
        webSearch: false,
        deepReasoning: true,
        memoryPersistence: true
      }
    },
    memories: [
      { id: 'cm4', category: '编码规范', content: '遵循 Google Clean Code 规范，严格检查高并发异步场景。', time: '2026-08-20 14:45', importance: '高' }
    ]
  }
];

// =============================================
// 2. 智能体与历史对话映射数据
// =============================================
const agentData = {
  "AI助手": [
    "世界模型与物理仿真探讨",
    "与王仲远对话",
    "与林咏文对话",
    "与屈鑫对话",
    "欢迎使用 SoulAgent",
    "探索AI分身多样化功能",
    "快速开始提示指南"
  ],
  "我的写诗分身": [
    "七言律诗·咏秋月",
    "现代抒情诗创作提纲",
    "宋词意境美化"
  ],
  "王仲远的AI分身": [
    "具身智能大模型路线研讨",
    "VLA模型端到端控制与仿真",
    "人形机器人实机部署与泛化"
  ],
  "具身AI分身": [
    "具身感知与语义地图构建",
    "机器人机械臂轨迹规划",
    "Sim-to-Real 虚拟迁移算法"
  ]
};

// =============================================
// 3. 预设长对话富文本数据
// =============================================
const mockConversations = {
  "世界模型与物理仿真探讨": {
    type: "agent",
    messages: [
      {
        role: "user",
        content: "我们想在 SoulAgent 中引入世界模型（World Model）架构，你觉得如何实现环境预测与状态表征？"
      },
      {
        role: "assistant",
        htmlContent: `
          <p>引入世界模型是非常前瞻的技术方向。世界模型能够帮助 Agent 在虚拟环境或物理世界中建立预测能力与因果表征。</p>
          <p>推荐从三层架构切入：视觉编码感知层、潜在空间预测模型以及行动策略选择器。</p>
        `
      },
      {
        role: "user",
        content: "@王仲远 请问在具身智能的物理仿真中，世界模型如何实现 Sim-to-Real 的跨域泛化？"
      },
      {
        role: "assistant",
        htmlContent: `
          <p>帮你咨询了<strong>王仲远</strong>（智源研究院院长 · 具身智能专家），他的回复如下：</p>
          <div class="expert-quote-block" style="background:#f8fafc;border-left:3px solid #6366f1;padding:10px 14px;border-radius:0 8px 8px 0;margin:8px 0;color:#334155;">
            <p style="margin:0 0 6px 0;font-weight:600;color:#4f46e5;">💡 王仲远 的建议：</p>
            <ol style="margin:0;padding-left:18px;line-height:1.6;">
              <li><strong>域随机化（Domain Randomization）</strong>：在仿真环境中注入物理参数（摩擦力、质量、光照）的随机扰动，提升潜在表征的鲁棒性。</li>
              <li><strong>端到端 VLA 模型微调</strong>：结合真实世界少量物理交互数据，对物理预测分支进行跨模态残差微调。</li>
              <li><strong>闭环因果验证</strong>：利用世界模型在仿真梦境中预演万次策略，再安全迁移至实机测试。</li>
            </ol>
          </div>
          <p>我认为王老师提出的<strong>“域随机化扰动 + 端到端残差微调”</strong>非常切中要害。在我们目前的架构下，可以优先在仿真环境中对关键控制参数做小范围闭环验证。</p>
          <p>是否需要我帮你<strong>生成一份具体的 Sim-to-Real 仿真参数配置清单与实验排期</strong>？</p>
        `
      }
    ]
  },
  // Agent 智能体对话（ChatGPT 风格，无头像）
  "七言律诗·咏秋月": {
    type: "agent",
    agentBadgeText: "我的写诗分身",
    messages: [
      {
        role: "user",
        content: "请以“秋月”为题，创作一首七言律诗，要求平水韵，意境深远，包含对月思乡与岁月沉淀的感悟。"
      },
      {
        role: "assistant",
        htmlContent: `
          <p>好的，为你创作一首七言律诗《咏秋月》：</p>
          <div class="poem-block">
            <strong>《咏秋月》</strong><br><br>
            碧落霜清夜气森，广寒光满浸枫林。<br>
            孤轮高挂乾坤静，万象遥相岁月深。<br>
            关山客路思乡泪，竹影桐阴抚琴心。<br>
            莫道凭栏无限意，露华沉浸到衣襟。
          </div>
          <p><strong>【诗意解析】</strong></p>
          <ul>
            <li><strong>首联</strong>：写秋夜清冷与月光普照，勾勒出广袤静谧的秋夜景色。</li>
            <li><strong>颔联</strong>：以明月高悬对比人世沉浮，展现岁月沉淀的哲思与从容。</li>
            <li><strong>颈联</strong>：转入抒情，借竹影琴声表达羁旅思乡之切。</li>
            <li><strong>尾联</strong>：露湿衣襟，将绵绵情思融入冷月秋露之中，余味悠长。</li>
          </ul>
        `
      },
      {
        role: "user",
        content: "太棒了！请帮我把颔联再微调得更有画面感一些。"
      },
      {
        role: "assistant",
        htmlContent: `
          <p>收到！我们可以将颔联修改为：</p>
          <div class="poem-block">
            <strong>“玉镜平铺千嶂雪，银河倾写一江金。”</strong>
          </div>
          <p>这样修改后画面感更加具象：上句如白雪覆盖千山山嶂，下句如金色月辉洒满江面，动静交融，视觉效果更加恢弘大方。</p>
        `
      }
    ]
  },

  // AI 分身对话（带左侧分身头像）
  "与王仲远对话": {
    type: "twin",
    expertId: "wangzhongyuan",
    messages: [
      {
        role: "user",
        content: "仲远总，结合智源在大模型方面的沉淀，您怎么看待具身智能（Embodied AI）未来的技术发展路线与落地挑战？"
      },
      {
        role: "assistant",
        htmlContent: `
          <p>这是一个非常关键且前沿的方向。具身智能（Embodied AI）是将大模型“大脑”与物理世界“躯体”深度结合的必由路线。</p>
          <p>结合我们在具身大模型方面的布局与思考，我的核心观点如下：</p>
          <ol>
            <li><strong>VLA 模型（Vision-Language-Action）是核心支撑</strong>：将视觉感知、语言理解与动作控制缝合在统一的大模型架构下，实现跨模态端到端的泛化控制。</li>
            <li><strong>高质量物理仿真与数据闭环</strong>：建立高逼真度的物理仿真平台（Sim-to-Real）是构建数据驱动闭环的关键。</li>
            <li><strong>Task-centric 的自主规划能力</strong>：让机器人不仅能听懂指令，更能自主进行复杂长程任务拆解、环境感知与自我纠错。</li>
          </ol>
          <p>总结来说，具身智能是 AI 迈向物理世界的关键跨越。我们要用大模型的泛化能力重新定义机器人物理交互。</p>
        `
      },
      {
        role: "user",
        content: "明白了！那从 SoulAgent 的技术规划来看，我们是如何把这种具身智能架构落地到AI分身工作流中的？"
      },
      {
        role: "assistant",
        htmlContent: `
          <p>问到点子上了！我们在 SoulAgent 的架构设计中，主要从三个维度与具身智能相融合：</p>
          <ul>
            <li><strong>多 Agent 协作控制链</strong>：通过高级 Task Agent 负责顶层规划，底层 Domain Agent 执行具体动作，形成分层递进的控制体系。</li>
            <li><strong>长效物理环境记忆库（World Model Memory）</strong>：让 AI 分身和实体机器人具备环境三维语义地图与历史操作记忆。</li>
            <li><strong>仿真与实机端到端反馈闭环</strong>：支持在虚拟仿真环境快速验证 Agent 策略，再安全迁移至实体设备部署。</li>
          </ul>
        `
      }
    ]
  },
  "与林咏文对话": {
    type: "twin",
    expertId: "linyongwen",
    messages: [
      {
        role: "user",
        content: "林老师，对于千亿参数大模型的长上下文推理优化，有哪些切实可行的加速方案？"
      },
      {
        role: "assistant",
        htmlContent: `
          <p>长上下文推理（Long Context Reasoning）是大模型落地的核心技术壁垒之一。从工程与算法协同角度，推荐关注以下几个核心方向：</p>
          <ol>
            <li><strong>KV Cache 显存与检索压缩</strong>：结合 PageAttention 与动态稀疏检索（Sparse Attention），在极低显存代价下保持 128k+ 窗口的检索精度。</li>
            <li><strong>外推算法与 RoPE 优化</strong>：采用 YaRN 或 NTK-aware RoPE 插值技术，让基座模型在长文本场景下具备平滑扩展能力。</li>
            <li><strong>分块 Prefill 与推测采样（Speculative Decoding）</strong>：通过小模型辅助草稿验证，提升长序列下的端到端生成吞吐率（可提升 2~3 倍）。</li>
          </ol>
          <p>针对具体业务场景，我们可以进一步定制显存量化方案。</p>
        `
      }
    ]
  },
  "与屈鑫对话": {
    type: "twin",
    expertId: "quxin",
    messages: [
      {
        role: "user",
        content: "屈鑫老师，Multi-Agent 多AI分身生态要实现规模化协作，最核心的设计原则是什么？"
      },
      {
        role: "assistant",
        htmlContent: `
          <p>很高兴探讨 Multi-Agent 的生态设计！构建一个高可用、可扩展的AI分身协作网络，核心在于三点：</p>
          <ul>
            <li><strong>清晰的角色拓扑与职责解耦</strong>：每个 Agent 专注于垂直领域的输入输出，避免单体 Agent 过于臃肿。</li>
            <li><strong>统一的通信标准与协议路由</strong>：建立标准化的消息格式、上下文传递机制与心跳熔断策略。</li>
            <li><strong>人机共驾与回退机制（Human-in-the-loop）</strong>：在关键决策点保留人类介入通道，确保复杂长链路任务的安全可控。</li>
          </ul>
          <p>SoulAgent 正在围绕这套标准构建开放的开发者生态，非常期待更多专家与开发者共同共建！</p>
        `
      }
    ]
  },
  "具身智能大模型路线研讨": {
    type: "twin",
    agentBadgeText: "王仲远的AI分身",
    messages: [
      {
        role: "user",
        content: "仲远总，结合智源在大模型方面的沉淀，您怎么看待具身智能（Embodied AI）未来的技术发展路线与落地挑战？"
      },
      {
        role: "assistant",
        htmlContent: `
          <p>这是一个非常关键且前沿的方向。具身智能（Embodied AI）是将大模型“大脑”与物理世界“躯体”深度结合的必由路线。</p>
          <p>结合我们在具身大模型方面的布局与思考，我的核心观点如下：</p>
          <ol>
            <li><strong>VLA 模型（Vision-Language-Action）是核心支撑</strong>：将视觉感知、语言理解与动作控制缝合在统一的大模型架构下，实现跨模态端到端的泛化控制。</li>
            <li><strong>高质量物理仿真与数据闭环</strong>：物理真实数据的采集昂贵且危险，因此建立高逼真度的物理仿真平台（Sim-to-Real）是构建数据驱动闭环的关键。</li>
            <li><strong>Task-centric 的自主规划能力</strong>：让机器人不仅能听懂指令，更能自主进行复杂长程任务拆解、环境感知与自我纠错。</li>
          </ol>
          <p>总结来说，具身智能是 AI 迈向物理世界的关键跨越。我们要用大模型的泛化能力重新定义机器人物理交互。</p>
        `
      },
      {
        role: "user",
        content: "明白了！那从 SoulAgent 的技术规划来看，我们是如何把这种具身智能架构落地到AI分身工作流中的？"
      },
      {
        role: "assistant",
        htmlContent: `
          <p>问到点子上了！我们在 SoulAgent 的架构设计中，主要从三个维度与具身智能相融合：</p>
          <ul>
            <li><strong>多 Agent 协作控制链</strong>：通过高级 Task Agent 负责顶层规划，底层 Domain Agent 执行具体动作，形成分层递进的控制体系。</li>
            <li><strong>长效物理环境记忆库（World Model Memory）</strong>：让 AI 分身和实体机器人具备环境三维语义地图与历史操作记忆。</li>
            <li><strong>仿真与实机端到端反馈闭环</strong>：支持在虚拟仿真环境快速验证 Agent 策略，再安全迁移至实体设备部署。</li>
          </ul>
        `
      }
    ]
  }
};

// =============================================
// 4. 专家广场列表数据
// =============================================
const expertList = [
  {
    id: "wangzhongyuan",
    name: "王仲远",
    agentName: "王仲远的AI分身",
    role: "智源研究院院长 · 具身智能专家",
    tag: "具身智能",
    gradient: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    desc: "专注于具身大模型、VLA端到端控制与人形机器人仿真落地研究。",
    stat: "1.2k+ 次对话"
  },
  {
    id: "huangtiejun",
    name: "黄铁军",
    agentName: "黄铁军的AI分身",
    role: "智源学术理事长 · 脉冲视觉专家",
    tag: "神经网络",
    gradient: "linear-gradient(135deg, #059669, #10b981)",
    desc: "主导脉冲神经视觉、超高速摄像头系统与类脑芯片架构研讨。",
    stat: "980 次对话"
  },
  {
    id: "linyongwen",
    name: "林咏文",
    agentName: "林咏文的AI分身",
    role: "大模型首席架构师",
    tag: "大模型",
    gradient: "linear-gradient(135deg, #0284c7, #38bdf8)",
    desc: "精通千亿参数语言模型预训练、长上下文推理与对齐算法优化。",
    stat: "2.4k+ 次对话"
  },
  {
    id: "zhanghongjiang",
    name: "张宏江",
    agentName: "张宏江的AI分身",
    role: "智源智库专家 · 算法领军人",
    tag: "算法专家",
    gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
    desc: "多媒体检索与计算机视觉领域开拓者，指导前沿 AI 战略突破。",
    stat: "1.8k+ 次对话"
  },
  {
    id: "quxin",
    name: "屈鑫",
    agentName: "屈鑫的AI分身",
    role: "生态负责人 · AI分身专家",
    tag: "AI分身",
    gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
    desc: "负责 Multi-Agent 协作框架设计、开发者生态与应用场景建设。",
    stat: "860 次对话"
  },
  {
    id: "chenbo",
    name: "陈博士",
    agentName: "陈博士的AI分身",
    role: "算法研究员 · 强化学习",
    tag: "强化学习",
    gradient: "linear-gradient(135deg, #7c3aed, #a855f7)",
    desc: "专注于 RLHF 人机对齐、PPO 优化算法及自主 Agent 试错学习。",
    stat: "1.5k+ 次对话"
  },
  {
    id: "liujiao",
    name: "刘教授",
    agentName: "刘教授的AI分身",
    role: "生命科学与 AI 交叉专家",
    tag: "前沿交叉",
    gradient: "linear-gradient(135deg, #0d9488, #14b8a6)",
    desc: "致力于蛋白质结构预测、分子生成与 AI 驱动新药研发前沿。",
    stat: "720 次对话"
  },
  {
    id: "ligong",
    name: "李工",
    agentName: "李工的AI分身",
    role: "基础设施与算力加速专家",
    tag: "系统算力",
    gradient: "linear-gradient(135deg, #475569, #64748b)",
    desc: "主导异构芯片集群调度、分布式训练框架与 GPU 通信优化。",
    stat: "1.1k+ 次对话"
  }
];
