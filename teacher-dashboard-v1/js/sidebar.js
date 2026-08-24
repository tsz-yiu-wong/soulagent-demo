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

  function getCurrentFilename() {
    const rawPath = decodeURIComponent(window.location.pathname);
    const fname = rawPath.substring(rawPath.lastIndexOf('/') + 1);
    return (!fname || fname === 'index.html') ? 'roster.html' : fname;
  }

  // SPA 无刷新路由切换核心函数
  async function navigateTo(targetPath, pushToHistory = true) {
    try {
      const response = await fetch(targetPath);
      if (!response.ok) throw new Error('页面加载失败');
      const htmlText = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // 1. 更新标题
      if (doc.title) {
        document.title = doc.title;
      }

      // 2. 收集并更新当前页专属内联 <style>
      const oldDynamicStyles = document.querySelectorAll('style[data-page-style]');
      oldDynamicStyles.forEach(s => s.remove());

      const newStyles = doc.querySelectorAll('head style');
      newStyles.forEach(styleEl => {
        const clonedStyle = document.createElement('style');
        clonedStyle.setAttribute('data-page-style', 'true');
        clonedStyle.textContent = styleEl.textContent;
        document.head.appendChild(clonedStyle);
      });

      // 3. 提取目标页面的主体内容并置换
      const contentEl = document.querySelector('.app-content');
      if (contentEl) {
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

      // 4. 更新侧边栏高亮状态
      updateActiveMenuItem(targetPath);

      // 5. 更新浏览器历史
      if (pushToHistory) {
        window.history.pushState({ path: targetPath }, '', targetPath);
      }

      // 6. 执行目标页面专属内嵌业务逻辑脚本
      const scripts = doc.querySelectorAll('body script');
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        // 排除通用库与侧边栏自身
        if (!src) {
          const newScript = document.createElement('script');
          newScript.textContent = script.textContent;
          document.body.appendChild(newScript);
          setTimeout(() => newScript.remove(), 50);
        }
      });

      // 7. 渲染 Lucide 图标
      if (window.lucide) {
        window.lucide.createIcons();
      }

      // 8. 滚动回顶部
      window.scrollTo(0, 0);

    } catch (err) {
      console.warn('SPA 路由降级为原生跳转:', err);
      window.location.href = targetPath;
    }
  }

  function updateActiveMenuItem(currentPath) {
    let cleanPath = decodeURIComponent(currentPath).split('?')[0].split('#')[0];
    const filename = cleanPath.substring(cleanPath.lastIndexOf('/') + 1) || getCurrentFilename();
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
        <button class="app-sidebar-footer-btn" id="sidebar-btn-backup" title="导出数据备份">
          <i data-lucide="download" style="width: 15px; height: 15px;"></i>
          <span>导出备份</span>
        </button>
        <button class="app-sidebar-footer-btn" id="sidebar-btn-restore" title="导入数据备份">
          <i data-lucide="file-up" style="width: 15px; height: 15px;"></i>
          <span>导入备份</span>
        </button>
        
        <div class="app-sidebar-footer-divider"></div>

        <button class="app-sidebar-footer-btn" id="sidebar-btn-mock" title="导入系统预置模拟数据">
          <i data-lucide="sparkles" style="width: 15px; height: 15px;"></i>
          <span>导入模拟数据</span>
        </button>
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
          e.preventDefault();
          const targetFile = href.split('#')[0];
          if (targetFile !== getCurrentFilename()) {
            navigateTo(targetFile, true);
          }
        }
      }
    });

    // 5. 监听浏览器前进/后退
    window.addEventListener('popstate', () => {
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
