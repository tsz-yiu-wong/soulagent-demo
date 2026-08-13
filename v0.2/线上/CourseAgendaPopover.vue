<script setup lang="ts">
import { computed, nextTick, ref, type ComponentPublicInstance } from 'vue';

// 定义接口类型
export interface ConferenceItem {
  id: number;
  name: string;
  type?: string;
  time?: string;
  icon?: string;
}

export interface ForumTalkChildItem {
  id: number;
  name: string;
  type?: string;
  speaker?: string[];
  description?: string;
}

export interface ForumGroup {
  forumId: number;
  forumName: string;
  talks: ForumTalkChildItem[];
  filteredTalks?: ForumTalkChildItem[];
}

// 模拟会议/课程数据（包含长标题用于测试超长省略号 Tooltip 提示）
const MOCK_CONFERENCE_LIST: ConferenceItem[] = [
  {
    id: 1,
    name: '2026 北京智源大会',
    type: 'conference',
    time: '2026.06.05 - 06.07',
  },
  {
    id: 2,
    name: '2025 智源大模型技术峰会与全球生成式人工智能前沿论坛（超长标题演示）',
    type: 'conference',
    time: '2025.11.18 - 11.20',
  },
];

const MOCK_COURSE_LIST: ConferenceItem[] = [
  {
    id: 10,
    name: '深度学习与大模型前沿课程及强化学习对齐实战全套讲座（超长课程名称）',
    type: 'course',
    time: '2026.03.15 - 04.20',
  },
  {
    id: 20,
    name: 'AI Agent 智能体开发实战',
    type: 'course',
    time: '2026.05.10 - 05.25',
  },
];

const MOCK_FORUM_GROUPS_MAP: Record<number, ForumGroup[]> = {
  1: [
    {
      forumId: 101,
      forumName: '人工智能前沿论坛与通用大模型推理加速研讨会（超长论坛名称）',
      talks: [
        { id: 1001, name: '大模型与 AGI 最新进展与趋势超长议题名称演示', speaker: ['张教授', '李博士'] },
        { id: 1002, name: '具身智能与多模态感知控制', speaker: ['王研究员'] },
        { id: 1003, name: '通用大语言模型的推理加速', speaker: ['陈工程师'] },
      ],
    },
    {
      forumId: 102,
      forumName: 'AI for Science 科学智能论坛',
      talks: [
        { id: 1004, name: 'AI 在生物制药与蛋白质设计中的应用', speaker: ['赵专家'] },
        { id: 1005, name: '量子计算与机器学习融合探索', speaker: ['钱教授'] },
      ],
    },
  ],
  2: [
    {
      forumId: 201,
      forumName: '开源生态与模型架构',
      talks: [
        { id: 2001, name: '长上下文大模型架构优化实践', speaker: ['孙工程师'] },
        { id: 2002, name: '多模态数据高效预训练与对齐', speaker: ['周团队'] },
      ],
    },
  ],
  10: [
    {
      forumId: 301,
      forumName: '第一章：Transformer 基础与深度神经网络演进',
      talks: [
        { id: 3001, name: 'Self-Attention 机制与位置编码详解', speaker: ['吴导师'] },
        { id: 3002, name: 'Decoder-Only 架构原理解析', speaker: ['郑助教'] },
      ],
    },
    {
      forumId: 302,
      forumName: '第二章：强化学习与 Alignment',
      talks: [
        { id: 3003, name: 'RLHF 与 PPO 算法实战', speaker: ['王导师'] },
        { id: 3004, name: 'DPO 与 Direct Preference Optimization', speaker: ['陈讲师'] },
      ],
    },
  ],
  20: [
    {
      forumId: 401,
      forumName: 'Agent 架构设计与工具调用',
      talks: [
        { id: 4001, name: 'Function Calling 与 ReAct 思考链', speaker: ['刘工程师'] },
        { id: 4002, name: '多 Agent 协作系统与记忆机制', speaker: ['杨架构师'] },
      ],
    },
  ],
};

