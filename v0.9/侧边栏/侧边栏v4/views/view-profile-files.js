/**
 * 智能体档案 - 文件库模块 (views/view-profile-files.js)
 * 职责：聚合呈现 Master AI助手 以及 所有专属AI分身 的全部知识文件、分类筛选与检索管理
 */

function getAllAggregatedProfileFiles() {
  const masterFiles = (window.agentProfileData && window.agentProfileData.files) || [];
  
  // 1. Master 主库文件 (默认主库文件，不单独打分身标签)
  const list = masterFiles.map(f => ({
    ...f,
    source: '',
    isMaster: true,
    isClone: false
  }));

  // 2. 聚合所有我的分身的文件
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

function renderFilesPanel() {
  const allFiles = getAllAggregatedProfileFiles();
  const activeSourceFilter = state.profileFileSourceFilter || 'all';

  // 来源列表定义（全部 即 Master 全部文件，其余为各分身）
  const sourceOptions = [{ id: 'all', name: '全部', count: allFiles.length }];

  if (typeof myClones !== 'undefined' && Array.isArray(myClones)) {
    myClones.forEach(c => {
      const cFiles = (c.files && c.files.length) || 0;
      sourceOptions.push({
        id: c.id,
        name: c.name,
        count: cFiles
      });
    });
  }

  // 过滤显示的文件
  const displayedFiles = allFiles.filter(f => {
    if (activeSourceFilter === 'all') return true;
    return f.cloneId === activeSourceFilter;
  });

  // 统计计算
  const totalTokens = allFiles.reduce((acc, f) => {
    const num = parseInt(String(f.tokens || '0').replace(/[^0-9]/g, ''), 10) || 0;
    return acc + num;
  }, 0);

  const filterChipsHtml = sourceOptions.map(opt => {
    const isActive = (activeSourceFilter === opt.id);
    return `
      <div class="source-filter-chip ${isActive ? 'active' : ''}" onclick="setProfileFileSourceFilter('${escapeJsString(opt.id)}')">
        <span>${escapeHtml(opt.name)}</span>
        <span class="chip-count">${opt.count}</span>
      </div>
    `;
  }).join('');

  const fileRowsHtml = displayedFiles.map(file => {
    let typeBg = '#e0f2fe'; let typeColor = '#0369a1'; let typeLabel = 'PDF';
    if (file.type === 'doc') { typeBg = '#dbeafe'; typeColor = '#1d4ed8'; typeLabel = 'DOC'; }
    else if (file.type === 'md') { typeBg = '#fce7f3'; typeColor = '#be185d'; typeLabel = 'MD'; }
    else if (file.type === 'xls') { typeBg = '#dcfce7'; typeColor = '#15803d'; typeLabel = 'XLS'; }

    const sourceBadgeHtml = file.isClone
      ? `<span class="file-source-badge" style="background: ${file.sourceGradient};">${escapeHtml(file.source)}</span>`
      : `<span style="color:var(--text-muted);font-size:12px;">-</span>`;

    return `
      <tr class="file-table-row">
        <td>
          <div class="file-name-cell">
            <div class="file-type-icon" style="background:${typeBg};color:${typeColor};">${typeLabel}</div>
            <div class="file-title-info">
              <span class="file-name-text" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
              <span class="file-tokens-text">已提取约 ${file.tokens || '0'} Tokens</span>
            </div>
          </div>
        </td>
        <td>${sourceBadgeHtml}</td>
        <td class="file-size-cell">${file.size || '1.0 MB'}</td>
        <td>
          <span class="file-status-badge">
            <span class="status-dot"></span>
            ${escapeHtml(file.status || '解析完成')}
          </span>
        </td>
        <td class="file-time-cell">${file.time || '2026-08-18'}</td>
        <td class="file-actions-cell">
          <button class="icon-btn-text" onclick="previewProfileUnifiedFile('${file.id}')" title="预览文件">
            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="7" r="3"/></svg>
            <span>预览</span>
          </button>
          <button class="icon-btn-text danger" onclick="deleteProfileUnifiedFile('${file.id}', '${file.cloneId || ''}')" title="删除文件">
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
            <span>全局知识库占用 (含所有分身)</span>
            <strong>${allFiles.length} 个文件 · ${totalTokens.toLocaleString()} Tokens</strong>
          </div>
          <div class="storage-progress-bar">
            <div class="storage-progress-inner" style="width: ${Math.min(100, Math.max(8, allFiles.length * 8))}%;"></div>
          </div>
        </div>

        <div class="files-action-btns">
          <button class="btn btn-primary" onclick="triggerProfileFileUpload()">
            <svg class="icon" viewBox="0 0 24 24" style="width:15px;height:15px;stroke:#fff;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>上传文件至主知识库</span>
          </button>
        </div>
      </div>

      <!-- 拖拽上传区域 (超大附件上传框) -->
      <div class="file-upload-dropzone" onclick="triggerProfileFileUpload()">
        <div class="dropzone-icon-box">
          <svg class="icon" viewBox="0 0 24 24" style="width:28px;height:28px;stroke:#4f46e5;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="dropzone-text">
          <span class="dropzone-highlight">点击上传</span> 或将文件拖拽至此处
        </div>
        <div class="dropzone-subtext">支持 PDF、DOCX、TXT、MD、XLSX 格式，单个文件不超过 50MB</div>
      </div>

      <!-- 文件列表表格 Card -->
      <div class="files-table-card">
        <div class="table-header-title" style="flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;">
          <div class="source-filter-chips-wrap">
            ${filterChipsHtml}
          </div>
          <div class="file-search-box">
            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--text-muted);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="搜索文件名或分身来源..." oninput="filterUnifiedProfileFiles(this.value)">
          </div>
        </div>

        <table class="files-table">
          <thead>
            <tr>
              <th>文件名</th>
              <th>来源归属</th>
              <th>大小</th>
              <th>解析状态</th>
              <th>上传时间</th>
              <th style="text-align:right;">操作</th>
            </tr>
          </thead>
          <tbody id="profile-files-tbody">
            ${displayedFiles.length > 0 ? fileRowsHtml : '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">未搜索到匹配的文件</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function setProfileFileSourceFilter(sourceId) {
  state.profileFileSourceFilter = sourceId;
  renderApp();
}

function triggerProfileFileUpload() {
  const newFile = {
    id: 'f_' + Date.now(),
    name: 'Master主知识库文档_' + Math.floor(Math.random() * 899 + 100) + '.pdf',
    size: '1.6 MB',
    time: new Date().toLocaleString('zh-CN', { hour12: false }),
    status: '解析完成',
    type: 'pdf',
    tokens: '8,400'
  };
  window.agentProfileData.files.unshift(newFile);
  showToast('文件已上传至 Master 档案中心！');
  renderApp();
}

function deleteProfileUnifiedFile(fileId, cloneId) {
  if (cloneId) {
    const clone = myClones.find(c => c.id === cloneId);
    if (clone && clone.files) {
      clone.files = clone.files.filter(f => f.id !== fileId);
    }
  } else {
    window.agentProfileData.files = window.agentProfileData.files.filter(f => f.id !== fileId);
  }
  showToast('文件已从档案知识库移除');
  renderApp();
}

function previewProfileUnifiedFile(fileId) {
  const allFiles = getAllAggregatedProfileFiles();
  const f = allFiles.find(item => item.id === fileId);
  if (f) {
    const sourceInfo = f.isClone ? `来源分身: ${f.source}` : '来源: Master 主知识库';
    alert(`【文件知识库详情】\n文件名: ${f.name}\n${sourceInfo}\n文件大小: ${f.size}\n提取 Tokens: ${f.tokens || '未知'}\n解析状态: ${f.status}`);
  }
}

function filterUnifiedProfileFiles(val) {
  const tbody = document.getElementById('profile-files-tbody');
  if (!tbody) return;

  const keyword = (val || '').toLowerCase().trim();
  const allFiles = getAllAggregatedProfileFiles();
  const activeSourceFilter = state.profileFileSourceFilter || 'all';

  const sourceFiltered = allFiles.filter(f => {
    if (activeSourceFilter === 'all') return true;
    return f.cloneId === activeSourceFilter;
  });

  const filtered = sourceFiltered.filter(f => 
    f.name.toLowerCase().includes(keyword) || 
    (f.source && f.source.toLowerCase().includes(keyword))
  );

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">未搜索到匹配的文件</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(file => {
    let typeBg = '#e0f2fe'; let typeColor = '#0369a1'; let typeLabel = 'PDF';
    if (file.type === 'doc') { typeBg = '#dbeafe'; typeColor = '#1d4ed8'; typeLabel = 'DOC'; }
    else if (file.type === 'md') { typeBg = '#fce7f3'; typeColor = '#be185d'; typeLabel = 'MD'; }
    else if (file.type === 'xls') { typeBg = '#dcfce7'; typeColor = '#15803d'; typeLabel = 'XLS'; }

    const sourceBadgeHtml = file.isClone
      ? `<span class="file-source-badge" style="background: ${file.sourceGradient};">${escapeHtml(file.source)}</span>`
      : `<span style="color:var(--text-muted);font-size:12px;">-</span>`;

    return `
      <tr class="file-table-row">
        <td>
          <div class="file-name-cell">
            <div class="file-type-icon" style="background:${typeBg};color:${typeColor};">${typeLabel}</div>
            <div class="file-title-info">
              <span class="file-name-text">${escapeHtml(file.name)}</span>
              <span class="file-tokens-text">已提取约 ${file.tokens || '0'} Tokens</span>
            </div>
          </div>
        </td>
        <td>${sourceBadgeHtml}</td>
        <td class="file-size-cell">${file.size}</td>
        <td>
          <span class="file-status-badge">
            <span class="status-dot"></span>
            ${escapeHtml(file.status)}
          </span>
        </td>
        <td class="file-time-cell">${file.time}</td>
        <td class="file-actions-cell">
          <button class="icon-btn-text" onclick="previewProfileUnifiedFile('${file.id}')">
            <span>预览</span>
          </button>
          <button class="icon-btn-text danger" onclick="deleteProfileUnifiedFile('${file.id}', '${file.cloneId || ''}')">
            <span>删除</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}
