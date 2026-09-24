/**
 * 老师工作台 - 数据访问层 (SchoolDB)
 * 双模自适应架构：
 *  1. 默认优先连接后端 soulagent-edu-service (通过 WorkbenchApi)；
 *  2. 当无后端环境（如未启动后端代理、注释了 api.js 或接口请求失败）时，自动无缝降级为浏览器 localStorage 模式；
 *  3. 保持与原 SchoolDB 相同的公开方法签名，页面业务代码无需任何改动。
 */
(function (global) {
  const STORAGE_KEY_STUDENTS = 'schooldb_students_v3';
  const STORAGE_KEY_SEATING = 'schooldb_seating_v3';
  const STORAGE_KEY_ROLLCALL = 'schooldb_rollcall_v3';
  const STORAGE_KEY_TODOS = 'schooldb_todos_v3';
  const STORAGE_KEY_EVENTS = 'schooldb_events_v3';
  const STORAGE_KEY_TIMETABLES = 'schooldb_timetables_v3';
  const STORAGE_KEY_SELECTED_TIMETABLE_ID = 'schooldb_selected_timetable_id_v3';

  function getRelativeDateStr(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // ==================== 默认/兜底模拟数据 ====================
  const FALLBACK_PERIODS = [
    { period: 1, name: '第1节', startTime: '08:10', endTime: '08:55' },
    { period: 2, name: '第2节', startTime: '09:05', endTime: '09:50' },
    { period: 3, name: '第3节', startTime: '10:15', endTime: '11:00' },
    { period: 4, name: '第4节', startTime: '11:10', endTime: '11:55' },
    { period: 5, name: '第5节', startTime: '14:00', endTime: '14:45' },
    { period: 6, name: '第6节', startTime: '14:55', endTime: '15:40' },
    { period: 7, name: '第7节', startTime: '16:00', endTime: '16:45' },
    { period: 8, name: '第8节', startTime: '16:55', endTime: '17:40' }
  ];

  const FALLBACK_COURSES = [
    { id: 'c_1', dayOfWeek: 1, period: 1, startTime: '08:10', endTime: '08:55', subject: '数学', className: '六(1)班', classroom: '致远楼 302', color: '#C5222F' },
    { id: 'c_2', dayOfWeek: 1, period: 3, startTime: '10:15', endTime: '11:00', subject: '数学', className: '六(2)班', classroom: '致远楼 304', color: '#3B82F6' },
    { id: 'c_3', dayOfWeek: 1, period: 6, startTime: '14:30', endTime: '15:15', subject: '班会', className: '六(1)班', classroom: '致远楼 302', color: '#F59E0B' },
    { id: 'c_4', dayOfWeek: 2, period: 2, startTime: '09:05', endTime: '09:50', subject: '数学', className: '六(1)班', classroom: '致远楼 302', color: '#C5222F' },
    { id: 'c_5', dayOfWeek: 2, period: 4, startTime: '11:10', endTime: '11:55', subject: '课后答疑', className: '六(1)班', classroom: '教师办公室', color: '#8B5CF6' },
    { id: 'c_6', dayOfWeek: 3, period: 1, startTime: '08:10', endTime: '08:55', subject: '数学', className: '六(2)班', classroom: '致远楼 304', color: '#3B82F6' },
    { id: 'c_7', dayOfWeek: 3, period: 3, startTime: '10:15', endTime: '11:00', subject: '数学', className: '六(1)班', classroom: '致远楼 302', color: '#C5222F' },
    { id: 'c_8', dayOfWeek: 3, period: 5, startTime: '13:30', endTime: '14:15', subject: '数学思维社团', className: '兴趣组', classroom: '阶梯教室', color: '#EC4899' },
    { id: 'c_9', dayOfWeek: 4, period: 2, startTime: '09:05', endTime: '09:50', subject: '数学', className: '六(1)班', classroom: '致远楼 302', color: '#C5222F' },
    { id: 'c_10', dayOfWeek: 4, period: 4, startTime: '11:10', endTime: '11:55', subject: '数学', className: '六(2)班', classroom: '致远楼 304', color: '#3B82F6' },
    { id: 'c_11', dayOfWeek: 5, period: 1, startTime: '08:10', endTime: '08:55', subject: '数学', className: '六(1)班', classroom: '致远楼 302', color: '#C5222F' },
    { id: 'c_12', dayOfWeek: 5, period: 4, startTime: '11:10', endTime: '11:55', subject: '数学', className: '六(2)班', classroom: '致远楼 304', color: '#3B82F6' }
  ];

  const FALLBACK_TIMETABLES = [
    {
      id: 'tt_2026_autumn',
      name: '2026-2027学年 第一学期',
      startDate: '2026-08-01',
      endDate: '2027-01-31',
      periods: JSON.parse(JSON.stringify(FALLBACK_PERIODS)),
      courses: JSON.parse(JSON.stringify(FALLBACK_COURSES))
    },
    {
      id: 'tt_2027_spring',
      name: '2026-2027学年 第二学期',
      startDate: '2027-02-15',
      endDate: '2027-06-30',
      periods: JSON.parse(JSON.stringify(FALLBACK_PERIODS)),
      courses: [
        { id: 'c_sp_1', dayOfWeek: 1, period: 2, startTime: '09:05', endTime: '09:50', subject: '数学', className: '六(1)班', classroom: '致远楼 302' },
        { id: 'c_sp_2', dayOfWeek: 2, period: 1, startTime: '08:10', endTime: '08:55', subject: '数学', className: '六(2)班', classroom: '致远楼 304' },
        { id: 'c_sp_3', dayOfWeek: 3, period: 3, startTime: '10:15', endTime: '11:00', subject: '数学', className: '六(1)班', classroom: '致远楼 302' },
        { id: 'c_sp_4', dayOfWeek: 4, period: 1, startTime: '08:10', endTime: '08:55', subject: '数学', className: '六(1)班', classroom: '致远楼 302' },
        { id: 'c_sp_5', dayOfWeek: 5, period: 3, startTime: '10:15', endTime: '11:00', subject: '数学', className: '六(2)班', classroom: '致远楼 304' }
      ]
    }
  ];

  const FALLBACK_TODOS = [
    { id: 'todo_1', title: '批改六年级(1)班数学第一单元测试卷', dueDate: getRelativeDateStr(0), dueTime: '16:30', category: 'teaching', completed: false, completedAt: null, flagged: true, createdAt: getRelativeDateStr(-1) },
    { id: 'todo_2', title: '家长电话回访：与陈子涵父亲沟通春季过敏体质情况', dueDate: getRelativeDateStr(1), dueTime: '17:30', category: 'parent', completed: false, completedAt: null, flagged: true, createdAt: getRelativeDateStr(-1) },
    { id: 'todo_3', title: '参加数学学科组公开课教研磨课', dueDate: getRelativeDateStr(2), dueTime: '14:30', category: 'teaching', completed: false, completedAt: null, flagged: false, createdAt: getRelativeDateStr(-2) },
    { id: 'todo_4', title: '组织主题班会：班级干部换届选举与小组互助', dueDate: getRelativeDateStr(3), dueTime: '15:30', category: 'class', completed: false, completedAt: null, flagged: false, createdAt: getRelativeDateStr(-3) },
    { id: 'todo_5', title: '教研论文素材整理与个人年度进修学分申报', dueDate: getRelativeDateStr(6), dueTime: '18:00', category: 'personal', completed: false, completedAt: null, flagged: false, createdAt: getRelativeDateStr(-1) },
    { id: 'todo_6', title: '整理开学初视力筛查记录并完成前排座位微调', dueDate: getRelativeDateStr(-1), dueTime: '17:00', category: 'class', completed: true, completedAt: getRelativeDateStr(-1) + ' 16:45', flagged: false, createdAt: getRelativeDateStr(-4) }
  ];

  const FALLBACK_EVENTS = [
    { id: 'evt_1', title: '数学教研组常规周例会', date: getRelativeDateStr(1), startTime: '15:30', endTime: '16:45', type: 'meeting', location: '行政楼二楼会议室', notes: '讨论阶段性学情摸底与跨学科融合教学案', color: '#6366F1' },
    { id: 'evt_2', title: '大课间课间操值日巡查', date: getRelativeDateStr(3), startTime: '09:50', endTime: '10:15', type: 'duty', location: '东操场1号区', notes: '督促班级集合整队与做操纪律', color: '#F59E0B' },
    { id: 'evt_3', title: '年级家委会新学期交流会', date: getRelativeDateStr(6), startTime: '18:30', endTime: '20:00', type: 'activity', location: '致远楼 302', notes: '沟通本学期研学实践活动与家校共育计划', color: '#C5222F' }
  ];

  const FALLBACK_STUDENTS = [
    { "id": "202401", "name": "陈子涵", "gender": "男", "specialNotes": "芒果过敏", "contactName": "陈国强 (父亲)", "contactPhone": "13800138001" },
    { "id": "202402", "name": "李欣怡", "gender": "女", "specialNotes": "", "contactName": "李伟 (父亲)", "contactPhone": "13800138002" },
    { "id": "202403", "name": "张宇航", "gender": "男", "specialNotes": "近视/散光", "contactName": "张建华 (父亲)", "contactPhone": "13800138003" },
    { "id": "202404", "name": "王梓萌", "gender": "女", "specialNotes": "", "contactName": "王芳 (母亲)", "contactPhone": "13800138004" },
    { "id": "202405", "name": "刘浩轩", "gender": "男", "specialNotes": "", "contactName": "刘志刚 (父亲)", "contactPhone": "13800138005" },
    { "id": "202406", "name": "赵若曦", "gender": "女", "specialNotes": "轻度哮喘", "contactName": "王丽华 (母亲)", "contactPhone": "13800138006" },
    { "id": "202407", "name": "周嘉豪", "gender": "男", "specialNotes": "近视/散光", "contactName": "周敏 (母亲)", "contactPhone": "13800138007" },
    { "id": "202408", "name": "吴雨桐", "gender": "女", "specialNotes": "海鲜过敏", "contactName": "吴德明 (父亲)", "contactPhone": "13800138008" },
    { "id": "202409", "name": "郑博文", "gender": "男", "specialNotes": "", "contactName": "郑海 (父亲)", "contactPhone": "13800138009" },
    { "id": "202410", "name": "孙可馨", "gender": "女", "specialNotes": "近视/散光", "contactName": "孙海涛 (父亲)", "contactPhone": "13800138010" },
    { "id": "202411", "name": "杨明辉", "gender": "男", "specialNotes": "", "contactName": "杨军 (父亲)", "contactPhone": "13800138011" },
    { "id": "202412", "name": "黄思涵", "gender": "女", "specialNotes": "", "contactName": "黄小梅 (母亲)", "contactPhone": "13800138012" },
    { "id": "202413", "name": "林晨曦", "gender": "男", "specialNotes": "", "contactName": "林峰 (父亲)", "contactPhone": "13800138013" },
    { "id": "202414", "name": "何依诺", "gender": "女", "specialNotes": "", "contactName": "何建国 (父亲)", "contactPhone": "13800138014" },
    { "id": "202415", "name": "郭俊杰", "gender": "男", "specialNotes": "", "contactName": "郭亮 (父亲)", "contactPhone": "13800138015" },
    { "id": "202416", "name": "谢羽婷", "gender": "女", "specialNotes": "", "contactName": "谢玉兰 (母亲)", "contactPhone": "13800138016" },
    { "id": "202417", "name": "徐天佑", "gender": "男", "specialNotes": "", "contactName": "徐向东 (父亲)", "contactPhone": "13800138017" },
    { "id": "202418", "name": "宋芷柔", "gender": "女", "specialNotes": "", "contactName": "宋健 (父亲)", "contactPhone": "13800138018" },
    { "id": "202419", "name": "朱逸晨", "gender": "男", "specialNotes": "", "contactName": "朱永康 (父亲)", "contactPhone": "13800138019" },
    { "id": "202420", "name": "马艺涵", "gender": "女", "specialNotes": "", "contactName": "马晓峰 (父亲)", "contactPhone": "13800138020" },
    { "id": "202421", "name": "胡一诺", "gender": "男", "specialNotes": "", "contactName": "胡文博 (父亲)", "contactPhone": "13800138021" },
    { "id": "202422", "name": "高楚晴", "gender": "女", "specialNotes": "", "contactName": "高秀英 (母亲)", "contactPhone": "13800138022" },
    { "id": "202423", "name": "梁锦程", "gender": "男", "specialNotes": "", "contactName": "梁文华 (父亲)", "contactPhone": "13800138023" },
    { "id": "202424", "name": "韩佳琪", "gender": "女", "specialNotes": "", "contactName": "韩立民 (父亲)", "contactPhone": "13800138024" },
    { "id": "202425", "name": "唐泽宇", "gender": "男", "specialNotes": "", "contactName": "唐建平 (父亲)", "contactPhone": "13800138025" },
    { "id": "202426", "name": "冯安琪", "gender": "女", "specialNotes": "", "contactName": "冯志华 (父亲)", "contactPhone": "13800138026" },
    { "id": "202427", "name": "董若凡", "gender": "男", "specialNotes": "", "contactName": "董秀芳 (母亲)", "contactPhone": "13800138027" },
    { "id": "202428", "name": "程晓月", "gender": "女", "specialNotes": "", "contactName": "程志远 (父亲)", "contactPhone": "13800138028" },
    { "id": "202429", "name": "曹子安", "gender": "男", "specialNotes": "", "contactName": "曹红星 (父亲)", "contactPhone": "13800138029" },
    { "id": "202430", "name": "沈慕晴", "gender": "女", "specialNotes": "", "contactName": "沈万山 (父亲)", "contactPhone": "13800138030" }
  ];

  const FALLBACK_SEATING = { rows: 5, cols: 6, seats: FALLBACK_STUDENTS.map(s => s.id) };

  // ==================== LocalStorage 兜底存储工具 ====================
  function saveLocal(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  function getLocal(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // ==================== 内存缓存与监听 (全局持久单例) ====================
  const listeners = (global.__schooldb_listeners = global.__schooldb_listeners || new Set());

  const cache = (global.__schooldb_cache = global.__schooldb_cache || {
    students: [],
    seating: { rows: 5, cols: 6, seats: [] },
    rollcall: [],
    todos: [],
    events: [],
    timetables: [],
    selectedTimetableId: null,
    loaded: false
  });

  function syncAllToLocal() {
    saveLocal(STORAGE_KEY_STUDENTS, cache.students);
    saveLocal(STORAGE_KEY_SEATING, cache.seating);
    saveLocal(STORAGE_KEY_ROLLCALL, cache.rollcall);
    saveLocal(STORAGE_KEY_TODOS, cache.todos);
    saveLocal(STORAGE_KEY_EVENTS, cache.events);
    saveLocal(STORAGE_KEY_TIMETABLES, cache.timetables);
    saveLocal(STORAGE_KEY_SELECTED_TIMETABLE_ID, cache.selectedTimetableId);
  }

  function triggerUpdate(type, data) {
    const payload = { type, data, timestamp: Date.now() };
    listeners.forEach(fn => {
      try { fn(payload); } catch (err) { console.error('SchoolDB listener error:', err); }
    });
    window.dispatchEvent(new CustomEvent('schooldb:change', { detail: payload }));
  }

  function reportError(err) {
    console.warn('[SchoolDB] backend sync error (fallback to local):', err);
  }

  /** 安全调用后端 API：如果未定义 WorkbenchApi，则静默忽略，不抛出异常 */
  function callApi(method, ...args) {
    try {
      const api = global.WorkbenchApi;
      if (api && typeof api[method] === 'function') {
        const p = api[method](...args);
        if (p && typeof p.catch === 'function') {
          p.catch(reportError);
        }
        return p;
      }
    } catch (e) {
      reportError(e);
    }
    return Promise.resolve(null);
  }

  // ==================== 数据归一化 ====================
  function normalizeStudent(s) {
    return {
      id: String(s.id || s.studentNo || '').trim(),
      name: String(s.name || '').trim(),
      gender: s.gender === '女' ? '女' : '男',
      specialNotes: String(s.specialNotes || '').trim(),
      contactName: String(s.contactName || '').trim(),
      contactPhone: String(s.contactPhone || '').trim()
    };
  }

  function normalizeTodo(t) {
    return {
      id: String(t.id),
      title: String(t.title || '').trim(),
      notes: String(t.notes || '').trim(),
      dueDate: t.dueDate || '',
      dueTime: t.dueTime || '',
      category: t.category || '',
      completed: Boolean(t.completed),
      completedAt: t.completed ? (t.completedAt || new Date().toISOString()) : null,
      flagged: Boolean(t.flagged),
      createdAt: t.createdAt || new Date().toISOString()
    };
  }

  function normalizeEvent(e) {
    return {
      id: String(e.id),
      title: String(e.title || '').trim(),
      date: e.date || '',
      startTime: e.startTime || '',
      endTime: e.endTime || '',
      type: e.type || 'meeting',
      location: e.location || '',
      notes: e.notes || '',
      color: e.color || '#6366F1'
    };
  }

  function normalizeTimetable(t) {
    return {
      id: String(t.id),
      name: String(t.name || '').trim(),
      startDate: t.startDate || '',
      endDate: t.endDate || '',
      periods: Array.isArray(t.periods) ? t.periods.map(p => ({
        period: Number(p.period) || 1,
        name: String(p.name || '').trim(),
        startTime: p.startTime || '',
        endTime: p.endTime || ''
      })) : [],
      courses: Array.isArray(t.courses) ? t.courses.map(c => ({
        id: String(c.id),
        dayOfWeek: Number(c.dayOfWeek) || 1,
        period: Number(c.period) || 1,
        startTime: c.startTime || '',
        endTime: c.endTime || '',
        subject: String(c.subject || '').trim(),
        className: String(c.className || '').trim(),
        classroom: String(c.classroom || '').trim(),
        color: c.color || '#C5222F'
      })) : []
    };
  }

  // ==================== 数据加载（双模自适应） ====================
  async function loadAll() {
    const api = global.WorkbenchApi;
    let backendSuccess = false;

    if (api && typeof api.listStudents === 'function') {
      try {
        const [students, seating, rollcall, todos, events, timetables, selected] = await Promise.all([
          api.listStudents(),
          api.getSeating(),
          api.listRollcall(),
          api.listTodos(),
          api.listEvents(),
          api.listTimetables(),
          api.getSelectedTimetable()
        ]);
        cache.students = (students || []).map(normalizeStudent);
        cache.seating = seating && typeof seating === 'object'
          ? { rows: Number(seating.rows) || 5, cols: Number(seating.cols) || 6, seats: Array.isArray(seating.seats) ? seating.seats.map(String) : [] }
          : { rows: 5, cols: 6, seats: [] };
        cache.rollcall = (rollcall || []).map(r => ({ id: String(r.id || ''), name: String(r.name || ''), time: String(r.time || ''), sessionId: String(r.sessionId || ''), createdAt: Number(r.createdAt) || 0 }));
        cache.todos = (todos || []).map(normalizeTodo);
        cache.events = (events || []).map(normalizeEvent);
        cache.timetables = (timetables || []).map(normalizeTimetable);
        cache.selectedTimetableId = selected && selected.id ? String(selected.id) : (cache.timetables[0] ? cache.timetables[0].id : null);
        syncAllToLocal();
        backendSuccess = true;
      } catch (err) {
        console.warn('[SchoolDB] 后端服务未连接或请求失败，自动切换为本地 localStorage 模式:', err);
      }
    }

    if (!backendSuccess) {
      // 本地模式：读取 localStorage，如无则使用默认初始模拟数据
      const localStudents = getLocal(STORAGE_KEY_STUDENTS);
      const localSeating = getLocal(STORAGE_KEY_SEATING);
      const localRollcall = getLocal(STORAGE_KEY_ROLLCALL);
      const localTodos = getLocal(STORAGE_KEY_TODOS);
      const localEvents = getLocal(STORAGE_KEY_EVENTS);
      const localTimetables = getLocal(STORAGE_KEY_TIMETABLES);
      const localSelectedTimetableId = getLocal(STORAGE_KEY_SELECTED_TIMETABLE_ID);

      cache.students = localStudents !== null ? (localStudents || []).map(normalizeStudent) : FALLBACK_STUDENTS.map(normalizeStudent);
      cache.seating = localSeating !== null && typeof localSeating === 'object'
        ? { rows: Number(localSeating.rows) || 5, cols: Number(localSeating.cols) || 6, seats: Array.isArray(localSeating.seats) ? localSeating.seats.map(String) : [] }
        : { rows: FALLBACK_SEATING.rows, cols: FALLBACK_SEATING.cols, seats: FALLBACK_SEATING.seats.map(String) };
      cache.rollcall = localRollcall !== null ? (localRollcall || []).map(r => ({ id: String(r.id || ''), name: String(r.name || ''), time: String(r.time || ''), sessionId: String(r.sessionId || ''), createdAt: Number(r.createdAt) || 0 })) : [];
      cache.todos = localTodos !== null ? (localTodos || []).map(normalizeTodo) : FALLBACK_TODOS.map(normalizeTodo);
      cache.events = localEvents !== null ? (localEvents || []).map(normalizeEvent) : FALLBACK_EVENTS.map(normalizeEvent);
      cache.timetables = localTimetables !== null ? (localTimetables || []).map(normalizeTimetable) : FALLBACK_TIMETABLES.map(normalizeTimetable);
      cache.selectedTimetableId = localSelectedTimetableId !== null ? localSelectedTimetableId : (cache.timetables[0] ? cache.timetables[0].id : 'tt_2026_autumn');

      syncAllToLocal();
    }

    cache.loaded = true;
    triggerUpdate('db_loaded', null);
  }

  // ==================== SchoolDB ====================
  const SchoolDB = {
    onUpdate(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },

    ready() {
      return cache.loaded;
    },

    // ========== 学生花名册 ==========
    getStudents() {
      return cache.students.map(s => ({ ...s }));
    },

    saveStudents(students, shouldTrigger = true) {
      cache.students = (students || []).map(normalizeStudent);
      saveLocal(STORAGE_KEY_STUDENTS, cache.students);
      this.getSeating();
      if (shouldTrigger) {
        triggerUpdate('students_updated', cache.students);
      }
      callApi('batchStudents', 'replace', cache.students);
    },

    addStudent(student) {
      const list = cache.students;
      const exists = list.some(s => String(s.id).trim() === String(student.id).trim());
      if (exists) {
        throw new Error(`学号 ${student.id} 已存在，不能重复添加`);
      }
      const newStudent = normalizeStudent(student);
      list.push(newStudent);
      saveLocal(STORAGE_KEY_STUDENTS, list);
      const seating = this.getSeating();
      triggerUpdate('students_updated', list);
      callApi('addStudent', newStudent);

      const seatArr = Array.isArray(seating.seats) ? [...seating.seats] : [];
      if (!seatArr.includes(newStudent.id)) {
        const emptyIdx = seatArr.indexOf('');
        if (emptyIdx !== -1) {
          seatArr[emptyIdx] = newStudent.id;
          seating.seats = seatArr;
          this.saveSeating(seating);
        }
      }
    },

    updateStudent(oldId, newStudent) {
      const list = cache.students;
      const index = list.findIndex(s => String(s.id) === String(oldId));
      if (index === -1) {
        throw new Error(`未找到原学号为 ${oldId} 的学生`);
      }
      const newId = String(newStudent.id).trim();
      if (newId !== String(oldId) && list.some(s => String(s.id) === newId)) {
        throw new Error(`新学号 ${newId} 已被其他学生占用`);
      }
      list[index] = normalizeStudent(newStudent);
      saveLocal(STORAGE_KEY_STUDENTS, list);
      triggerUpdate('students_updated', list);
      callApi('updateStudent', oldId, list[index]);

      if (String(oldId) !== newId) {
        const seating = cache.seating;
        let changed = false;
        seating.seats = seating.seats.map(seatId => {
          if (String(seatId) === String(oldId)) {
            changed = true;
            return newId;
          }
          return seatId;
        });
        if (changed) {
          this.saveSeating(seating);
        }
      }
    },

    deleteStudent(studentId) {
      const idStr = String(studentId).trim();
      cache.students = cache.students.filter(s => String(s.id) !== idStr);
      saveLocal(STORAGE_KEY_STUDENTS, cache.students);
      triggerUpdate('students_updated', cache.students);
      callApi('deleteStudent', idStr);

      const seating = cache.seating;
      let changed = false;
      seating.seats = seating.seats.map(seatId => {
        if (String(seatId) === idStr) {
          changed = true;
          return '';
        }
        return seatId;
      });
      if (changed) {
        this.saveSeating(seating);
      }
    },

    validateStudents(rawList) {
      if (!Array.isArray(rawList) || rawList.length === 0) {
        throw new Error('导入文件未包含有效数据行，请检查表格内容');
      }
      const validRows = rawList.map((item, idx) => ({ item, origRow: idx + 2 }))
        .filter(({ item }) => {
          if (!item || typeof item !== 'object') return false;
          return Object.values(item).some(val => val !== null && val !== undefined && String(val).trim() !== '');
        });
      if (validRows.length === 0) {
        throw new Error('导入表格中所有行均为空白，请填入学生信息后再导入');
      }
      const errors = [];
      const seenIds = new Map();
      const formatted = [];
      validRows.forEach(({ item, origRow }) => {
        const rawId = item.id !== undefined ? item.id : (item['学号'] !== undefined ? item['学号'] : (item['ID'] !== undefined ? item['ID'] : ''));
        const id = String(rawId !== null && rawId !== undefined ? rawId : '').trim();
        const rawName = item.name !== undefined ? item.name : (item['姓名'] !== undefined ? item['姓名'] : (item['名字'] !== undefined ? item['名字'] : ''));
        const name = String(rawName !== null && rawName !== undefined ? rawName : '').trim();
        const rawGender = item.gender !== undefined ? item.gender : (item['性别'] !== undefined ? item['性别'] : '');
        const gender = String(rawGender !== null && rawGender !== undefined ? rawGender : '').trim();
        const rowLabel = name ? `第 ${origRow} 行（${name}）` : `第 ${origRow} 行`;
        if (!id) {
          errors.push(`${rowLabel} 缺失【学号】`);
        } else if (seenIds.has(id)) {
          errors.push(`第 ${origRow} 行与第 ${seenIds.get(id)} 行学号重复（学号：${id}）`);
        } else {
          seenIds.set(id, origRow);
        }
        if (!name) {
          errors.push(`第 ${origRow} 行 缺失【姓名】`);
        }
        if (!gender) {
          errors.push(`${rowLabel} 缺失【性别】（必填项：需填“男”或“女”）`);
        } else if (gender !== '男' && gender !== '女') {
          errors.push(`${rowLabel} 性别“${gender}”不合规（只能填写“男”或“女”）`);
        }
        const specialNotesKey = Object.keys(item).find(k => k.includes('关照备注') || k.includes('特殊情况') || k.includes('健康') || k.includes('身体状况') || k.includes('过敏') || k.includes('疾病') || k === '备注' || k === 'specialNotes');
        const specialNotes = String(item.specialNotes || (specialNotesKey ? item[specialNotesKey] : '') || item['特殊情况'] || item['过敏'] || item['疾病'] || item['健康情况'] || item['身体状况'] || item['备注'] || item['关照备注'] || '').trim();
        const contactName = String(item.contactName || item.guardian || item.parent || item['紧急联系人'] || item['联系人'] || item['监护人'] || item['家长'] || '').trim();
        const contactPhone = String(item.contactPhone || item.phone || item['紧急联系人电话'] || item['联系电话'] || item['手机号'] || item['电话'] || '').trim();
        formatted.push({ id, name, gender, specialNotes, contactName, contactPhone });
      });
      if (errors.length > 0) {
        const errorDetail = errors.length > 8
          ? errors.slice(0, 8).map(e => `• ${e}`).join('\n') + `\n...等共 ${errors.length} 处格式错误`
          : errors.map(e => `• ${e}`).join('\n');
        const err = new Error(`表格数据校验未通过，发现以下问题：\n\n${errorDetail}\n\n请修改 Excel 对应内容后重新上传。`);
        err.errorList = errors;
        throw err;
      }
      return formatted;
    },

    importStudents(newStudents, mode = 'append') {
      const formatted = this.validateStudents(newStudents);
      if (mode === 'replace') {
        cache.students = formatted.map(normalizeStudent);
        saveLocal(STORAGE_KEY_STUDENTS, cache.students);
        const seating = this.getSeating();
        const total = seating.rows * seating.cols;
        const newSeats = new Array(total).fill('');
        for (let i = 0; i < Math.min(formatted.length, total); i++) {
          newSeats[i] = String(formatted[i].id);
        }
        seating.seats = newSeats;
        this.saveSeating(seating);
      } else {
        const map = new Map(cache.students.map(s => [String(s.id), s]));
        formatted.forEach(s => map.set(String(s.id), normalizeStudent(s)));
        cache.students = Array.from(map.values());
        saveLocal(STORAGE_KEY_STUDENTS, cache.students);
        const seating = this.getSeating();
        const seatArr = Array.isArray(seating.seats) ? [...seating.seats] : [];
        const seatedSet = new Set(seatArr.filter(Boolean).map(String));
        formatted.forEach(s => {
          if (!seatedSet.has(String(s.id))) {
            const emptyIdx = seatArr.indexOf('');
            if (emptyIdx !== -1) {
              seatArr[emptyIdx] = String(s.id);
              seatedSet.add(String(s.id));
            }
          }
        });
        seating.seats = seatArr;
        this.saveSeating(seating);
      }
      triggerUpdate('students_updated', cache.students);
      callApi('batchStudents', mode, formatted.map(normalizeStudent));
      return formatted;
    },

    // ========== 座位 ==========
    getSeating() {
      const config = cache.seating;
      if (!cache.loaded) {
        return config;
      }
      const students = cache.students;
      const studentCount = students.length;
      const validStudentIds = new Set(students.map(s => String(s.id)));
      let changed = false;

      if (studentCount > config.rows * config.cols) {
        let cols = config.cols || 6;
        let rows = Math.max(config.rows || 5, Math.ceil(studentCount / cols));
        if (rows > 20) {
          cols = Math.min(20, Math.ceil(studentCount / 20));
          rows = Math.min(20, Math.ceil(studentCount / cols));
        }
        config.rows = rows;
        config.cols = cols;
        changed = true;
      }

      const totalSeats = config.rows * config.cols;
      let seats = Array.isArray(config.seats) ? [...config.seats] : [];
      if (seats.length < totalSeats) {
        seats = seats.concat(new Array(totalSeats - seats.length).fill(''));
        changed = true;
      } else if (seats.length > totalSeats) {
        seats = seats.slice(0, totalSeats);
        changed = true;
      }

      for (let i = 0; i < seats.length; i++) {
        if (seats[i] && !validStudentIds.has(String(seats[i]))) {
          seats[i] = '';
          changed = true;
        }
      }

      config.seats = seats;
      if (changed) {
        saveLocal(STORAGE_KEY_SEATING, config);
        callApi('saveSeating', config);
      }
      return config;
    },

    saveSeating(seatingConfig, shouldTrigger = true) {
      const rows = Number(seatingConfig.rows) || 5;
      const cols = Number(seatingConfig.cols) || 6;
      const totalSeats = rows * cols;
      let seats = seatingConfig.seats || [];
      if (seats.length < totalSeats) {
        seats = seats.concat(new Array(totalSeats - seats.length).fill(''));
      } else if (seats.length > totalSeats) {
        seats = seats.slice(0, totalSeats);
      }
      const payload = { rows, cols, seats: seats.map(String) };
      cache.seating = payload;
      saveLocal(STORAGE_KEY_SEATING, payload);
      if (shouldTrigger) {
        triggerUpdate('seating_updated', payload);
      }
      callApi('saveSeating', payload);
    },

    // ========== 待办 ==========
    getTodos() {
      return cache.todos.map(t => ({ ...t }));
    },

    saveTodos(todos, shouldTrigger = true) {
      cache.todos = (todos || []).map(normalizeTodo);
      saveLocal(STORAGE_KEY_TODOS, cache.todos);
      if (shouldTrigger) {
        triggerUpdate('todos_updated', cache.todos);
      }
      callApi('batchTodos', 'replace', cache.todos);
    },

    addTodo(todo) {
      const newTodo = {
        id: todo.id || `todo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: String(todo.title || '').trim(),
        notes: String(todo.notes || '').trim(),
        dueDate: String(todo.dueDate || '').trim(),
        dueTime: String(todo.dueTime || '').trim(),
        category: String(todo.category || '').trim(),
        completed: Boolean(todo.completed),
        completedAt: todo.completed ? (todo.completedAt || new Date().toISOString()) : null,
        flagged: Boolean(todo.flagged),
        createdAt: todo.createdAt || new Date().toISOString()
      };
      if (!newTodo.title) {
        throw new Error('待办事项内容不能为空');
      }
      cache.todos.unshift(newTodo);
      saveLocal(STORAGE_KEY_TODOS, cache.todos);
      triggerUpdate('todos_updated', cache.todos);
      callApi('addTodo', newTodo);
      return newTodo;
    },

    updateTodo(id, updates) {
      const idx = cache.todos.findIndex(t => String(t.id) === String(id));
      if (idx === -1) throw new Error('未找到该待办事项');
      const current = cache.todos[idx];
      const nextCompleted = updates.completed !== undefined ? Boolean(updates.completed) : current.completed;
      let completedAt = current.completedAt;
      if (nextCompleted && !current.completed) {
        completedAt = new Date().toISOString();
      } else if (!nextCompleted) {
        completedAt = null;
      }
      cache.todos[idx] = { ...current, ...updates, completed: nextCompleted, completedAt };
      saveLocal(STORAGE_KEY_TODOS, cache.todos);
      triggerUpdate('todos_updated', cache.todos);
      callApi('updateTodo', id, cache.todos[idx]);
      return cache.todos[idx];
    },

    toggleTodo(id) {
      const target = cache.todos.find(t => String(t.id) === String(id));
      if (!target) return;
      return this.updateTodo(id, { completed: !target.completed });
    },

    toggleFlagTodo(id) {
      const target = cache.todos.find(t => String(t.id) === String(id));
      if (!target) return;
      return this.updateTodo(id, { flagged: !target.flagged });
    },

    deleteTodo(id) {
      cache.todos = cache.todos.filter(t => String(t.id) !== String(id));
      saveLocal(STORAGE_KEY_TODOS, cache.todos);
      triggerUpdate('todos_updated', cache.todos);
      callApi('deleteTodo', id);
    },

    validateTodos(rawList) {
      if (!Array.isArray(rawList) || rawList.length === 0) {
        throw new Error('导入文件未包含有效数据行，请检查表格内容');
      }
      const validRows = rawList.map((item, idx) => ({ item, origRow: idx + 2 }))
        .filter(({ item }) => {
          if (!item || typeof item !== 'object') return false;
          return Object.values(item).some(val => val !== null && val !== undefined && String(val).trim() !== '');
        });
      if (validRows.length === 0) {
        throw new Error('导入表格中所有行均为空白，请填入待办事项后再导入');
      }
      const mapCategory = (val) => {
        const s = String(val || '').trim();
        if (s.includes('备课') || s.includes('教学')) return 'teaching';
        if (s.includes('班级')) return 'class';
        if (s.includes('家校') || s.includes('家长')) return 'parent';
        if (s.includes('行政') || s.includes('事务')) return 'admin';
        if (s.includes('个人')) return 'personal';
        return ['teaching', 'class', 'parent', 'admin', 'personal'].includes(s) ? s : '';
      };
      const mapFlagged = (val) => {
        const s = String(val || '').trim().toLowerCase();
        return s === '是' || s === 'true' || s === '1' || s.includes('旗标') || s.includes('星');
      };
      const mapCompleted = (val) => {
        const s = String(val || '').trim().toLowerCase();
        return s === '已完成' || s === '是' || s === 'true' || s === '1';
      };
      const errors = [];
      const formatted = [];
      validRows.forEach(({ item, origRow }, idx) => {
        const rawTitle = item.title !== undefined ? item.title : (item['待办内容'] !== undefined ? item['待办内容'] : (item['待办事项'] !== undefined ? item['待办事项'] : (item['内容'] !== undefined ? item['内容'] : (item['标题'] !== undefined ? item['标题'] : (item['任务'] !== undefined ? item['任务'] : '')))));
        const title = String(rawTitle !== null && rawTitle !== undefined ? rawTitle : '').trim();
        if (!title) {
          errors.push(`第 ${origRow} 行 缺失【待办内容】（必填项）`);
        }
        const dueDate = String(item.dueDate || item['截止日期'] || item['日期'] || item['到期日'] || '').trim();
        const dueTime = String(item.dueTime || item['截止时间'] || item['时间'] || '').trim();
        const category = mapCategory(item.category || item['工作分类'] || item['分类'] || item['所属分类']);
        const flagged = mapFlagged(item.flagged || item['设为旗标'] || item['是否设为旗标'] || item['旗标'] || item['是否旗标'] || item['标星']);
        const completed = mapCompleted(item.completed || item['状态'] || item['是否完成']);
        formatted.push({
          id: `todo_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
          title,
          notes: '',
          dueDate,
          dueTime,
          category,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
          flagged,
          createdAt: new Date().toISOString()
        });
      });
      if (errors.length > 0) {
        const errorDetail = errors.length > 8
          ? errors.slice(0, 8).map(e => `• ${e}`).join('\n') + `\n...等共 ${errors.length} 处格式错误`
          : errors.map(e => `• ${e}`).join('\n');
        const err = new Error(`表格数据校验未通过，发现以下问题：\n\n${errorDetail}\n\n请修改 Excel 对应内容后重新上传。`);
        err.errorList = errors;
        throw err;
      }
      return formatted;
    },

    importTodos(newTodos, mode = 'append') {
      const formatted = this.validateTodos(newTodos);
      if (mode === 'replace') {
        cache.todos = formatted.map(normalizeTodo);
      } else {
        cache.todos = [...formatted.map(normalizeTodo), ...cache.todos];
      }
      saveLocal(STORAGE_KEY_TODOS, cache.todos);
      triggerUpdate('todos_updated', cache.todos);
      callApi('batchTodos', mode, formatted.map(normalizeTodo));
      return formatted;
    },

    // ========== 学期课表 ==========
    getTimetables() {
      return cache.timetables.map(t => ({
        ...t,
        periods: t.periods.map(p => ({ ...p })),
        courses: t.courses.map(c => ({ ...c }))
      }));
    },

    saveTimetables(timetables, shouldTrigger = true) {
      cache.timetables = (timetables || []).map(normalizeTimetable);
      saveLocal(STORAGE_KEY_TIMETABLES, cache.timetables);
      if (shouldTrigger) {
        triggerUpdate('timetables_updated', cache.timetables);
        triggerUpdate('courses_updated', this.getCourses());
        triggerUpdate('periods_updated', this.getPeriods());
      }
      callApi('batchTimetables', 'replace', cache.timetables);
    },

    getSelectedTimetableId() {
      const timetables = cache.timetables;
      if (cache.selectedTimetableId && timetables.some(t => t.id === cache.selectedTimetableId)) {
        return cache.selectedTimetableId;
      }
      const defaultId = timetables[0] ? timetables[0].id : null;
      cache.selectedTimetableId = defaultId;
      saveLocal(STORAGE_KEY_SELECTED_TIMETABLE_ID, defaultId);
      if (defaultId) {
        callApi('setSelectedTimetable', defaultId);
      }
      return defaultId;
    },

    setSelectedTimetableId(id, shouldTrigger = true) {
      cache.selectedTimetableId = id;
      saveLocal(STORAGE_KEY_SELECTED_TIMETABLE_ID, id);
      if (shouldTrigger) {
        triggerUpdate('selected_timetable_changed', { selectedId: id });
        triggerUpdate('courses_updated', this.getCourses(id));
        triggerUpdate('periods_updated', this.getPeriods(id));
      }
      callApi('setSelectedTimetable', id);
    },

    getTimetableById(id) {
      if (!id) return cache.timetables[0] || null;
      return cache.timetables.find(t => t.id === id) || null;
    },

    getTimetableForDate(dateStr) {
      if (!dateStr) return null;
      return cache.timetables.find(t => {
        if (!t.startDate || !t.endDate) return false;
        return dateStr >= t.startDate && dateStr <= t.endDate;
      }) || null;
    },

    addTimetable({ name, startDate, endDate, copyFromId, isBlank = false }) {
      const newId = `tt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      let periods = JSON.parse(JSON.stringify(FALLBACK_PERIODS));
      let courses = [];
      if (!isBlank && copyFromId) {
        const source = cache.timetables.find(t => t.id === copyFromId);
        if (source) {
          periods = JSON.parse(JSON.stringify(source.periods || FALLBACK_PERIODS));
          courses = JSON.parse(JSON.stringify(source.courses || [])).map(c => ({
            ...c,
            id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
          }));
        }
      }
      const newTimetable = {
        id: newId,
        name: String(name || '新学期课程表').trim(),
        startDate: String(startDate || '2026-09-01').trim(),
        endDate: String(endDate || '2027-01-31').trim(),
        periods,
        courses
      };
      cache.timetables.push(newTimetable);
      saveLocal(STORAGE_KEY_TIMETABLES, cache.timetables);
      triggerUpdate('timetables_updated', cache.timetables);
      callApi('addTimetable', newTimetable);
      this.setSelectedTimetableId(newId);
      return newTimetable;
    },

    updateTimetable(id, updates) {
      const idx = cache.timetables.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('未找到该学期课表');
      cache.timetables[idx] = normalizeTimetable({ ...cache.timetables[idx], ...updates });
      saveLocal(STORAGE_KEY_TIMETABLES, cache.timetables);
      triggerUpdate('timetables_updated', cache.timetables);
      triggerUpdate('courses_updated', this.getCourses());
      triggerUpdate('periods_updated', this.getPeriods());
      callApi('updateTimetable', id, cache.timetables[idx]);
      return cache.timetables[idx];
    },

    deleteTimetable(id) {
      cache.timetables = cache.timetables.filter(t => t.id !== id);
      saveLocal(STORAGE_KEY_TIMETABLES, cache.timetables);
      if (cache.selectedTimetableId === id) {
        const nextId = cache.timetables[0] ? cache.timetables[0].id : null;
        this.setSelectedTimetableId(nextId, false);
      }
      triggerUpdate('timetables_updated', cache.timetables);
      triggerUpdate('courses_updated', this.getCourses());
      triggerUpdate('periods_updated', this.getPeriods());
      callApi('deleteTimetable', id);
    },

    getPeriods(timetableId = null) {
      const targetId = timetableId || this.getSelectedTimetableId();
      const tt = this.getTimetableById(targetId);
      if (tt && Array.isArray(tt.periods) && tt.periods.length > 0) {
        return tt.periods.sort((a, b) => (Number(a.period) || 0) - (Number(b.period) || 0));
      }
      return JSON.parse(JSON.stringify(FALLBACK_PERIODS));
    },

    savePeriods(periods, shouldTrigger = true, timetableId = null) {
      const targetId = timetableId || this.getSelectedTimetableId();
      const sorted = (periods || []).sort((a, b) => (Number(a.period) || 0) - (Number(b.period) || 0));
      const tt = this.getTimetableById(targetId);
      if (tt) {
        tt.periods = sorted;
        this.updateTimetable(targetId, { periods: sorted });
      }
    },

    addPeriod(periodData, timetableId = null) {
      const targetId = timetableId || this.getSelectedTimetableId();
      const periods = this.getPeriods(targetId);
      const nextPeriodNum = periods.length > 0 ? Math.max(...periods.map(p => Number(p.period) || 0)) + 1 : 1;
      const newPeriod = {
        period: Number(periodData.period) || nextPeriodNum,
        name: String(periodData.name || `第${nextPeriodNum}节`).trim(),
        startTime: String(periodData.startTime || '18:00').trim(),
        endTime: String(periodData.endTime || '18:45').trim()
      };
      periods.push(newPeriod);
      this.savePeriods(periods, true, targetId);
      return newPeriod;
    },

    updatePeriod(periodNum, updates, timetableId = null) {
      const targetId = timetableId || this.getSelectedTimetableId();
      const periods = this.getPeriods(targetId);
      const idx = periods.findIndex(p => Number(p.period) === Number(periodNum));
      if (idx === -1) throw new Error('未找到该节次');
      periods[idx] = { ...periods[idx], ...updates };
      this.savePeriods(periods, true, targetId);
      if (updates.startTime || updates.endTime) {
        const courses = this.getCourses(targetId);
        let changed = false;
        courses.forEach(c => {
          if (Number(c.period) === Number(periodNum)) {
            if (updates.startTime) c.startTime = updates.startTime;
            if (updates.endTime) c.endTime = updates.endTime;
            changed = true;
          }
        });
        if (changed) this.saveCourses(courses, true, targetId);
      }
      return periods[idx];
    },

    deletePeriod(periodNum, timetableId = null) {
      const targetId = timetableId || this.getSelectedTimetableId();
      let periods = this.getPeriods(targetId);
      if (periods.length <= 1) {
        throw new Error('至少需要保留一个课节，无法全部删除');
      }

      const num = Number(periodNum);
      const filtered = periods.filter(p => Number(p.period) !== num)
                              .sort((a, b) => (Number(a.period) || 0) - (Number(b.period) || 0));

      // 建立新旧节次映射，并重排序号保持连续
      const periodMapping = {};
      const reorderedPeriods = filtered.map((p, idx) => {
        const oldNum = Number(p.period);
        const newNum = idx + 1;
        periodMapping[oldNum] = newNum;
        return {
          ...p,
          period: newNum,
          name: `第${newNum}节`
        };
      });

      // 清理已删除节次的排课，并同步剩余排课的节次编号
      let courses = this.getCourses(targetId)
        .filter(c => Number(c.period) !== num)
        .map(c => {
          const oldP = Number(c.period);
          const newP = periodMapping[oldP] || oldP;
          const matchPeriod = reorderedPeriods.find(p => p.period === newP);
          return {
            ...c,
            period: newP,
            startTime: matchPeriod ? matchPeriod.startTime : c.startTime,
            endTime: matchPeriod ? matchPeriod.endTime : c.endTime
          };
        });

      this.savePeriods(reorderedPeriods, true, targetId);
      this.saveCourses(courses, true, targetId);
    },

    getCourses(timetableId = null) {
      const targetId = timetableId || this.getSelectedTimetableId();
      const tt = this.getTimetableById(targetId);
      if (tt && Array.isArray(tt.courses)) {
        return tt.courses;
      }
      return [];
    },

    saveCourses(courses, shouldTrigger = true, timetableId = null) {
      const targetId = timetableId || this.getSelectedTimetableId();
      const tt = this.getTimetableById(targetId);
      if (tt) {
        tt.courses = courses || [];
        this.updateTimetable(targetId, { courses: tt.courses });
      }
    },

    addCourse(course, timetableId = null) {
      const targetId = timetableId || this.getSelectedTimetableId();
      const courses = this.getCourses(targetId);
      const periods = this.getPeriods(targetId);
      const matchPeriod = periods.find(p => Number(p.period) === Number(course.period));
      const item = {
        id: course.id || `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        dayOfWeek: Number(course.dayOfWeek) || 1,
        period: Number(course.period) || 1,
        startTime: String(course.startTime || (matchPeriod ? matchPeriod.startTime : '08:00')).trim(),
        endTime: String(course.endTime || (matchPeriod ? matchPeriod.endTime : '08:45')).trim(),
        subject: String(course.subject || '').trim(),
        className: String(course.className || '').trim(),
        classroom: String(course.classroom || '').trim(),
        color: String(course.color || '#C5222F').trim()
      };
      courses.push(item);
      this.saveCourses(courses, true, targetId);
      return item;
    },

    updateCourse(id, updates, timetableId = null) {
      const targetId = timetableId || this.getSelectedTimetableId();
      const courses = this.getCourses(targetId);
      const idx = courses.findIndex(c => String(c.id) === String(id));
      if (idx === -1) throw new Error('未找到该排课');
      if (updates.period && (!updates.startTime || !updates.endTime)) {
        const periods = this.getPeriods(targetId);
        const matchPeriod = periods.find(p => Number(p.period) === Number(updates.period));
        if (matchPeriod) {
          updates.startTime = updates.startTime || matchPeriod.startTime;
          updates.endTime = updates.endTime || matchPeriod.endTime;
        }
      }
      courses[idx] = { ...courses[idx], ...updates };
      this.saveCourses(courses, true, targetId);
      return courses[idx];
    },

    deleteCourse(id, timetableId = null) {
      const targetId = timetableId || this.getSelectedTimetableId();
      let courses = this.getCourses(targetId);
      courses = courses.filter(c => String(c.id) !== String(id));
      this.saveCourses(courses, true, targetId);
    },

    // ========== 日程事件 ==========
    getEvents() {
      return cache.events.map(e => ({ ...e }));
    },

    saveEvents(events, shouldTrigger = true) {
      cache.events = (events || []).map(normalizeEvent);
      saveLocal(STORAGE_KEY_EVENTS, cache.events);
      if (shouldTrigger) {
        triggerUpdate('events_updated', cache.events);
      }
      callApi('batchEvents', 'replace', cache.events);
    },

    addEvent(event) {
      const item = {
        id: event.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: String(event.title || '').trim(),
        date: String(event.date || '').trim(),
        startTime: String(event.startTime || '').trim(),
        endTime: String(event.endTime || '').trim(),
        type: event.type || 'meeting',
        location: String(event.location || '').trim(),
        notes: String(event.notes || '').trim(),
        color: String(event.color || '#6366F1').trim()
      };
      if (!item.title || !item.date) {
        throw new Error('日程标题与日期不能为空');
      }
      cache.events.push(item);
      saveLocal(STORAGE_KEY_EVENTS, cache.events);
      triggerUpdate('events_updated', cache.events);
      callApi('addEvent', item);
      return item;
    },

    updateEvent(id, updates) {
      const idx = cache.events.findIndex(e => String(e.id) === String(id));
      if (idx === -1) throw new Error('未找到该日程');
      cache.events[idx] = normalizeEvent({ ...cache.events[idx], ...updates });
      saveLocal(STORAGE_KEY_EVENTS, cache.events);
      triggerUpdate('events_updated', cache.events);
      callApi('updateEvent', id, cache.events[idx]);
      return cache.events[idx];
    },

    deleteEvent(id) {
      cache.events = cache.events.filter(e => String(e.id) !== String(id));
      saveLocal(STORAGE_KEY_EVENTS, cache.events);
      triggerUpdate('events_updated', cache.events);
      callApi('deleteEvent', id);
    },

    // ========== 日程聚合 ==========
    getScheduleForDate(dateStr) {
      if (!dateStr) return { courses: [], events: [], todos: [] };
      const [year, month, day] = dateStr.split('-').map(Number);
      const targetDate = new Date(year, month - 1, day);
      const rawDay = targetDate.getDay();
      const dayOfWeek = rawDay === 0 ? 7 : rawDay;

      const matchedTimetable = this.getTimetableForDate(dateStr);
      let courses = [];
      if (matchedTimetable && Array.isArray(matchedTimetable.courses)) {
        courses = matchedTimetable.courses.filter(c => Number(c.dayOfWeek) === dayOfWeek);
        courses.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      }

      const events = this.getEvents().filter(e => e.date === dateStr);
      events.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

      const todos = this.getTodos().filter(t => t.dueDate === dateStr);
      todos.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (a.dueTime || '99:99').localeCompare(b.dueTime || '99:99');
      });

      return { date: dateStr, dayOfWeek, timetable: matchedTimetable, courses, events, todos };
    },

    // ========== 点名历史 ==========
    getRollCallHistory() {
      return cache.rollcall.map(r => ({ ...r }));
    },

    addRollCallRecord(records) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const nowTs = now.getTime();
      const newItems = (Array.isArray(records) ? records : [records]).map((r, idx) => ({
        id: String(r.id || ''),
        name: String(r.name || ''),
        time: r.time || timeStr,
        sessionId: String(r.sessionId || ''),
        createdAt: Number(r.createdAt) || (nowTs + idx)
      }));
      cache.rollcall = [...newItems, ...cache.rollcall].slice(0, 50);
      saveLocal(STORAGE_KEY_ROLLCALL, cache.rollcall);
      triggerUpdate('history_updated', cache.rollcall);
      callApi('addRollcall', newItems);
    },

    clearRollCallHistory() {
      cache.rollcall = [];
      saveLocal(STORAGE_KEY_ROLLCALL, cache.rollcall);
      triggerUpdate('history_cleared', []);
      callApi('clearRollcall');
    },

    // ========== 数据重置与模拟数据 ==========
    resetToDefault() {
      return this.loadMockData();
    },

    loadMockData() {
      const students = FALLBACK_STUDENTS.map(normalizeStudent);
      const todos = FALLBACK_TODOS.map(normalizeTodo);
      const events = FALLBACK_EVENTS.map(normalizeEvent);
      const timetables = FALLBACK_TIMETABLES.map(normalizeTimetable);
      const seating = { rows: FALLBACK_SEATING.rows, cols: FALLBACK_SEATING.cols, seats: FALLBACK_SEATING.seats.map(String) };

      cache.students = students;
      cache.seating = seating;
      cache.todos = todos;
      cache.events = events;
      cache.timetables = timetables;
      cache.rollcall = [];
      cache.selectedTimetableId = timetables[0] ? timetables[0].id : null;

      syncAllToLocal();

      callApi('batchStudents', 'replace', students);
      callApi('saveSeating', seating);
      callApi('batchTodos', 'replace', todos);
      callApi('batchEvents', 'replace', events);
      callApi('batchTimetables', 'replace', timetables);
      callApi('clearRollcall');
      if (cache.selectedTimetableId) {
        callApi('setSelectedTimetable', cache.selectedTimetableId);
      }

      triggerUpdate('db_reset', { students, seating, todos, periods: FALLBACK_PERIODS, courses: FALLBACK_COURSES, events, timetables });
      triggerUpdate('students_updated', students);
      triggerUpdate('seating_updated', seating);
      triggerUpdate('todos_updated', todos);
      triggerUpdate('timetables_updated', timetables);
      triggerUpdate('periods_updated', FALLBACK_PERIODS);
      triggerUpdate('courses_updated', FALLBACK_COURSES);
      triggerUpdate('events_updated', events);
      triggerUpdate('history_cleared', []);
      return true;
    },

    clearAllData() {
      const emptySeating = { rows: 5, cols: 6, seats: new Array(30).fill('') };
      cache.students = [];
      cache.seating = emptySeating;
      cache.todos = [];
      cache.events = [];
      cache.timetables = [];
      cache.rollcall = [];
      cache.selectedTimetableId = null;

      syncAllToLocal();

      callApi('batchStudents', 'replace', []);
      callApi('saveSeating', emptySeating);
      callApi('batchTodos', 'replace', []);
      callApi('batchEvents', 'replace', []);
      callApi('batchTimetables', 'replace', []);
      callApi('clearRollcall');

      triggerUpdate('db_reset', { students: [], seating: emptySeating, todos: [], periods: FALLBACK_PERIODS, courses: [], events: [] });
      triggerUpdate('students_updated', []);
      triggerUpdate('seating_updated', emptySeating);
      triggerUpdate('todos_updated', []);
      triggerUpdate('periods_updated', FALLBACK_PERIODS);
      triggerUpdate('courses_updated', []);
      triggerUpdate('events_updated', []);
      triggerUpdate('history_cleared', []);
      return true;
    },

    exportJSON() {
      const exportData = {
        exportedAt: new Date().toISOString(),
        students: this.getStudents(),
        seating: this.getSeating(),
        todos: this.getTodos(),
        periods: this.getPeriods(),
        courses: this.getCourses(),
        events: this.getEvents(),
        history: this.getRollCallHistory()
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `老师工作台全量备份_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    importJSON(jsonString) {
      let data;
      try {
        data = JSON.parse(jsonString);
      } catch (err) {
        throw new Error('备份文件格式不正确：' + err.message);
      }
      if (data.students && Array.isArray(data.students)) {
        cache.students = data.students.map(normalizeStudent);
        saveLocal(STORAGE_KEY_STUDENTS, cache.students);
        callApi('batchStudents', 'replace', cache.students);
      }
      if (data.seating && data.seating.rows && data.seating.cols) {
        this.saveSeating(data.seating, false);
      }
      if (data.todos && Array.isArray(data.todos)) {
        cache.todos = data.todos.map(normalizeTodo);
        saveLocal(STORAGE_KEY_TODOS, cache.todos);
        callApi('batchTodos', 'replace', cache.todos);
      }
      if (data.events && Array.isArray(data.events)) {
        cache.events = data.events.map(normalizeEvent);
        saveLocal(STORAGE_KEY_EVENTS, cache.events);
        callApi('batchEvents', 'replace', cache.events);
      }
      if (data.history && Array.isArray(data.history)) {
        cache.rollcall = data.history.map(r => ({ id: String(r.id || ''), name: String(r.name || ''), time: String(r.time || ''), sessionId: String(r.sessionId || ''), createdAt: Number(r.createdAt) || 0 }));
        saveLocal(STORAGE_KEY_ROLLCALL, cache.rollcall);
        triggerUpdate('history_updated', cache.rollcall);
      }
      triggerUpdate('db_imported', data);
      triggerUpdate('students_updated', cache.students);
      triggerUpdate('todos_updated', cache.todos);
      triggerUpdate('events_updated', cache.events);
      return true;
    }
  };

  // 启动即自适应加载数据（有后端走后端，无后端走 localStorage/模拟数据）
  loadAll();

  global.SchoolDB = SchoolDB;
})(window);