const props = withDefaults(
  defineProps<{
    dark?: boolean;
    /** 使用场景：'listen-help'=帮我听（展示tab，默认会议tab），'ask-course'=问课程（隐藏tab，默认课程tab） */
    scenario?: 'listen-help' | 'ask-course';
  }>(),
  { dark: false, scenario: 'listen-help' }
);

const emit = defineEmits<{
  (e: 'select', talk: ForumTalkChildItem & { conferenceLabel?: string }): void;
}>();

const visible = ref(false);
const keyword = ref('');
const loading = ref(false);
const searchInputRef = ref<{ focus: () => void } | null>(null);

// 视图层级状态: 1 = 第一层（显示一级分类列表），2 = 第二层（显示二级论坛和三级议题）
const currentLevel = ref<1 | 2>(1);

// 会议tab数据
const conferenceList = ref<ConferenceItem[]>([]);
const selectedConference = ref<ConferenceItem | null>(null);
const conferenceForumGroupsMap = ref<Map<number, ForumGroup[]>>(new Map());

// 课程tab数据
const courseList = ref<ConferenceItem[]>([]);
const selectedCourse = ref<ConferenceItem | null>(null);
const courseForumGroupsMap = ref<Map<number, ForumGroup[]>>(new Map());

const activeTab = ref<'conference' | 'course'>(
  props.scenario === 'ask-course' ? 'course' : 'conference'
);
const expandedForumIds = ref<Set<number>>(new Set());

/** 获取当前tab对应的列表和选中项 */
const getCurrentTabData = () => {
  if (activeTab.value === 'conference') {
    return {
      list: conferenceList,
      selected: selectedConference,
      map: conferenceForumGroupsMap,
    };
  }
  return { list: courseList, selected: selectedCourse, map: courseForumGroupsMap };
};

/** 加载指定类型的第一级列表数据 */
const fetchFirstLevelByType = (type: 'conference' | 'course'): ConferenceItem[] => {
  return type === 'conference' ? [...MOCK_CONFERENCE_LIST] : [...MOCK_COURSE_LIST];
};

/** 加载会议和课程数据 */
const fetchBothFirstLevel = () => {
  if (loading.value) return;
  loading.value = true;

  // 重置所有数据
  conferenceList.value = [];
  courseList.value = [];
  selectedConference.value = null;
  selectedCourse.value = null;
  conferenceForumGroupsMap.value.clear();
  courseForumGroupsMap.value.clear();
  expandedForumIds.value = new Set();
  currentLevel.value = 1;

  const conferenceData = fetchFirstLevelByType('conference');
  const courseData = fetchFirstLevelByType('course');

  conferenceList.value = conferenceData;
  courseList.value = courseData;

  loading.value = false;
};

/** 加载第二级和第三级数据 */
const fetchSecondLevel = (parentId: number) => {
  const { map } = getCurrentTabData();
  if (map.value.has(parentId)) return;
  const groups = MOCK_FORUM_GROUPS_MAP[parentId] ?? [];
  map.value.set(parentId, groups);
};

/** 切换tab：更新当前tab并停留在第一层 */
const handleTabChange = (tab: 'conference' | 'course') => {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  keyword.value = '';
  expandedForumIds.value = new Set();
  currentLevel.value = 1;
};

/** 点击第一层选项：选中并进入第二层视图 */
const handleFirstLevelClick = (item: ConferenceItem) => {
  const { selected } = getCurrentTabData();
  selected.value = item;
  fetchSecondLevel(item.id);
  const groups = getCurrentTabData().map.value.get(item.id) ?? [];
  // 如果二级就一个则默认展开，大于一个则默认收起
  if (groups.length === 1) {
    expandedForumIds.value = new Set([groups[0].forumId]);
  } else {
    expandedForumIds.value = new Set();
  }
  keyword.value = '';
  currentLevel.value = 2;
  nextTick(() => searchInputRef.value?.focus());
};

/** 从第二层返回第一层 */
const handleBackToLevel1 = () => {
  const { selected } = getCurrentTabData();
  selected.value = null;
  expandedForumIds.value = new Set();
  keyword.value = '';
  currentLevel.value = 1;
};

