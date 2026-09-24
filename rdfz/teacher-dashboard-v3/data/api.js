/**
 * 老师工作台 - 后端 API 客户端 (api.js)
 * 通过网关访问后端：网关统一鉴权（X-App-Code + Bearer token）并注入 X-User-ID，
 * 后端按网关注入的 X-User-ID 做数据隔离。
 */
(function (global) {
  // 使用相对路径，让请求走同源网关/本地 dev 代理，避免跨域 CORS 校验。
  // 本地 dev 由 vite server.proxy 的 `/public/edu/api/v1/edu` 规则转发到后端；
  // 生产环境由网关按相同路径转发。
  const BASE_URL = '/public/edu/api/v1/edu/workbench';
  const APP_CODE = 'soulclaw';
  // 与 Vue 主站一致：localStorage key = data-appToken，值为 JSON { accessToken, ... }
  const TOKEN_STORAGE_KEY = 'data-appToken';

  /** 获取 access token，对齐 packages/domain auth/sessionStorage 与 getRequestHeaders。 */
  function getToken() {
    try {
      const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!raw) return null;
      const tokenData = JSON.parse(raw);
      return tokenData && tokenData.accessToken ? tokenData.accessToken : null;
    } catch (e) {
      return null;
    }
  }

  /** 发起请求并解析统一响应。 */
  async function request(method, path, body) {
    const url = BASE_URL + path;
    const headers = {
      'X-App-Code': APP_CODE
    };
    const token = getToken();
    if (token) {
      headers['authorization'] = 'Bearer ' + token;
    }
    let payload;
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    let resp;
    try {
      resp = await fetch(url, { method, headers, body: payload });
    } catch (e) {
      const err = new Error('无法连接后端服务');
      err.code = 0;
      throw err;
    }
    let json;
    try {
      json = await resp.json();
    } catch (e) {
      const err = new Error('后端返回格式错误');
      err.code = 0;
      throw err;
    }
    if (!json || json.code !== 0) {
      const err = new Error((json && json.message) || '请求失败');
      err.code = (json && json.code) || 0;
      throw err;
    }
    return json.data;
  }

  const WorkbenchApi = {
    // ============ 学生花名册 ============
    listStudents: () => request('GET', '/students'),
    addStudent: (student) => request('POST', '/students', student),
    updateStudent: (oldStudentNo, student) =>
      request('PUT', '/students/' + encodeURIComponent(oldStudentNo), student),
    deleteStudent: (studentNo) =>
      request('DELETE', '/students/' + encodeURIComponent(studentNo)),
    batchStudents: (mode, students) =>
      request('POST', '/students/batch', { mode: mode, students: students }),

    // ============ 座位 ============
    getSeating: () => request('GET', '/seating'),
    saveSeating: (seating) => request('PUT', '/seating', seating),

    // ============ 随机点名 ============
    listRollcall: () => request('GET', '/rollcall/records'),
    addRollcall: (records) => request('POST', '/rollcall/records', { records: records }),
    clearRollcall: () => request('DELETE', '/rollcall/records'),

    // ============ 待办 ============
    listTodos: () => request('GET', '/todos'),
    addTodo: (todo) => request('POST', '/todos', todo),
    updateTodo: (id, todo) => request('PUT', '/todos/' + encodeURIComponent(id), todo),
    deleteTodo: (id) => request('DELETE', '/todos/' + encodeURIComponent(id)),
    batchTodos: (mode, todos) =>
      request('POST', '/todos/batch', { mode: mode, todos: todos }),

    // ============ 日程事件 ============
    listEvents: () => request('GET', '/events'),
    addEvent: (event) => request('POST', '/events', event),
    updateEvent: (id, event) => request('PUT', '/events/' + encodeURIComponent(id), event),
    deleteEvent: (id) => request('DELETE', '/events/' + encodeURIComponent(id)),
    batchEvents: (mode, events) =>
      request('POST', '/events/batch', { mode: mode, events: events }),

    // ============ 学期课表 ============
    listTimetables: () => request('GET', '/timetables'),
    addTimetable: (timetable) => request('POST', '/timetables', timetable),
    updateTimetable: (id, timetable) =>
      request('PUT', '/timetables/' + encodeURIComponent(id), timetable),
    deleteTimetable: (id) => request('DELETE', '/timetables/' + encodeURIComponent(id)),
    batchTimetables: (mode, timetables) =>
      request('POST', '/timetables/batch', { mode: mode, timetables: timetables }),
    getSelectedTimetable: () => request('GET', '/timetables/selected'),
    setSelectedTimetable: (id) => request('PUT', '/timetables/selected', { id: id })
  };

  global.WorkbenchApi = WorkbenchApi;
  global.getWorkbenchToken = getToken;
})(window);
