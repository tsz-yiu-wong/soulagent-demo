/**
 * 智能体档案 - 文件库模块 (views/view-profile-files.js)
 * 职责：渲染文件库面板、处理文件上传、删除、预览及搜索过滤逻辑
 */

function renderFilesPanel() {
  const files = window.agentProfileData.files;

  const fileRowsHtml = files.map(file => {
    let typeBg = '#e0f2fe';
    let typeColor = '#0369a1';
    let typeLabel = 'PDF';

    if (file.type === 'doc') {
      typeBg = '#dbeafe'; typeColor = '#1d4ed8'; typeLabel = 'DOC';
    } else if (file.type === 'md') {
      typeBg = '#fce7f3'; typeColor = '#be185d'; typeLabel = 'MD';
    } else if (file.type === 'xls') {
      typeBg = '#dcfce7'; typeColor = '#15803d'; typeLabel = 'XLS';
    }

    return `
      <tr class="file-table-row">
        <td>
          <div class="file-name-cell">
            <div class="file-type-icon" style="background:${typeBg};color:${typeColor};">${typeLabel}</div>
            <div class="file-title-info">
              <span class="file-name-text" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
              <span class="file-tokens-text">已提取约 ${file.tokens} Tokens</span>
            </div>
          </div>
        </td>
        <td class="file-size-cell">${file.size}</td>
        <td>
          <span class="file-status-badge">
            <span class="status-dot"></span>
            ${escapeHtml(file.status)}
          </span>
        </td>
        <td class="file-time-cell">${file.time}</td>
        <td class="file-actions-cell">
          <button class="icon-btn-text" onclick="previewProfileFile('${file.id}')" title="预览文件">
            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>预览</span>
          </button>
          <button class="icon-btn-text danger" onclick="deleteProfileFile('${file.id}')" title="删除文件">
            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>删除</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="files-panel">
      <!-- 知识库统计 & 上传入口 -->
      <div class="files-top-bar">
        <div class="files-storage-info">
          <div class="storage-text-row">
            <span>存储空间占用</span>
            <strong>8.65 MB / 500 MB</strong>
          </div>
          <div class="storage-progress-bar">
            <div class="storage-progress-inner" style="width: 1.7%;"></div>
          </div>
        </div>

        <div class="files-action-btns">
          <button class="btn btn-primary" onclick="triggerProfileFileUpload()">
            <svg class="icon" viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#fff;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>上传文件知识库</span>
          </button>
        </div>
      </div>

      <!-- 拖拽上传区域 -->
      <div class="file-upload-dropzone" onclick="triggerProfileFileUpload()">
        <div class="dropzone-icon-box">
          <svg class="icon" viewBox="0 0 24 24" style="width:28px;height:28px;stroke:#4f46e5;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="dropzone-text">
          <span class="dropzone-highlight">点击上传</span> 或将文件拖拽至此处
        </div>
        <div class="dropzone-subtext">支持 PDF、DOCX、TXT、MD、XLSX 格式，单个文件不超过 50MB</div>
      </div>

      <!-- 文件列表表格 -->
      <div class="files-table-card">
        <div class="table-header-title">
          <span>已有文件 (${files.length})</span>
          <div class="file-search-box">
            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--text-muted);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="搜索文件名..." oninput="filterProfileFiles(this.value)">
          </div>
        </div>

        <table class="files-table">
          <thead>
            <tr>
              <th>文件名</th>
              <th>大小</th>
              <th>解析状态</th>
              <th>上传时间</th>
              <th style="text-align:right;">操作</th>
            </tr>
          </thead>
          <tbody id="profile-files-tbody">
            ${files.length > 0 ? fileRowsHtml : '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">暂无上传的文件</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function triggerProfileFileUpload() {
  const newFile = {
    id: 'f_' + Date.now(),
    name: '新建业务语料文档_' + Math.floor(Math.random() * 899 + 100) + '.pdf',
    size: '1.2 MB',
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    status: '解析完成',
    type: 'pdf',
    tokens: '6,500'
  };
  window.agentProfileData.files.unshift(newFile);
  showToast('文件上传并完成向量化解析！');
  renderApp();
}

function deleteProfileFile(id) {
  window.agentProfileData.files = window.agentProfileData.files.filter(f => f.id !== id);
  showToast('已被移除出知识库文件');
  renderApp();
}

function previewProfileFile(id) {
  const f = window.agentProfileData.files.find(item => item.id === id);
  if (f) {
    alert(`【文件预览】\n文件名: ${f.name}\n大小: ${f.size}\n提取 Tokens: ${f.tokens}\n状态: ${f.status}`);
  }
}

function filterProfileFiles(val) {
  const tbody = document.getElementById('profile-files-tbody');
  if (!tbody) return;

  const keyword = (val || '').toLowerCase().trim();
  const filtered = window.agentProfileData.files.filter(f => f.name.toLowerCase().includes(keyword));

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-muted);">未搜索到匹配的文件</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(file => {
    let typeBg = '#e0f2fe';
    let typeColor = '#0369a1';
    let typeLabel = 'PDF';

    if (file.type === 'doc') {
      typeBg = '#dbeafe'; typeColor = '#1d4ed8'; typeLabel = 'DOC';
    } else if (file.type === 'md') {
      typeBg = '#fce7f3'; typeColor = '#be185d'; typeLabel = 'MD';
    } else if (file.type === 'xls') {
      typeBg = '#dcfce7'; typeColor = '#15803d'; typeLabel = 'XLS';
    }

    return `
      <tr class="file-table-row">
        <td>
          <div class="file-name-cell">
            <div class="file-type-icon" style="background:${typeBg};color:${typeColor};">${typeLabel}</div>
            <div class="file-title-info">
              <span class="file-name-text">${escapeHtml(file.name)}</span>
              <span class="file-tokens-text">已提取约 ${file.tokens} Tokens</span>
            </div>
          </div>
        </td>
        <td class="file-size-cell">${file.size}</td>
        <td>
          <span class="file-status-badge">
            <span class="status-dot"></span>
            ${escapeHtml(file.status)}
          </span>
        </td>
        <td class="file-time-cell">${file.time}</td>
        <td class="file-actions-cell">
          <button class="icon-btn-text" onclick="previewProfileFile('${file.id}')">
            <span>预览</span>
          </button>
          <button class="icon-btn-text danger" onclick="deleteProfileFile('${file.id}')">
            <span>删除</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}