/** 点击第二级项（论坛）：切换展开/收起 */
const handleSecondLevelClick = (forumId: number) => {
  const newSet = new Set(expandedForumIds.value);
  if (newSet.has(forumId)) {
    newSet.delete(forumId);
  } else {
    newSet.add(forumId);
  }
  expandedForumIds.value = newSet;
};

/** 判断二级是否展开 */
const isForumExpanded = (forumId: number) =>
  expandedForumIds.value.has(forumId) || Boolean(keyword.value.trim());

const matchesKeyword = (talk: ForumTalkChildItem, k: string): boolean =>
  talk.name.toLowerCase().includes(k) ||
  (talk.speaker?.some((s) => s.toLowerCase().includes(k)) ?? false);

/** 第一层列表（按关键词过滤：名称/时间） */
const filteredFirstLevel = computed(() => {
  const { list } = getCurrentTabData();
  const k = keyword.value.trim().toLowerCase();
  if (!k) return list.value;
  return list.value.filter(
    (c) =>
      c.name.toLowerCase().includes(k) ||
      (c.time?.toLowerCase().includes(k) ?? false)
  );
});

/** 第二层论坛与议题分组（按关键词过滤：匹配二级显示全部三级，匹配三级显示过滤三级，无匹配则隐藏二级） */
const filteredSecondLevel = computed(() => {
  const { selected, map } = getCurrentTabData();
  const k = keyword.value.trim().toLowerCase();
  const groups = map.value.get(selected.value?.id ?? -1) ?? [];
  if (!k) return groups.map((g) => ({ ...g, filteredTalks: g.talks }));

  const result: ForumGroup[] = [];
  for (const group of groups) {
    const forumMatch = group.forumName.toLowerCase().includes(k);
    if (forumMatch) {
      // 匹配二级：显示该二级下的所有三级内容
      result.push({
        ...group,
        filteredTalks: group.talks,
      });
    } else {
      // 二级不匹配：检索是否有匹配的三级内容
      const matchedTalks = group.talks.filter((item) => matchesKeyword(item, k));
      if (matchedTalks.length > 0) {
        result.push({
          ...group,
          filteredTalks: matchedTalks,
        });
      }
      // 没有匹配的三级内容则忽略（隐藏二级）
    }
  }
  return result;
});

/** 动态计算搜索框 Placeholder：搜索论坛/议题 / 搜索课题 */
const searchPlaceholder = computed(() => {
  return activeTab.value === 'conference' ? '搜索论坛/议题' : '搜索课题';
});

const handleVisibleChange = (nextVisible: boolean) => {
  visible.value = nextVisible;
  if (nextVisible) {
    fetchBothFirstLevel();
  } else {
    keyword.value = '';
    selectedConference.value = null;
    selectedCourse.value = null;
    expandedForumIds.value = new Set();
    currentLevel.value = 1;
  }
};

const topicRefs = ref<Map<string, HTMLElement>>(new Map());

const setTopicRef = (key: string, el: Element | ComponentPublicInstance | null) => {
  if (el && el instanceof HTMLElement) {
    topicRefs.value.set(key, el);
  } else {
    topicRefs.value.delete(key);
  }
};

/** 判断文本是否因超出宽度产生省略号 */
const isTopicTruncated = (key: string) => {
  const el = topicRefs.value.get(key);
  return el ? el.scrollWidth > el.clientWidth : false;
};

const handleSelectTalk = (talk: ForumTalkChildItem) => {
  const speakerStr = talk.speaker?.length ? `-${talk.speaker.join('-')}` : '';
  emit('select', { ...talk, conferenceLabel: `${talk.name}${speakerStr}` });
  visible.value = false;
};
</script>

