/**
 * 老师工作台 - 独立侧边栏与 SPA 无刷新路由引擎 (sidebar.js)
 * 页面切换毫秒级局部置换，侧边栏常驻静止，彻底消除整页重载与白屏闪烁
 */
(function () {
  const menuSections = [
    {
      category: '个人效率',
      items: [
        { name: '日历', path: 'calendar.html', icon: 'calendar' },
        { name: '待办', path: 'todo.html', icon: 'check-square' }
      ]
    },
    {
      category: '教学管理',
      items: [
        { name: '学生花名册', path: 'roster.html', icon: 'users' },
        { name: '座位安排', path: 'seating.html', icon: 'layout-grid' },
        { name: '随机点名', path: 'rollcall.html', icon: 'dices' }
      ]
    }
  ];

  // 页面内存高速缓存 Map<path, htmlText> (实现 0ms 瞬间切换)
  const pageCache = new Map();

  function getCurrentFilename() {
    const rawPath = decodeURIComponent(window.location.pathname);
    const fname = rawPath.substring(rawPath.lastIndexOf('/') + 1);
    return (!fname || fname === 'index.html') ? 'roster.html' : fname;
  }

  // 带有内存缓存的页面拉取函数
  async function fetchPageText(targetPath) {
    if (pageCache.has(targetPath)) {
      return pageCache.get(targetPath);
    }
    const response = await fetch(targetPath);
    if (!response.ok) throw new Error(`页面加载失败 (${response.status})`);
    const htmlText = await response.text();
    pageCache.set(targetPath, htmlText);
    return htmlText;
  }

  // 后台空闲时静默预加载全部功能页面 (仅几 KB 传输，彻底消除点击网络延迟)
  function prefetchAllPages() {
    if (window.location.protocol === 'file:') return;
    const allPages = ['roster.html', 'calendar.html', 'todo.html', 'seating.html', 'rollcall.html'];
    const current = getCurrentFilename();

    const doPrefetch = (idx = 0) => {
      if (idx >= allPages.length) return;
      const page = allPages[idx];
      if (page !== current && !pageCache.has(page)) {
        fetchPageText(page)
          .catch(() => {})
          .finally(() => {
            setTimeout(() => doPrefetch(idx + 1), 60);
          });
      } else {
        doPrefetch(idx + 1);
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => doPrefetch(0), { timeout: 2000 });
    } else {
      setTimeout(() => doPrefetch(0), 300);
    }
  }

  // SPA 无刷新路由切换核心函数 (0 毫秒内存直读置换)
  async function navigateTo(targetPath, pushToHistory = true) {
    const current = getCurrentFilename();
    if (targetPath === current) {
      return;
    }

    if (window.location.protocol === 'file:') {
      window.location.href = targetPath;
      return;
    }

    // 1. 立即更新侧边栏高亮（乐观 UI 反馈，消除迟滞感）
    updateActiveMenuItem(targetPath);

    try {
      // 2. 从内存高速缓存直接读取 (0ms) 或异步 fetch
      const htmlText = await fetchPageText(targetPath);

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // 3. 更新标题
      if (doc.title) {
        document.title = doc.title;
      }

      // 4. 收集并更新当前页专属内联 <style>
      const oldDynamicStyles = document.querySelectorAll('style[data-page-style]');
      oldDynamicStyles.forEach(s => s.remove());

      const newStyles = doc.querySelectorAll('head style');
      newStyles.forEach(styleEl => {
        const clonedStyle = document.createElement('style');
        clonedStyle.setAttribute('data-page-style', 'true');
        clonedStyle.textContent = styleEl.textContent;
        document.head.appendChild(clonedStyle);
      });

      // 5. 提取目标页面的主体内容并置换
      const contentEl = document.querySelector('.app-content');
      if (contentEl) {
        // 清理上一页面的全局事件监听器
        if (typeof window.cleanupCurrentPage === 'function') {
          try { window.cleanupCurrentPage(); } catch(e){}
        }
        window.cleanupCurrentPage = null;

        // 清理原有所有弹出层和内容
        contentEl.innerHTML = '';

        // 提取目标页 body 中的非公共核心节点
        const ignoredTags = ['SCRIPT', 'STYLE', 'ASIDE'];
        const nodesToAppend = [];
        Array.from(doc.body.childNodes).forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (!ignoredTags.includes(node.tagName) && !node.classList.contains('app-sidebar')) {
              nodesToAppend.push(node);
            }
          }
        });

        nodesToAppend.forEach(node => {
          contentEl.appendChild(document.importNode(node, true));
        });
      }

      // 6. 更新浏览器历史
      if (pushToHistory) {
        window.history.pushState({ path: targetPath }, '', targetPath);
      }

      // 7. 收集并按序加载目标页声明的外部 JS 库（如 gsap、anime 等）
      const externalScripts = Array.from(doc.querySelectorAll('script[src]'));
      for (const s of externalScripts) {
        const src = s.getAttribute('src');
        if (src && !document.querySelector(`script[src="${src}"]`)) {
          await new Promise((resolve) => {
            const scriptTag = document.createElement('script');
            scriptTag.src = src;
            scriptTag.onload = resolve;
            scriptTag.onerror = resolve;
            document.head.appendChild(scriptTag);
          });
        }
      }

      // 8. 执行目标页面专属内嵌业务逻辑脚本
      const scripts = doc.querySelectorAll('body script');
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        // 排除通用库与侧边栏自身
        if (!src) {
          const newScript = document.createElement('script');
          newScript.textContent = `(function(){\n${script.textContent}\n})();`;
          document.body.appendChild(newScript);
          setTimeout(() => newScript.remove(), 50);
        }
      });

      // 9. 渲染 Lucide 图标
      if (window.lucide) {
        window.lucide.createIcons();
      }

      // 10. 滚动回顶部
      window.scrollTo(0, 0);

    } catch (err) {
      console.warn('SPA 路由降级为原生跳转:', err);
      window.location.href = targetPath;
    }
  }

  function updateActiveMenuItem(currentPath) {
    let cleanPath = decodeURIComponent(currentPath).split('?')[0].split('#')[0];
    let filename = cleanPath.substring(cleanPath.lastIndexOf('/') + 1) || getCurrentFilename();
    if (filename === 'index.html') filename = 'roster.html';
    document.querySelectorAll('.app-sidebar-item').forEach(item => {
      const href = item.getAttribute('href');
      if (href && (filename === href || cleanPath.endsWith(href))) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  function initSidebar() {
    if (document.querySelector('.app-sidebar')) return;

    const currentFile = getCurrentFilename();

    // 1. 创建 Sidebar
    const sidebarEl = document.createElement('aside');
    sidebarEl.className = 'app-sidebar';

    const menuHtml = menuSections.map(sec => {
      const itemsHtml = sec.items.map(item => {
        const isActive = currentFile.endsWith(item.path);
        return `
          <a href="${item.path}" class="app-sidebar-item ${isActive ? 'active' : ''}">
            <i data-lucide="${item.icon}"></i>
            <span>${item.name}</span>
          </a>
        `;
      }).join('');

      return `
        <div class="app-sidebar-section">
          <div class="app-sidebar-section-title">${sec.category}</div>
          <div class="app-sidebar-section-items">${itemsHtml}</div>
        </div>
      `;
    }).join('');

    sidebarEl.innerHTML = `
      <div class="app-sidebar-brand">
        <div class="app-sidebar-brand-icon">
          <i data-lucide="graduation-cap" style="width: 20px; height: 20px;"></i>
        </div>
        <div>
          <div class="app-sidebar-brand-title">老师工作台</div>
        </div>
      </div>

      <nav class="app-sidebar-menu">
        ${menuHtml}
      </nav>

      <div class="app-sidebar-footer">
        <button class="app-sidebar-footer-btn" id="sidebar-btn-backup" title="导出本地数据备份文件 (JSON)">
          <i data-lucide="download" style="width: 15px; height: 15px;"></i>
          <span>数据备份</span>
        </button>

        <div class="app-sidebar-footer-divider"></div>

        <button class="app-sidebar-footer-btn" id="sidebar-btn-restore" title="导入数据备份">
          <i data-lucide="file-up" style="width: 15px; height: 15px;"></i>
          <span>导入备份</span>
        </button>
        <button class="app-sidebar-footer-btn" id="sidebar-btn-mock" title="导入系统预置模拟数据">
          <i data-lucide="sparkles" style="width: 15px; height: 15px;"></i>
          <span>导入模拟数据</span>
        </button>

        <div class="app-sidebar-footer-divider"></div>

        <button class="app-sidebar-footer-btn app-sidebar-footer-btn-danger" id="sidebar-btn-clear" title="清空全部本地业务数据">
          <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
          <span>清空数据</span>
        </button>
        <input type="file" id="sidebar-restore-file" accept=".json" style="display: none;" />
      </div>
    `;

    // 2. 包装内容至 .app-content
    if (!document.querySelector('.app-content')) {
      const contentEl = document.createElement('main');
      contentEl.className = 'app-content';
      while (document.body.firstChild) {
        contentEl.appendChild(document.body.firstChild);
      }
      document.body.appendChild(contentEl);
    }

    // 3. 挂载 Sidebar
    document.body.insertBefore(sidebarEl, document.body.firstChild);

    // 4. 绑定无刷新 SPA 拦截事件
    sidebarEl.addEventListener('click', (e) => {
      const link = e.target.closest('.app-sidebar-item');
      if (link) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          const targetFile = href.split('#')[0];
          const currentFile = getCurrentFilename();
          if (targetFile === currentFile) {
            e.preventDefault();
            return;
          }
          if (window.location.protocol === 'file:') {
            // file: 协议下交由原生 <a> 跳转，避免 JS 写入 location.href 引发沙箱告警
            return;
          }
          e.preventDefault();
          navigateTo(targetFile, true);
        }
      }
    });

    // 5. 监听浏览器前进/后退
    window.addEventListener('popstate', () => {
      if (window.location.protocol === 'file:') {
        return; // file: 协议下浏览器原生负责页面切换，不重复触发 navigateTo
      }
      const current = getCurrentFilename();
      navigateTo(current, false);
    });

    // 6. 绑定底部通用备份/导入事件
    const btnBackup = document.getElementById('sidebar-btn-backup');
    const btnRestore = document.getElementById('sidebar-btn-restore');
    const btnMock = document.getElementById('sidebar-btn-mock');
    const btnClear = document.getElementById('sidebar-btn-clear');
    const fileInput = document.getElementById('sidebar-restore-file');

    if (btnBackup) {
      btnBackup.onclick = () => {
        if (window.SchoolDB) {
          window.SchoolDB.exportJSON();
          if (window.showToast) window.showToast('已导出本地数据备份 JSON');
        }
      };
    }

    if (btnRestore && fileInput) {
      btnRestore.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            if (window.SchoolDB) {
              window.SchoolDB.importJSON(evt.target.result);
              if (window.showToast) window.showToast('备份恢复成功！');
            }
          } catch (err) {
            window.showAlert(err.message, '导入备份失败', 'danger');
          }
        };
        reader.readAsText(file);
        fileInput.value = '';
      };
    }

    if (btnMock) {
      btnMock.onclick = async () => {
        const confirmed = await window.showConfirm({
          title: '导入模拟数据',
          content: '确定要导入系统预置的模拟数据吗？现有的花名册、课表、日程与待办将被覆盖重置。',
          type: 'warning',
          confirmText: '确认导入'
        });
        if (confirmed) {
          if (window.SchoolDB) {
            window.SchoolDB.loadMockData();
            if (window.showToast) window.showToast('已成功导入模拟数据！');
          }
        }
      };
    }

    if (btnClear) {
      btnClear.onclick = async () => {
        const confirmed = await window.showConfirm({
          title: '清空全部数据',
          content: '确定要清空全部数据吗？清空后学生花名册、座位安排、课程排课、日程事件与待办清单都将被完全抹除。',
          type: 'danger',
          confirmText: '确认清空'
        });
        if (confirmed) {
          if (window.SchoolDB) {
            window.SchoolDB.clearAllData();
            if (window.showToast) window.showToast('已清空全部数据');
          }
        }
      };
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }

    initGlobalTooltip();
    checkAndShowDemoNotice();
    prefetchAllPages();
  }

  // 检查并弹出 Demo 测试版数据安全提醒 (首次进入会话触发)
  function checkAndShowDemoNotice() {
    if (window.__demoNoticeChecked) return;
    window.__demoNoticeChecked = true;

    const storageKey = 'teacher_demo_notice_dismissed_date';
    const sessionKey = 'teacher_demo_notice_shown_session';
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    try {
      const dismissedDate = localStorage.getItem(storageKey);
      if (dismissedDate === todayStr) {
        return; // 今日已勾选不再提醒
      }
      if (sessionStorage.getItem(sessionKey) === '1') {
        return; // 本次会话已提醒过
      }
      sessionStorage.setItem(sessionKey, '1');
    } catch (e) {
      console.warn('读取本地存储失败', e);
    }

    const btnBackupSidebar = document.getElementById('sidebar-btn-backup');
    let cutoutBox = null;

    // 创建真·Spotlight 镂空挖孔遮罩层 (目标按钮 100% 清晰透明无模糊)
    if (btnBackupSidebar) {
      const rect = btnBackupSidebar.getBoundingClientRect();
      const pad = 3;
      cutoutBox = document.createElement('div');
      cutoutBox.className = 'spotlight-cutout-box';
      cutoutBox.style.top = `${rect.top - pad}px`;
      cutoutBox.style.left = `${rect.left - pad}px`;
      cutoutBox.style.width = `${rect.width + pad * 2}px`;
      cutoutBox.style.height = `${rect.height + pad * 2}px`;
      document.body.appendChild(cutoutBox);
    }

    // 创建强制安全提醒模态框
    const noticeModal = document.createElement('div');
    noticeModal.className = 'modal-backdrop demo-notice-modal show';

    noticeModal.innerHTML = `
      <div class="modal-content">
        <div class="demo-notice-header">
          <div class="demo-notice-icon-box">
            <i data-lucide="info" style="width: 20px; height: 20px;"></i>
          </div>
          <div class="demo-notice-title">数据安全提示</div>
        </div>

        <div class="demo-notice-body">
          <div class="demo-notice-item">
            <span class="demo-notice-item-icon">📌</span>
            <div>工作台功能为Demo版，数据仅存放在浏览器本地</div>
          </div>
          <div class="demo-notice-item danger">
            <span class="demo-notice-item-icon">❌</span>
            <div><strong>请勿清空浏览器缓存</strong>，以免数据丢失</div>
          </div>
          <div class="demo-notice-item success">
            <span class="demo-notice-item-icon">✅</span>
            <div>请经常点击左下角【<strong>数据备份</strong>】导出备份</div>
          </div>
        </div>

        <div class="demo-notice-footer">
          <label class="demo-notice-checkbox-label">
            <input type="checkbox" id="demo-notice-dismiss-checkbox">
            <span>今日内不再提醒</span>
          </label>
          <button class="btn btn-primary" id="demo-notice-btn-confirm" style="font-size: 13px; padding: 7px 22px;">我知道了</button>
        </div>
      </div>
    `;

    document.body.appendChild(noticeModal);

    const checkbox = noticeModal.querySelector('#demo-notice-dismiss-checkbox');
    const btnConfirm = noticeModal.querySelector('#demo-notice-btn-confirm');

    const handleClose = () => {
      if (checkbox && checkbox.checked) {
        try {
          localStorage.setItem(storageKey, todayStr);
        } catch (e) {}
      }
      if (cutoutBox) {
        cutoutBox.style.opacity = '0';
        setTimeout(() => cutoutBox.remove(), 200);
      }
      noticeModal.classList.remove('show');
      setTimeout(() => {
        noticeModal.remove();
      }, 220);
    };

    if (btnConfirm) {
      btnConfirm.onclick = handleClose;
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // 全局即时悬浮 Tooltip 引擎 (无延迟平滑气泡)
  function initGlobalTooltip() {
    let tooltipEl = document.getElementById('app-instant-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'app-instant-tooltip';
      tooltipEl.className = 'app-instant-tooltip';
      document.body.appendChild(tooltipEl);
    }

    function positionTooltip(e) {
      const offset = 12;
      let x = e.clientX + offset;
      let y = e.clientY + offset;
      const rect = tooltipEl.getBoundingClientRect();
      if (x + rect.width > window.innerWidth - 10) {
        x = e.clientX - rect.width - 8;
      }
      if (y + rect.height > window.innerHeight - 10) {
        y = e.clientY - rect.height - 8;
      }
      tooltipEl.style.left = `${x}px`;
      tooltipEl.style.top = `${y}px`;
    }

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        const text = target.getAttribute('data-tooltip');
        if (text) {
          tooltipEl.textContent = text;
          tooltipEl.classList.add('visible');
          positionTooltip(e);
        }
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (tooltipEl.classList.contains('visible')) {
        positionTooltip(e);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        tooltipEl.classList.remove('visible');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }
})();
