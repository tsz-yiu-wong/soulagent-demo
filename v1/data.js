/**
 * SoulAgent 原型 - 数据中心 (data.js)
 * 所有长文案、长对话、富文本 HTML、专家列表统一抽取在此文件
 */

// =============================================
// 1. 智能体下拉菜单定义
// =============================================
const agentMenuItems = [
  { name: "MyAgent", avatar: "M", gradient: "linear-gradient(135deg, #4f46e5, #6366f1)" },
  { name: "写诗智能体", avatar: "写", gradient: "linear-gradient(135deg, #059669, #10b981)" },
  { name: "王仲远的AI分身", avatar: "王", gradient: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }
];

// =============================================
// 2. 智能体与历史对话映射数据
// =============================================
const agentData = {
  "MyAgent": [
    "欢迎使用 SoulAgent MyAgent",
    "探索智能体多样化功能",
    "快速开始提示指南"
  ],
  "写诗智能体": [
    "七言律诗·咏秋月",
    "现代抒情诗创作提纲",
    "宋词意境美化"
  ],
  "写诗 智能体": [
    "七言律诗·咏秋月",
    "现代抒情诗创作提纲",
    "宋词意境美化"
  ],
  "王仲远的AI分身": [
    "具身智能大模型路线研讨",
    "VLA模型端到端控制与仿真",
    "人形机器人实机部署与泛化"
  ],
  "具身智能体": [
    "具身感知与语义地图构建",
    "机器人机械臂轨迹规划",
    "Sim-to-Real 虚拟迁移算法"
  ]
};

// =============================================
// 3. 预设长对话富文本数据
// =============================================
const mockConversations = {
  // Agent 智能体对话（ChatGPT 风格，无头像）
  "七言律诗·咏秋月": {
    type: "agent",
    agentBadgeText: "写诗智能体",
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
        content: "明白了！那从 SoulAgent 的技术规划来看，我们是如何把这种具身智能架构落地到智能体工作流中的？"
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
    added: true,
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
    added: false,
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
    added: false,
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
    added: false,
    stat: "1.8k+ 次对话"
  },
  {
    id: "quxin",
    name: "屈鑫",
    agentName: "屈鑫的AI分身",
    role: "生态负责人 · 智能体专家",
    tag: "智能体",
    gradient: "linear-gradient(135deg, #ec4899, #f43f5e)",
    desc: "负责 Multi-Agent 协作框架设计、开发者生态与应用场景建设。",
    added: false,
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
    added: false,
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
    added: false,
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
    added: false,
    stat: "1.1k+ 次对话"
  }
];