<template>
  <el-popover
    :visible="visible"
    trigger="click"
    placement="top-start"
    :popper-class="
      dark ? 'course-agenda-popover course-agenda-popover--dark' : 'course-agenda-popover'
    "
    :width="360"
    @update:visible="handleVisibleChange"
  >
    <template #reference>
      <slot name="trigger" :visible="visible">
        <button
          type="button"
          class="course-agenda-trigger"
          :class="{ 'course-agenda-trigger--active': visible }"
          aria-label="听课程"
        >
          <span class="course-agenda-trigger__icon" aria-hidden="true"></span>
          <span class="course-agenda-trigger__text">听课程</span>
        </button>
      </slot>
    </template>
    <div class="course-agenda-popover-content">
      <!-- 顶部标题/切换区：第一层显示 Tab 切换；第二层显示 返回按钮 + 会议/课程名称 -->
      <div v-if="currentLevel === 1 && scenario === 'listen-help'" class="tab-bar">
        <button
          type="button"
          class="tab-item"
          :class="{ 'tab-item--active': activeTab === 'conference' }"
          @click="handleTabChange('conference')"
        >
          会议
        </button>
        <button
          type="button"
          class="tab-item"
          :class="{ 'tab-item--active': activeTab === 'course' }"
          @click="handleTabChange('course')"
        >
          课程
        </button>
      </div>

      <div v-else-if="currentLevel === 2" class="level2-header">
        <button type="button" class="back-btn" @click="handleBackToLevel1" aria-label="返回">
          <span class="back-icon" aria-hidden="true"></span>
        </button>
        <el-tooltip
          :content="getCurrentTabData().selected.value?.name ?? ''"
          :disabled="!isTopicTruncated('level2-header-title')"
          placement="top-start"
        >
          <span
            class="level2-title"
            :ref="(el) => setTopicRef('level2-header-title', el)"
          >
            {{ getCurrentTabData().selected.value?.name }}
          </span>
        </el-tooltip>
      </div>

      <!-- 搜索框（只在二级菜单显示） -->
      <div v-if="currentLevel === 2" class="search-wrapper">
        <el-input
          ref="searchInputRef"
          v-model="keyword"
          size="small"
          class="search-input"
          clearable
          :placeholder="searchPlaceholder"
          @keydown.stop
        />
      </div>

      <div v-if="loading" class="agenda-list-loading">
        加载中...
      </div>

      <template v-else>
        <!-- 第一层视图：显示第一级（Icon + 名称 + 时间，超出省略显示 Tooltip） -->
        <div v-if="currentLevel === 1" class="agenda-list agenda-list--level1">
          <div
            v-for="item in filteredFirstLevel"
            :key="item.id"
            class="level1-card-item"
            @click="handleFirstLevelClick(item)"
          >
            <div class="level1-card-icon"></div>
            <div class="level1-card-content">
              <el-tooltip
                :content="item.name"
                :disabled="!isTopicTruncated('level1-title-' + item.id)"
                placement="top-start"
              >
                <div
                  class="level1-card-title"
                  :ref="(el) => setTopicRef('level1-title-' + item.id, el)"
                >
                  {{ item.name }}
                </div>
              </el-tooltip>
              <div v-if="item.time" class="level1-card-time">{{ item.time }}</div>
            </div>
            <div class="level1-card-arrow"></div>
          </div>
          <div v-if="filteredFirstLevel.length === 0" class="agenda-list-empty">
            暂无相关内容
          </div>
        </div>

        <!-- 第二层视图：显示第二级（论坛）和第三级（议题），超出省略显示 Tooltip -->
        <div v-else-if="currentLevel === 2" class="agenda-list">
          <div
            v-for="forumGroup in filteredSecondLevel"
            :key="forumGroup.forumId"
            class="accordion-group accordion-group--forum"
          >
            <!-- 第二级：论坛 -->
            <button
              type="button"
              class="agenda-item accordion-header"
              @click="handleSecondLevelClick(forumGroup.forumId)"
            >
              <div class="accordion-title accordion-title--start">
                <el-tooltip
                  :content="forumGroup.forumName"
                  :disabled="!isTopicTruncated('forum-name-' + forumGroup.forumId)"
                  placement="top-start"
                >
                  <span
                    class="accordion-title__name"
                    :ref="(el) => setTopicRef('forum-name-' + forumGroup.forumId, el)"
                  >
                    {{ forumGroup.forumName }}
                  </span>
                </el-tooltip>
              </div>
            </button>

            <!-- 第三级：议题 -->
            <div v-if="isForumExpanded(forumGroup.forumId)" class="accordion-body">
              <el-tooltip
                v-for="talk in forumGroup.filteredTalks"
                :key="talk.id"
                :content="
                  talk.name + (talk.speaker?.length ? ' - ' + talk.speaker.join(', ') : '')
                "
                :disabled="!isTopicTruncated('talk-single-' + forumGroup.forumId + '-' + talk.id)"
                placement="top-start"
              >
                <button
                  type="button"
                  class="agenda-item accordion-talk"
                  @click="handleSelectTalk(talk)"
                >
                  <div
                    class="agenda-item__topic"
                    :ref="
                      (el) => setTopicRef('talk-single-' + forumGroup.forumId + '-' + talk.id, el)
                    "
                  >
                    {{ talk.name }}
                    <span v-for="name in talk.speaker" :key="name" class="agenda-item__teacher">
                      - {{ name }}
                    </span>
                  </div>
                </button>
              </el-tooltip>
              <div v-if="!forumGroup.filteredTalks?.length" class="agenda-list-empty">
                暂无相关议题
              </div>
            </div>
          </div>
          <div v-if="filteredSecondLevel.length === 0" class="agenda-list-empty">
            暂无相关议题
          </div>
        </div>
      </template>
    </div>
  </el-popover>
