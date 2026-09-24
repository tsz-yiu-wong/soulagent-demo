/**
 * 老师工作台 - 本地轻量级响应式数据库 (SchoolDB)
 * 支持学生花名册 CRUD、座位表持久化、点名记录、数据导入导出与跨页面实时同步
 */
(function(global) {
  const STORAGE_KEY_STUDENTS = 'schooldb_students_v1';
  const STORAGE_KEY_SEATING = 'schooldb_seating_v1';
  const STORAGE_KEY_HISTORY = 'schooldb_history_v1';
  const STORAGE_KEY_TODOS = 'schooldb_todos_v1';
  const STORAGE_KEY_COURSES = 'schooldb_courses_v1';
  const STORAGE_KEY_EVENTS = 'schooldb_events_v1';
  const STORAGE_KEY_PERIODS = 'schooldb_periods_v1';
  const STORAGE_KEY_TIMETABLES = 'schooldb_timetables_v1';
  const STORAGE_KEY_SELECTED_TIMETABLE_ID = 'schooldb_selected_timetable_id_v1';

  function getRelativeDateStr(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // 默认节次定义
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

  // 默认老师课表（每周循环排课）
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

  // 默认多学期课表集合
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

  // 默认待办事项 (精简版：每日1个，工作日对齐)
  const FALLBACK_TODOS = [
    {
      id: 'todo_1',
      title: '批改六年级(1)班数学第一单元测试卷',
      dueDate: getRelativeDateStr(0),
      dueTime: '16:30',
      category: 'teaching',
      completed: false,
      completedAt: null,
      flagged: true,
      createdAt: getRelativeDateStr(-1)
    },
    {
      id: 'todo_2',
      title: '家长电话回访：与陈子涵父亲沟通春季过敏体质情况',
      dueDate: getRelativeDateStr(1),
      dueTime: '17:30',
      category: 'parent',
      completed: false,
      completedAt: null,
      flagged: true,
      createdAt: getRelativeDateStr(-1)
    },
    {
      id: 'todo_3',
      title: '参加数学学科组公开课教研磨课',
      dueDate: getRelativeDateStr(2),
      dueTime: '14:30',
      category: 'teaching',
      completed: false,
      completedAt: null,
      flagged: false,
      createdAt: getRelativeDateStr(-2)
    },
    {
      id: 'todo_4',
      title: '组织主题班会：班级干部换届选举与小组互助',
      dueDate: getRelativeDateStr(3),
      dueTime: '15:30',
      category: 'class',
      completed: false,
      completedAt: null,
      flagged: false,
      createdAt: getRelativeDateStr(-3)
    },
    {
      id: 'todo_5',
      title: '教研论文素材整理与个人年度进修学分申报',
      dueDate: getRelativeDateStr(6),
      dueTime: '18:00',
      category: 'personal',
      completed: false,
      completedAt: null,
      flagged: false,
      createdAt: getRelativeDateStr(-1)
    },
    {
      id: 'todo_6',
      title: '整理开学初视力筛查记录并完成前排座位微调',
      dueDate: getRelativeDateStr(-1),
      dueTime: '17:00',
      category: 'class',
      completed: true,
      completedAt: getRelativeDateStr(-1) + ' 16:45',
      flagged: false,
      createdAt: getRelativeDateStr(-4)
    }
  ];

  // 默认日程事件
  const FALLBACK_EVENTS = [
    {
      id: 'evt_1',
      title: '数学教研组常规周例会',
      date: getRelativeDateStr(1),
      startTime: '15:30',
      endTime: '16:45',
      type: 'meeting',
      location: '行政楼二楼会议室',
      notes: '讨论阶段性学情摸底与跨学科融合教学案',
      color: '#6366F1'
    },
    {
      id: 'evt_2',
      title: '大课间课间操值日巡查',
      date: getRelativeDateStr(3),
      startTime: '09:50',
      endTime: '10:15',
      type: 'duty',
      location: '东操场1号区',
      notes: '督促班级集合整队与做操纪律',
      color: '#F59E0B'
    },
    {
      id: 'evt_3',
      title: '年级家委会新学期交流会',
      date: getRelativeDateStr(6),
      startTime: '18:30',
      endTime: '20:00',
      type: 'activity',
      location: '致远楼 302',
      notes: '沟通本学期研学实践活动与家校共育计划',
      color: '#C5222F'
    }
  ];

  // 默认兜底数据（防止 fetch 异步延迟或 file 协议受限）
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

  const FALLBACK_SEATING = {
    rows: 5,
    cols: 6,
    seats: FALLBACK_STUDENTS.map(s => s.id)
  };

  const listeners = new Set();

  function triggerUpdate(type, data) {
    const payload = { type, data, timestamp: Date.now() };
    listeners.forEach(fn => {
      try { fn(payload); } catch (err) { console.error('SchoolDB listener error:', err); }
    });
    window.dispatchEvent(new CustomEvent('schooldb:change', { detail: payload }));
  }

  // 跨 Tab / 跨窗口监听
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('schooldb_')) {
      triggerUpdate('storage_sync', { key: e.key, newValue: e.newValue });
    }
  });

  const SchoolDB = {
    // 注册更新监听
    onUpdate(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },

    // ========== 学生名册管理 ==========
    getStudents() {
      const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (!raw) {
        this.saveStudents(FALLBACK_STUDENTS, false);
        return [...FALLBACK_STUDENTS];
      }
      try {
        const list = JSON.parse(raw);
        const mapped = list.map(s => ({
          id: String(s.id || '').trim(),
          name: String(s.name || '').trim(),
          gender: s.gender === '女' ? '女' : '男',
          specialNotes: String(s.specialNotes || s.healthCondition || s.notes || s.healthTag || s['特殊情况'] || s['过敏'] || s['备注'] || s['关照备注'] || '').trim(),
          contactName: String(s.contactName || s.guardian || s.parent || s['紧急联系人'] || s['联系人'] || s['监护人'] || s['家长'] || '').trim(),
          contactPhone: String(s.contactPhone || s.phone || s['紧急联系人电话'] || s['联系电话'] || s['手机号'] || s['电话'] || '').trim()
        }));

        // 自愈/示例升级：如果名册是示例名册（陈子涵等），升级为最新示例关照备注与联系人
        const isDefaultRoster = mapped.length === 30 && mapped[0]?.id === '202401' && mapped[0]?.name === '陈子涵';
        if (isDefaultRoster) {
          const needsUpgrade = mapped.some(s => {
            const hasOldText = s.specialNotes && (s.specialNotes.includes('需前排') || s.specialNotes === '散光/近视');
            const lacksPhone = !s.contactPhone && FALLBACK_STUDENTS.some(fb => fb.id === s.id && fb.contactPhone);
            return hasOldText || lacksPhone;
          });
          if (needsUpgrade) {
            const fallbackMap = new Map(FALLBACK_STUDENTS.map(fb => [fb.id, fb]));
            mapped.forEach(s => {
              if (fallbackMap.has(s.id)) {
                const fb = fallbackMap.get(s.id);
                s.specialNotes = fb.specialNotes || s.specialNotes || '';
                s.contactName = fb.contactName || s.contactName || '';
                s.contactPhone = fb.contactPhone || s.contactPhone || '';
              }
            });
            this.saveStudents(mapped, false);
          }
        }

        return mapped;
      } catch (e) {
        console.error('Failed to parse students from localStorage:', e);
        return [...FALLBACK_STUDENTS];
      }
    },

    saveStudents(students, shouldTrigger = true) {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
      // 检查座位表是否需要根据学生人数自动扩容
      this.getSeating();
      if (shouldTrigger) {
        triggerUpdate('students_updated', students);
      }
    },

    addStudent(student) {
      const list = this.getStudents();
      const exists = list.some(s => String(s.id).trim() === String(student.id).trim());
      if (exists) {
        throw new Error(`学号 ${student.id} 已存在，不能重复添加`);
      }
      const newStudent = {
        id: String(student.id).trim(),
        name: String(student.name).trim(),
        gender: student.gender === '女' ? '女' : '男',
        specialNotes: String(student.specialNotes || student.healthCondition || student.notes || '').trim(),
        contactName: String(student.contactName || student.guardian || '').trim(),
        contactPhone: String(student.contactPhone || student.phone || '').trim()
      };
      list.push(newStudent);
      this.saveStudents(list);

      // 同步将新学生安排到座位表的空位中
      const seating = this.getSeating();
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
      const list = this.getStudents();
      const index = list.findIndex(s => String(s.id) === String(oldId));
      if (index === -1) {
        throw new Error(`未找到原学号为 ${oldId} 的学生`);
      }
      
      const newId = String(newStudent.id).trim();
      if (newId !== String(oldId) && list.some(s => String(s.id) === newId)) {
        throw new Error(`新学号 ${newId} 已被其他学生占用`);
      }

      list[index] = {
        id: newId,
        name: String(newStudent.name).trim(),
        gender: newStudent.gender === '女' ? '女' : '男',
        specialNotes: String(newStudent.specialNotes || newStudent.healthCondition || newStudent.notes || '').trim(),
        contactName: String(newStudent.contactName || newStudent.guardian || '').trim(),
        contactPhone: String(newStudent.contactPhone || newStudent.phone || '').trim()
      };
      this.saveStudents(list);

      // 级联更新座位表中的对应学号
      if (String(oldId) !== newId) {
        const seating = this.getSeating();
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
      let list = this.getStudents();
      list = list.filter(s => String(s.id) !== idStr);
      this.saveStudents(list);

      // 级联清空座位表中的该位置
      const seating = this.getSeating();
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

    // 校验学生数据格式
    validateStudents(rawList) {
      if (!Array.isArray(rawList) || rawList.length === 0) {
        throw new Error('导入文件未包含有效数据行，请检查表格内容');
      }

      // 过滤全空行
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

        // 校验必填项：学号
        if (!id) {
          errors.push(`${rowLabel} 缺失【学号】`);
        } else {
          if (seenIds.has(id)) {
            errors.push(`第 ${origRow} 行与第 ${seenIds.get(id)} 行学号重复（学号：${id}）`);
          } else {
            seenIds.set(id, origRow);
          }
        }

        // 校验必填项：姓名
        if (!name) {
          errors.push(`第 ${origRow} 行 缺失【姓名】`);
        }

        // 校验必填项：性别（不给默认值，无性别或格式错误直接报错）
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

    // 批量导入学生
    importStudents(newStudents, mode = 'append') {
      const formatted = this.validateStudents(newStudents);

      if (mode === 'replace') {
        this.saveStudents(formatted);
        const seating = this.getSeating();
        const total = seating.rows * seating.cols;
        const newSeats = new Array(total).fill('');
        for (let i = 0; i < Math.min(formatted.length, total); i++) {
          newSeats[i] = formatted[i].id;
        }
        seating.seats = newSeats;
        this.saveSeating(seating);
      } else {
        const list = this.getStudents();
        const map = new Map(list.map(s => [String(s.id), s]));
        formatted.forEach(s => {
          map.set(String(s.id), s);
        });
        const updatedList = Array.from(map.values());
        this.saveStudents(updatedList);

        // 增量合并：将新增的学生自动填入空座
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
      return formatted;
    },

    // ========== 座位表管理 ==========
    getSeating() {
      const raw = localStorage.getItem(STORAGE_KEY_SEATING);
      let config;
      if (!raw) {
        config = JSON.parse(JSON.stringify(FALLBACK_SEATING));
      } else {
        try {
          const data = JSON.parse(raw);
          config = {
            rows: Number(data.rows) || 5,
            cols: Number(data.cols) || 6,
            seats: Array.isArray(data.seats) ? data.seats : []
          };
        } catch (e) {
          config = JSON.parse(JSON.stringify(FALLBACK_SEATING));
        }
      }

      const students = this.getStudents();
      const studentCount = students.length;
      const validStudentIds = new Set(students.map(s => String(s.id)));
      let changed = false;

      // 1. 自动检查并扩展容量以容纳所有学生
      if (studentCount > config.rows * config.cols) {
        let cols = config.cols || 6;
        let rows = Math.max(config.rows || 5, Math.ceil(studentCount / cols));
        if (rows > 15) {
          cols = Math.min(15, Math.ceil(studentCount / 15));
          rows = Math.min(15, Math.ceil(studentCount / cols));
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

      // 2. 清理已被彻底删除的学生ID
      for (let i = 0; i < seats.length; i++) {
        if (seats[i] && !validStudentIds.has(String(seats[i]))) {
          seats[i] = '';
          changed = true;
        }
      }

      config.seats = seats;
      if (changed) {
        localStorage.setItem(STORAGE_KEY_SEATING, JSON.stringify(config));
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

      const payload = { rows, cols, seats };
      localStorage.setItem(STORAGE_KEY_SEATING, JSON.stringify(payload));
      if (shouldTrigger) {
        triggerUpdate('seating_updated', payload);
      }
    },

    // ========== 待办事项管理 (Todos) ==========
    getTodos() {
      const raw = localStorage.getItem(STORAGE_KEY_TODOS);
      if (!raw) {
        this.saveTodos(FALLBACK_TODOS, false);
        return JSON.parse(JSON.stringify(FALLBACK_TODOS));
      }
      try {
        return JSON.parse(raw);
      } catch (e) {
        return JSON.parse(JSON.stringify(FALLBACK_TODOS));
      }
    },

    saveTodos(todos, shouldTrigger = true) {
      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
      if (shouldTrigger) {
        triggerUpdate('todos_updated', todos);
      }
    },

    addTodo(todo) {
      const todos = this.getTodos();
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
      todos.unshift(newTodo);
      this.saveTodos(todos);
      return newTodo;
    },

    updateTodo(id, updates) {
      const todos = this.getTodos();
      const idx = todos.findIndex(t => String(t.id) === String(id));
      if (idx === -1) throw new Error('未找到该待办事项');

      const current = todos[idx];
      const nextCompleted = updates.completed !== undefined ? Boolean(updates.completed) : current.completed;
      let completedAt = current.completedAt;
      if (nextCompleted && !current.completed) {
        completedAt = new Date().toISOString();
      } else if (!nextCompleted) {
        completedAt = null;
      }

      todos[idx] = {
        ...current,
        ...updates,
        completed: nextCompleted,
        completedAt
      };
      this.saveTodos(todos);
      return todos[idx];
    },

    toggleTodo(id) {
      const todos = this.getTodos();
      const target = todos.find(t => String(t.id) === String(id));
      if (!target) return;
      return this.updateTodo(id, { completed: !target.completed });
    },

    toggleFlagTodo(id) {
      const todos = this.getTodos();
      const target = todos.find(t => String(t.id) === String(id));
      if (!target) return;
      return this.updateTodo(id, { flagged: !target.flagged });
    },

    deleteTodo(id) {
      let todos = this.getTodos();
      todos = todos.filter(t => String(t.id) !== String(id));
      this.saveTodos(todos);
    },

    // 校验待办数据格式 (无 priority)
    validateTodos(rawList) {
      if (!Array.isArray(rawList) || rawList.length === 0) {
        throw new Error('导入文件未包含有效数据行，请检查表格内容');
      }

      // 过滤全空行
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
        const rawTitle = item.title !== undefined ? item.title : (
          item['待办内容'] !== undefined ? item['待办内容'] : (
            item['待办事项'] !== undefined ? item['待办事项'] : (
              item['内容'] !== undefined ? item['内容'] : (
                item['标题'] !== undefined ? item['标题'] : (
                  item['任务'] !== undefined ? item['任务'] : ''
                )
              )
            )
          )
        );
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

    // 批量导入待办
    importTodos(newTodos, mode = 'append') {
      const formatted = this.validateTodos(newTodos);

      if (mode === 'replace') {
        this.saveTodos(formatted);
      } else {
        const existing = this.getTodos();
        this.saveTodos([...formatted, ...existing]);
      }
      return formatted;
    },

    // ========== 多学期课表管理 (Timetables) ==========
    getTimetables() {
      const raw = localStorage.getItem(STORAGE_KEY_TIMETABLES);
      if (!raw) {
        this.saveTimetables(FALLBACK_TIMETABLES, false);
        return JSON.parse(JSON.stringify(FALLBACK_TIMETABLES));
      }
      try {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
        return JSON.parse(JSON.stringify(FALLBACK_TIMETABLES));
      } catch (e) {
        return JSON.parse(JSON.stringify(FALLBACK_TIMETABLES));
      }
    },

    saveTimetables(timetables, shouldTrigger = true) {
      localStorage.setItem(STORAGE_KEY_TIMETABLES, JSON.stringify(timetables));
      if (shouldTrigger) {
        triggerUpdate('timetables_updated', timetables);
        triggerUpdate('courses_updated', this.getCourses());
        triggerUpdate('periods_updated', this.getPeriods());
      }
    },

    getSelectedTimetableId() {
      const timetables = this.getTimetables();
      const savedId = localStorage.getItem(STORAGE_KEY_SELECTED_TIMETABLE_ID);
      if (savedId && timetables.some(t => t.id === savedId)) {
        return savedId;
      }
      const defaultId = timetables[0]?.id || 'tt_default';
      this.setSelectedTimetableId(defaultId, false);
      return defaultId;
    },

    setSelectedTimetableId(id, shouldTrigger = true) {
      localStorage.setItem(STORAGE_KEY_SELECTED_TIMETABLE_ID, id);
      if (shouldTrigger) {
        triggerUpdate('selected_timetable_changed', { selectedId: id });
        triggerUpdate('courses_updated', this.getCourses(id));
        triggerUpdate('periods_updated', this.getPeriods(id));
      }
    },

    getTimetableById(id) {
      const list = this.getTimetables();
      return list.find(t => t.id === id) || list[0] || null;
    },

    // 根据指定 YYYY-MM-DD 查询该日期落入的学期课表
    getTimetableForDate(dateStr) {
      if (!dateStr) return null;
      const list = this.getTimetables();
      return list.find(t => {
        if (!t.startDate || !t.endDate) return false;
        return dateStr >= t.startDate && dateStr <= t.endDate;
      }) || null;
    },

    addTimetable({ name, startDate, endDate, copyFromId, isBlank = false }) {
      const timetables = this.getTimetables();
      const newId = `tt_${Date.now()}`;
      let periods = JSON.parse(JSON.stringify(FALLBACK_PERIODS));
      let courses = [];

      if (!isBlank && copyFromId) {
        const source = timetables.find(t => t.id === copyFromId);
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

      timetables.push(newTimetable);
      this.saveTimetables(timetables);
      this.setSelectedTimetableId(newId);
      return newTimetable;
    },

    updateTimetable(id, updates) {
      const timetables = this.getTimetables();
      const idx = timetables.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('未找到该学期课表');

      timetables[idx] = { ...timetables[idx], ...updates };
      this.saveTimetables(timetables);
      return timetables[idx];
    },

    deleteTimetable(id) {
      let timetables = this.getTimetables();
      if (timetables.length <= 1) {
        throw new Error('至少需要保留一份学期课表，无法全部删除');
      }
      timetables = timetables.filter(t => t.id !== id);
      this.saveTimetables(timetables);
      const curId = this.getSelectedTimetableId();
      if (curId === id) {
        this.setSelectedTimetableId(timetables[0].id);
      }
    },

    // ========== 节次定义管理 (基于当前课表) ==========
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

      // 同步更新该课表内已存在该节次课程的起止时间
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
      periods = periods.filter(p => Number(p.period) !== Number(periodNum));
      this.savePeriods(periods, true, targetId);

      // 同步删除该节次排课
      let courses = this.getCourses(targetId);
      courses = courses.filter(c => Number(c.period) !== Number(periodNum));
      this.saveCourses(courses, true, targetId);
    },

    // ========== 课程排课管理 (基于当前课表) ==========
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
        subject: String(course.subject || '数学').trim(),
        className: String(course.className || '六(1)班').trim(),
        classroom: String(course.classroom || '致远楼 302').trim(),
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

    // ========== 日程事件管理 (Events) ==========
    getEvents() {
      const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (!raw) {
        this.saveEvents(FALLBACK_EVENTS, false);
        return JSON.parse(JSON.stringify(FALLBACK_EVENTS));
      }
      try {
        return JSON.parse(raw);
      } catch (e) {
        return JSON.parse(JSON.stringify(FALLBACK_EVENTS));
      }
    },

    saveEvents(events, shouldTrigger = true) {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      if (shouldTrigger) {
        triggerUpdate('events_updated', events);
      }
    },

    addEvent(event) {
      const events = this.getEvents();
      const item = {
        id: event.id || `evt_${Date.now()}`,
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
      events.push(item);
      this.saveEvents(events);
      return item;
    },

    updateEvent(id, updates) {
      const events = this.getEvents();
      const idx = events.findIndex(e => String(e.id) === String(id));
      if (idx === -1) throw new Error('未找到该日程');
      events[idx] = { ...events[idx], ...updates };
      this.saveEvents(events);
      return events[idx];
    },

    deleteEvent(id) {
      let events = this.getEvents();
      events = events.filter(e => String(e.id) !== String(id));
      this.saveEvents(events);
    },

    // ========== 日程综合聚合查询 (根据指定 YYYY-MM-DD 精确落入学期起止区间) ==========
    getScheduleForDate(dateStr) {
      if (!dateStr) return { courses: [], events: [], todos: [] };
      const [year, month, day] = dateStr.split('-').map(Number);
      const targetDate = new Date(year, month - 1, day);
      const rawDay = targetDate.getDay();
      const dayOfWeek = rawDay === 0 ? 7 : rawDay;

      // 1. 查找包含该日期的生效学期课表（只有在起止日期内才生效）
      const matchedTimetable = this.getTimetableForDate(dateStr);
      let courses = [];
      if (matchedTimetable && Array.isArray(matchedTimetable.courses)) {
        courses = matchedTimetable.courses.filter(c => Number(c.dayOfWeek) === dayOfWeek);
        courses.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      }

      // 2. 当天的特定日程事件
      const events = this.getEvents().filter(e => e.date === dateStr);
      events.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

      // 3. 当天到期的待办事项
      const todos = this.getTodos().filter(t => t.dueDate === dateStr);
      todos.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (a.dueTime || '99:99').localeCompare(b.dueTime || '99:99');
      });

      return {
        date: dateStr,
        dayOfWeek,
        timetable: matchedTimetable,
        courses,
        events,
        todos
      };
    },

    // ========== 点名历史记录 ==========
    getRollCallHistory() {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (!raw) return [];
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    },

    addRollCallRecord(records) {
      const history = this.getRollCallHistory();
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      const newItems = (Array.isArray(records) ? records : [records]).map(r => ({
        ...r,
        time: r.time || timeStr,
        timestamp: Date.now()
      }));

      const updated = [...newItems, ...history].slice(0, 50);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      triggerUpdate('history_updated', updated);
    },

    clearRollCallHistory() {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      triggerUpdate('history_cleared', []);
    },

    // ========== 数据库重置、清空与模拟数据 ==========
    resetToDefault() {
      return this.loadMockData();
    },

    loadMockData() {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(FALLBACK_STUDENTS));
      localStorage.setItem(STORAGE_KEY_SEATING, JSON.stringify(FALLBACK_SEATING));
      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(FALLBACK_TODOS));
      localStorage.setItem(STORAGE_KEY_PERIODS, JSON.stringify(FALLBACK_PERIODS));
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(FALLBACK_COURSES));
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(FALLBACK_EVENTS));
      localStorage.setItem(STORAGE_KEY_TIMETABLES, JSON.stringify(FALLBACK_TIMETABLES));
      localStorage.setItem(STORAGE_KEY_SELECTED_TIMETABLE_ID, FALLBACK_TIMETABLES[0].id);
      localStorage.removeItem(STORAGE_KEY_HISTORY);

      const payload = {
        students: FALLBACK_STUDENTS,
        seating: FALLBACK_SEATING,
        todos: FALLBACK_TODOS,
        periods: FALLBACK_PERIODS,
        courses: FALLBACK_COURSES,
        events: FALLBACK_EVENTS,
        timetables: FALLBACK_TIMETABLES
      };

      triggerUpdate('db_reset', payload);
      triggerUpdate('students_updated', FALLBACK_STUDENTS);
      triggerUpdate('seating_updated', FALLBACK_SEATING);
      triggerUpdate('todos_updated', FALLBACK_TODOS);
      triggerUpdate('timetables_updated', FALLBACK_TIMETABLES);
      triggerUpdate('periods_updated', FALLBACK_PERIODS);
      triggerUpdate('courses_updated', FALLBACK_COURSES);
      triggerUpdate('events_updated', FALLBACK_EVENTS);
      triggerUpdate('history_cleared', []);
      return true;
    },

    clearAllData() {
      const emptySeating = { rows: 5, cols: 6, seats: new Array(30).fill('') };
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_SEATING, JSON.stringify(emptySeating));
      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_PERIODS, JSON.stringify(FALLBACK_PERIODS));
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_TIMETABLES, JSON.stringify(FALLBACK_TIMETABLES.map(t => ({ ...t, courses: [] }))));
      localStorage.removeItem(STORAGE_KEY_HISTORY);

      const payload = {
        students: [],
        seating: emptySeating,
        todos: [],
        periods: FALLBACK_PERIODS,
        courses: [],
        events: []
      };

      triggerUpdate('db_reset', payload);
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
      try {
        const data = JSON.parse(jsonString);
        if (data.students && Array.isArray(data.students)) {
          this.saveStudents(data.students, false);
        }
        if (data.seating && data.seating.rows && data.seating.cols) {
          this.saveSeating(data.seating, false);
        }
        if (data.todos && Array.isArray(data.todos)) {
          this.saveTodos(data.todos, false);
        }
        if (data.periods && Array.isArray(data.periods)) {
          this.savePeriods(data.periods, false);
        }
        if (data.courses && Array.isArray(data.courses)) {
          this.saveCourses(data.courses, false);
        }
        if (data.events && Array.isArray(data.events)) {
          this.saveEvents(data.events, false);
        }
        if (data.history && Array.isArray(data.history)) {
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(data.history));
        }
        triggerUpdate('db_imported', data);
        return true;
      } catch (err) {
        throw new Error('备份文件格式不正确：' + err.message);
      }
    }
  };

  // 预加载默认配置
  if (!localStorage.getItem(STORAGE_KEY_STUDENTS)) {
    SchoolDB.saveStudents(FALLBACK_STUDENTS, false);
  }
  if (!localStorage.getItem(STORAGE_KEY_SEATING)) {
    SchoolDB.saveSeating(FALLBACK_SEATING, false);
  }
  if (!localStorage.getItem(STORAGE_KEY_TODOS)) {
    SchoolDB.saveTodos(FALLBACK_TODOS, false);
  }
  if (!localStorage.getItem(STORAGE_KEY_PERIODS)) {
    SchoolDB.savePeriods(FALLBACK_PERIODS, false);
  }
  if (!localStorage.getItem(STORAGE_KEY_COURSES)) {
    SchoolDB.saveCourses(FALLBACK_COURSES, false);
  }
  if (!localStorage.getItem(STORAGE_KEY_EVENTS)) {
    SchoolDB.saveEvents(FALLBACK_EVENTS, false);
  }

  global.SchoolDB = SchoolDB;
})(window);
