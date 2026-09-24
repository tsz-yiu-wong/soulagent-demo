/**
 * SoulAgent 原型 - 数据中心 (js/data.js)
 * 职责：定义与持久化全局数据（专属分身矩阵、专家列表、历史会话、档案中心数据等）
 */

// =============================================
// 0. 路由与路径辅助函数
// =============================================
function isInsidePagesDir() {
  const path = window.location.pathname.replace(/\\/g, '/');
  return path.includes('/pages/') || path.endsWith('/pages');
}

function getPageUrl(targetPage, params = {}) {
  const inPages = isInsidePagesDir();
  let base = '';
  if (targetPage === 'index.html') {
    base = inPages ? '../index.html' : 'index.html';
  } else {
    base = inPages ? targetPage : `pages/${targetPage}`;
  }

  const queryParts = [];
  for (const k in params) {
    if (params[k] !== undefined && params[k] !== null) {
      queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`);
    }
  }

  return queryParts.length > 0 ? `${base}?${queryParts.join('&')}` : base;
}

// =============================================
// 1. 智能体下拉菜单定义
// =============================================
const defaultAgentMenuItems = [
  { name: "AI助手", avatar: "A", gradient: "linear-gradient(135deg, #4f46e5, #6366f1)" }
];

// =============================================
// 1.1 我的专属AI分身矩阵 (My Clones) 与预设模板
// =============================================
const defaultMyClones = [];

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
const defaultAgentData = {
  "AI助手": [
    "智能系统与环境仿真探讨",
    "与张院士对话",
    "与李博士对话",
    "与陈老师对话",
    "欢迎使用 SoulAgent",
    "探索AI分身多样化功能",
    "快速开始提示指南"
  ],
  "我的写诗分身": [
    "七言律诗·咏秋月",
    "现代抒情诗创作提纲",
    "宋词意境美化"
  ],
  "张院士的AI分身": [
    "人工智能前沿发展路线研讨",
    "智能协同控制与仿真策略",
    "大规模分布式计算与泛化探索"
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
      },
      {
        role: "user",
        content: "明白了！那从 SoulAgent 的技术规划来看，我们是如何把这种智能架构落地到AI分身工作流中的？"
      },
      {
        role: "assistant",
        htmlContent: `
          <p>我们在 SoulAgent 的架构设计中，主要从三个维度与智能体系相融合：</p>
          <ul>
            <li><strong>多 Agent 协作控制链</strong>：通过高级规划 Agent 负责顶层分解，垂直 Domain Agent 执行具体动作，形成分层递进的控制体系。</li>
            <li><strong>长效环境记忆库</strong>：让 AI 分身具备全局语义理解与历史操作记忆。</li>
            <li><strong>仿真与端到端反馈闭环</strong>：支持在虚拟环境快速验证 Agent 策略，再安全迁移至实际业务部署。</li>
          </ul>
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
  },
  "人工智能前沿发展路线研讨": {
    type: "twin",
    agentBadgeText: "张院士的AI分身",
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
  }
};

// =============================================
// 4. 专家广场列表数据 (已排序：院士 -> 博士 -> 老师)
// =============================================
const expertList = [
  // 1. 院士层级
  {
    id: "zhang-academician",
    name: "张院士",
    agentName: "张院士的AI分身",
    role: "国家重点实验室专家 · 人工智能领域",
    tag: "人工智能",
    gradient: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    desc: "长期从事人工智能理论与前沿技术研究，指导前沿方向战略布局。",
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
  // 2. 博士层级
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
  // 3. 老师层级
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

// =============================================
// 5. 档案中心主库数据
// =============================================
const defaultProfileData = {
  files: [
    { id: 'f1', name: 'SoulAgent架构设计与协议规范.pdf', size: '2.4 MB', time: '2026-08-15 14:20', status: '解析完成', type: 'pdf', tokens: '14,200' },
    { id: 'f2', name: '多模态大模型调优指南_v3.docx', size: '1.8 MB', time: '2026-08-14 09:45', status: '解析完成', type: 'doc', tokens: '9,800' },
    { id: 'f3', name: 'Agent长短期记忆机制研究.md', size: '512 KB', time: '2026-08-12 16:30', status: '解析完成', type: 'md', tokens: '4,150' },
    { id: 'f4', name: '2026AI分身应用场景规划.xlsx', size: '850 KB', time: '2026-08-10 11:15', status: '解析完成', type: 'xls', tokens: '6,300' },
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
    { id: 'sm1', type: 'short', category: '当前会话上下文', content: '用户正在调整 Agent 档案中心设定，关注记忆模块与人设提示词配置。', time: '10 分钟前', importance: '高' },
    { id: 'sm2', type: 'short', category: '临时偏好', content: '当前任务偏好简洁紧凑的界面布局与精简参数项。', time: '25 分钟前', importance: '中' },
    { id: 'm1', type: 'long', category: '用户偏好', content: '用户偏好简洁、结构化的 Markdown 响应，喜欢包含代码示例与架构图表。', time: '2026-08-16 10:12', importance: '高' },
    { id: 'm2', type: 'long', category: '项目事实', content: 'SoulAgent 当前版本为 v1.4，核心模块包含侧边栏调度、专家AI分身广场、帮我听会以及定时任务。', time: '2026-08-15 17:40', importance: '高' },
    { id: 'm3', type: 'long', category: '对话总结', content: '讨论了关于具身智能控制接口映射方案，认同分层解耦的设计思路。', time: '2026-08-14 21:05', importance: '中' },
    { id: 'm4', type: 'long', category: '人设记忆', content: '用户称呼AI分身为“MyAgent”或“AI助手”，希望回答风格兼顾学术严谨性与产品工程化。', time: '2026-08-11 15:30', importance: '中' },
    { id: 'm5', type: 'long', category: '工具偏好', content: '在分析会议音频或定时任务时，优先使用异步任务队列与日志实时可视化展示。', time: '2026-08-09 13:20', importance: '低' }
  ]
};

// =============================================
// 6. 定时任务默认数据
// =============================================
const defaultScheduleTasks = [];
const defaultRecommendedTasks = [
  {
    id: 'rec-1',
    title: '每日 AI 新闻推送',
    desc: '每天早上 8:00 自动搜集并生成 AI 行业最新动态简报',
    scheduleText: '工作日（含调休） · 早上 8:00',
    nextRun: '11小时后运行',
    permanent: true
  },
  {
    id: 'rec-2',
    title: '每周总结汇报',
    desc: '每周五晚 10:00 提醒并整理本周工作产出与下周计划',
    scheduleText: '长期有效 · 每周五 · 晚上 22:00',
    nextRun: '4天后运行',
    permanent: true
  },
  {
    id: 'rec-3',
    title: '监测公众号、小红书账号内容更新',
    desc: '每 3 小时监测关注账号，有新动态时及时推送汇总通知',
    scheduleText: '长期有效 · 间隔每 3 小时自动监测',
    nextRun: '2小时后运行',
    permanent: true
  }
];

// =============================================
// 数据初始化与本地存储持久化
// =============================================
const DATA_VERSION = 'v5_20260825_myclones_empty_v3';

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

(function checkStorageVersion() {
  try {
    const isReload = isPageReload();
    const ver = sessionStorage.getItem('soulagent_data_version') || localStorage.getItem('soulagent_data_version');
    if (isReload || ver !== DATA_VERSION) {
      // 刷新页面或版本不匹配时清空存储，重置为默认初始数据
      ['localStorage', 'sessionStorage'].forEach(storeName => {
        const store = window[storeName];
        if (store) {
          Object.keys(store).forEach(k => {
            if (k.startsWith('soulagent_')) {
              store.removeItem(k);
            }
          });
        }
      });
      sessionStorage.setItem('soulagent_data_version', DATA_VERSION);
      localStorage.setItem('soulagent_data_version', DATA_VERSION);
    }
  } catch (e) {}
})();

function loadStoredData(key, defaultVal) {
  try {
    const raw = sessionStorage.getItem('soulagent_' + key) || localStorage.getItem('soulagent_' + key);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(defaultVal));
  } catch (e) {
    return JSON.parse(JSON.stringify(defaultVal));
  }
}

function saveStoredData(key, val) {
  try {
    sessionStorage.setItem('soulagent_' + key, JSON.stringify(val));
    localStorage.setItem('soulagent_' + key, JSON.stringify(val));
  } catch (e) {}
}

// 供随时重置全部数据回默认初始状态的方法
window.resetAllDataToDefault = function() {
  try {
    ['localStorage', 'sessionStorage'].forEach(storeName => {
      const store = window[storeName];
      if (store) {
        Object.keys(store).forEach(k => {
          if (k.startsWith('soulagent_')) {
            store.removeItem(k);
          }
        });
      }
    });
    sessionStorage.setItem('soulagent_data_version', DATA_VERSION);
    localStorage.setItem('soulagent_data_version', DATA_VERSION);
    window.location.reload();
  } catch (e) {}
};

const myClones = loadStoredData('myClones', defaultMyClones);
const agentData = loadStoredData('agentData', defaultAgentData);
const mockConversations = loadStoredData('mockConversations', defaultMockConversations);
const agentProfileData = loadStoredData('agentProfileData', defaultProfileData);
const scheduleTasks = loadStoredData('scheduleTasks', defaultScheduleTasks);
const scheduleRecommendedTasks = loadStoredData('scheduleRecommendedTasks', defaultRecommendedTasks);
const agentMenuItems = defaultAgentMenuItems;

window.presetCloneTemplates = presetCloneTemplates;
window.defaultScheduleTasks = defaultScheduleTasks;
window.defaultRecommendedTasks = defaultRecommendedTasks;
window.myClones = myClones;
window.agentData = agentData;
window.mockConversations = mockConversations;
window.agentProfileData = agentProfileData;
window.scheduleTasks = scheduleTasks;
window.scheduleRecommendedTasks = scheduleRecommendedTasks;
window.expertList = expertList;
window.agentMenuItems = agentMenuItems;

// 数据持久化保存方法
window.syncDataToStorage = function() {
  saveStoredData('myClones', window.myClones || myClones);
  saveStoredData('agentData', window.agentData || agentData);
  saveStoredData('mockConversations', window.mockConversations || mockConversations);
  saveStoredData('agentProfileData', window.agentProfileData || agentProfileData);
  saveStoredData('scheduleTasks', window.scheduleTasks || scheduleTasks);
  saveStoredData('scheduleRecommendedTasks', window.scheduleRecommendedTasks || scheduleRecommendedTasks);
};

// 通用数据帮助函数
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

function getAgentChats(agentName) {
  const currentAgent = agentName || "AI助手";
  if (agentData[currentAgent]) return agentData[currentAgent];
  const cleanName = currentAgent.replace(/\s+/g, '');
  for (let k in agentData) {
    if (k.replace(/\s+/g, '') === cleanName) return agentData[k];
  }
  const defaultChats = [`${cleanName} 对话记录一`, `${cleanName} 策略研讨`, `${cleanName} 实践记录`];
  agentData[currentAgent] = defaultChats;
  window.syncDataToStorage();
  return defaultChats;
}

function getAllAggregatedProfileFiles() {
  const masterFiles = (window.agentProfileData && window.agentProfileData.files) || [];
  const list = masterFiles.map(f => ({
    ...f,
    source: '',
    isMaster: true,
    isClone: false
  }));

  if (typeof myClones !== 'undefined' && Array.isArray(myClones)) {
    myClones.forEach(clone => {
      if (clone.files && Array.isArray(clone.files)) {
        clone.files.forEach(cf => {
          list.push({
            ...cf,
            source: clone.name,
            sourceTag: clone.tag || '专属分身',
            sourceGradient: clone.gradient || 'linear-gradient(135deg, #0284c7, #38bdf8)',
            cloneId: clone.id,
            isClone: true,
            isMaster: false
          });
        });
      }
    });
  }

  return list;
}

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
window.getExpertOpinion = getExpertOpinion;

function generateDynamicConversation(chatTitle, isTwin, exp, clone) {
  const title = chatTitle || '对话';
  let targetName = 'AI 助手';
  let roleTitle = '智能助理';
  let gradient = 'linear-gradient(135deg, #4f46e5, #6366f1)';

  if (clone) {
    targetName = clone.name;
    roleTitle = clone.tag || '我的分身';
    gradient = clone.gradient;
  } else if (exp) {
    targetName = exp.name + '的AI分身';
    roleTitle = exp.role;
    gradient = exp.gradient;
  }

  // 1. 帮我听会系列
  if (title.startsWith('帮我听') || title.includes('听会') || title.includes('大会') || title.includes('论坛') || title.includes('播客')) {
    const cleanConfName = title.replace(/^帮我听\s*/, '');
    return {
      type: "listen",
      messages: [
        {
          role: "user",
          content: title.startsWith('帮我听') ? title : `帮我听 ${title}`
        },
        {
          role: "assistant",
          htmlContent: `
            <p>已为您完成<strong>【${escapeHtml(cleanConfName)}】</strong>的智能听记与纪要整理：</p>
            <div class="agent-summary-card" style="background:#ffffff;border:1px solid #cbd5e1;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.05);margin:12px 0;">
              <div style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #4f46e5 100%);color:#fff;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;">
                <span style="background:#16a34a;color:#fff;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600;">已生成纪要</span>
                <span style="font-size:12px;opacity:0.9;">AI 智能听记</span>
              </div>
              <div style="padding:14px 16px;">
                <h3 style="margin:0 0 8px 0;font-size:15px;color:#111827;">${escapeHtml(cleanConfName)}</h3>
                <div style="font-size:13px;color:#4b5563;line-height:1.6;">
                  <p style="margin:0 0 6px 0;"><strong>核心要点提炼：</strong></p>
                  <ol style="margin:0;padding-left:18px;">
                    <li><strong>前沿技术趋势</strong>：深度剖析模型架构演进、多模态融合及具身智能落地。</li>
                    <li><strong>工程实践心得</strong>：分享算力集群优化、长上下文检索（Long-Context）及安全对齐方案。</li>
                    <li><strong>生态与开放协同</strong>：推动产学研合作与多智能体（Multi-Agent）开发平台建设。</li>
                  </ol>
                </div>
              </div>
            </div>
            <p>您可以继续就本次会议的具体主题、嘉宾观点或演讲细节向我提问！</p>
          `
        }
      ]
    };
  }

  // 2. 定时任务配置对话
  if (title.includes('定时任务') || title.includes('已安排任务')) {
    return {
      type: "agent",
      messages: [
        {
          role: "user",
          content: title
        },
        {
          role: "assistant",
          htmlContent: `
            <p>你好！我是 <strong>SoulAgent 定时任务助手</strong>。定时任务能帮助你在指定的时间或周期内自动执行特定 Prompt 或数据监控。</p>
            <p><strong>定时任务的工作机制：</strong></p>
            <ul>
              <li><strong>按周期触发</strong>：例如每个工作日早晨 8:00 生成每日简报并推送；</li>
              <li><strong>按固定间隔执行</strong>：例如每隔 3 小时自动抓取并总结关注源更新；</li>
              <li><strong>单次预定</strong>：在指定的某个未来时间点自动执行一次性复杂任务。</li>
            </ul>
            <p>请告诉我：<strong>你想让 SoulAgent 安排什么任务？希望在什么时候或以什么频率自动运行？</strong></p>
          `
        }
      ]
    };
  }

  // 3. 专家群聊系列
  if (title.includes('群聊')) {
    const defaultExps = (window.expertList || []).slice(0, 3);
    const expMsgs = defaultExps.map(exp => ({
      role: "assistant",
      expertId: exp.id,
      expertName: exp.name,
      expertRole: exp.role,
      expertGradient: exp.gradient,
      htmlContent: `<p>${escapeHtml(getExpertOpinion(exp, title))}</p>`
    }));

    return {
      type: "group",
      expertIds: defaultExps.map(e => e.id),
      messages: [
        {
          role: "user",
          content: `各位专家好，针对“${title}”的主题，想向各位请教各自领域的核心见解与方案。`
        },
        ...expMsgs
      ]
    };
  }

  return {
    type: (isTwin || clone || exp) ? 'twin' : 'agent',
    messages: [
      {
        role: "user",
        content: `关于“${title}”，我们来探讨一下具体方案。`
      },
      {
        role: "assistant",
        htmlContent: `
          <p>你好！针对主题 <strong>“${escapeHtml(title)}”</strong>，我已经结合专属上下文为你梳理了以下核心观点：</p>
          <ol>
            <li><strong>目标明确化</strong>：清晰定义当前对话的产出交付标准与核心边界。</li>
            <li><strong>结构化推演</strong>：基于知识库与多模态模型进行逻辑拆解与分步执行。</li>
            <li><strong>落地与持续调优</strong>：提供可以直接调用的方案、代码或策略模板。</li>
          </ol>
          <p>请随时告诉我你想要深入探讨的具体细节！</p>
        `
      }
    ]
  };
}

// =============================================
// 9. 首页推荐提问数据与随机获取函数
// =============================================
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

function getRandomRecommendQuestions(count = 3) {
  const list = window.mockRecommendQuestions || defaultRecommendQuestions;
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

window.mockRecommendQuestions = defaultRecommendQuestions;
window.getRandomRecommendQuestions = getRandomRecommendQuestions;