</template>

<style lang="scss">
.el-popper.course-agenda-popover {
  width: 480px !important;
  padding: 8px !important;
  background: #ffffff;
  box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: none;
}

.el-popper.course-agenda-popover--dark {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%) padding-box,
    linear-gradient(154deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))
      border-box !important;
  box-shadow: inset 0px 0px 12px 0px rgba(255, 255, 255, 0.5) !important;
  border-radius: 16px !important;
  border: 1px solid transparent !important;

  .level2-title {
    color: #ffffff !important;
  }

  .back-btn {
    color: rgba(255, 255, 255, 0.8) !important;

    &:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      color: #ffffff !important;
    }
  }

  .level1-card-item {
    background: transparent !important;
    border: none !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;

    &:last-child {
      border-bottom: none !important;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.08) !important;
    }
  }

  .level1-card-title {
    color: rgba(255, 255, 255, 0.95) !important;
  }

  .level1-card-time {
    color: rgba(255, 255, 255, 0.45) !important;
  }

  .search-wrapper {
    border-bottom-color: rgba(255, 255, 255, 0.08) !important;
  }

  .accordion-title__name {
    color: #ffffff !important;
  }

  .search-input .el-input__inner {
    color: rgba(255, 255, 255, 0.8) !important;

    &::placeholder {
      color: rgba(255, 255, 255, 0.35) !important;
    }
  }

  .agenda-list-loading,
  .agenda-list-empty {
    color: rgba(255, 255, 255, 0.4) !important;
  }

  .agenda-item {
    position: relative;

    &:hover {
      background: #454545 !important;
    }
  }

  .agenda-item__topic {
    color: rgba(255, 255, 255, 0.9) !important;

    &:before {
      background: #f5a623 !important;
    }
  }

  .agenda-item__teacher {
    color: rgba(255, 255, 255) !important;
  }

  & > .el-popper__arrow::before {
    background: transparent !important;
    border: none;
  }
}

@media (max-width: 991px) {
  .course-agenda-popover {
    width: min(309px, calc(100vw - 24px)) !important;
    max-width: calc(100vw - 24px) !important;
    height: min(395px, 62vh);
  }
}
</style>

<style scoped lang="scss">
.course-agenda-trigger {
  border: 0;
  border-radius: 30px;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-left: 20px;
  cursor: pointer;

  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
}

.course-agenda-trigger__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: inline-block;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23141b26' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/%3E%3C/svg%3E") center/contain no-repeat;
}

.course-agenda-trigger__text {
  font-weight: 400;
  font-size: 14px;
  color: #141b26;
  line-height: 18px;
}

/* 第二层标题栏 */
.level2-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 6px;
}

.back-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #666666;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background: #f0f0f2;
    color: #141b26;
  }
}

.back-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='19' y1='12' x2='5' y2='12'%3E%3C/line%3E%3Cpolyline points='12 19 5 12 12 5'%3E%3C/polyline%3E%3C/svg%3E") center/contain no-repeat;
}

.level2-title {
  font-size: 15px;
  font-weight: 600;
  color: #141b26;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* 第一层无Border分隔线列表项样式 */
.agenda-list--level1 {
  padding: 4px 16px 8px;
}

.level1-card-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 8px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f0f0f4;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
  margin-bottom: 0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8f9fa;
  }
}

.level1-card-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff3eb 0%, #ffebd6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::before {
    content: '';
    width: 18px;
    height: 18px;
    display: block;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ff6700' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/%3E%3C/svg%3E") center/contain no-repeat;
  }
}

.level1-card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.level1-card-title {
  font-weight: 500;
  font-size: 15px;
  color: #141b26;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.level1-card-time {
  font-weight: 400;
  font-size: 12px;
  color: #999999;
  line-height: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.level1-card-arrow {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23bfbfbf' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9 18 15 12 9 6'/%3E%3C/svg%3E") center/contain no-repeat;
}

.search-wrapper {
  margin: 8px 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f9f9fb;
}

.search-input {
  :deep(.el-input__wrapper) {
    border: none;
    box-shadow: none !important;
    background: transparent;
    padding: 0;
  }

  :deep(.el-input__inner) {
    font-weight: 400;
    font-size: 16px;
    line-height: 20px;
  }
}

.agenda-list {
  max-height: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 4px 16px 8px;
  gap: 2px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.first-level-group {
  display: contents;
}

.agenda-list-loading,
.agenda-list-empty {
  padding: 8px;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
}

.agenda-item {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  font-size: 16px;
  position: relative;

  &:hover {
    background: #f7f7f9;
  }
}

.conference-list-item {
  padding: 12px 16px 12px 20px;
}

.accordion-header .accordion-title__name {
  background: linear-gradient(35deg, #ffb300, #ff4300) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

.agenda-item__topic {
  font-weight: 400;
  font-size: 16px;
  color: #141b26;
  line-height: 18px;
  position: relative;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agenda-item__teacher {
  font-weight: 400;
  font-size: 16px;
  color: #141b26;
  line-height: 16px;
  white-space: nowrap;
}

.tab-bar {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 12px 0 8px;
}

.tab-item {
  border: none;
  background: transparent;
  font-weight: 400;
  font-size: 16px;
  color: #999;
  cursor: pointer;
  padding: 0;
  position: relative;
  line-height: 22px;

  &--active {
    background: linear-gradient(35deg, #ffb300, #ff4300) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    background-clip: text !important;
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 28px;
      height: 2px;
      background: linear-gradient(270deg, #ff6700 0%, #ffa000 100%);
      border-radius: 1px;
    }
  }
}

.accordion-group {
  margin-bottom: 4px;
  &--forum {
    .accordion-header {
      padding-left: 16px !important;
      margin-left: 0 !important;
      width: 100% !important;
      &:hover {
        background: none !important;
      }
    }
    .accordion-body {
      padding-left: 0;
    }
  }
}

.accordion-header {
  display: flex;
  align-items: center;
  padding: 12px 0 12px 20px;
  margin-left: 16px;
  gap: 8px;
  width: calc(100% - 16px);

  &:before {
    display: none;
  }
}

.accordion-title {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;

  &--start {
    justify-content: flex-start;
  }
}

.accordion-title__name {
  font-weight: 500;
  font-size: 15px;
  color: #141b26;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.accordion-title__count {
  font-weight: 400;
  font-size: 12px;
  color: #999;
  line-height: 16px;
  white-space: nowrap;
}

.accordion-arrow {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: inline-block;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9 18 15 12 9 6'/%3E%3C/svg%3E") center/contain no-repeat;
  transition: transform 0.2s;

  &--expanded {
    transform: rotate(90deg);
  }
}

.accordion-body {
  padding: 0 0 8px 30px;
}

.accordion-talk {
  padding: 10px 28px 10px 35px;

  &:before {
    left: 24px;
  }
  &:before {
    content: '';
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 103, 0, 0.2);
  }
}
</style>
