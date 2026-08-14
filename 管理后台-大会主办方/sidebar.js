(function() {
  // 注入侧边栏 CSS 样式
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --sidebar-width: 190px;
    }

    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #f6f8fa !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      display: flex !important;
    }

    /* 侧边栏容器 */
    .admin-sidebar {
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      height: 100vh;
      background: #ffffff;
      border-right: 1px solid #e5e7eb;
      position: fixed;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      z-index: 100;
      padding: 24px 14px;
      box-sizing: border-box;
    }

    .admin-brand {
      display: flex;
      align-items: center;
      padding: 0 4px 20px 4px;
      border-bottom: 1px solid #f3f4f6;
      margin-bottom: 20px;
    }

    .admin-brand-title {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.3px;
      white-space: nowrap;
    }

    .admin-menu {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .admin-menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 10px;
      color: #4b5563;
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .admin-menu-item:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .admin-menu-item.active {
      background: #eff6ff;
      color: #2563eb;
      font-weight: 600;
    }

    .admin-menu-item svg {
      width: 17px;
      height: 17px;
      flex-shrink: 0;
      color: #6b7280;
      transition: color 0.2s;
    }

    .admin-menu-item.active svg {
      color: #2563eb;
    }

    .admin-menu-item:hover svg {
      color: #111827;
    }

    /* 主主体区域包装器 */
    .admin-main-wrapper {
      margin-left: var(--sidebar-width);
      flex: 1;
      padding: 40px 32px;
      min-width: 0;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
    }

    .admin-main-wrapper > .container {
      width: 100%;
      max-width: 960px;
    }
  `;
  document.head.appendChild(style);

  // 顶级一级菜单项
  const menuItems = [
    {
      key: 'dashboard.html',
      name: '数据看板',
      subPages: ['dashboard.html'],
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`
    },
    {
      key: 'event-mgmt.html',
      name: '活动管理',
      subPages: ['event-mgmt.html', 'forum-mgmt.html', 'agenda.html', 'transcript-mgmt.html', ''],
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
    },
    {
      key: 'recommend-q.html',
      name: '推荐问管理',
      subPages: ['recommend-q.html'],
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
    },
    {
      key: 'permission-mgmt.html',
      name: '权限管理',
      subPages: ['permission-mgmt.html'],
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
    }
  ];

  // 计算当前路径匹配
  const pathname = window.location.pathname;
  let currentFile = pathname.substring(pathname.lastIndexOf('/') + 1) || 'event-mgmt.html';

  function initSidebar() {
    if (document.querySelector('.admin-sidebar')) return;

    // 1. 创建 Sidebar 节点
    const sidebarEl = document.createElement('aside');
    sidebarEl.className = 'admin-sidebar';

    const menuHtml = menuItems.map(item => {
      const isActive = item.subPages.includes(currentFile);
      return `
        <a href="${item.key}" class="admin-menu-item ${isActive ? 'active' : ''}">
          ${item.icon}
          <span>${item.name}</span>
        </a>
      `;
    }).join('');

    sidebarEl.innerHTML = `
      <div class="admin-brand">
        <span class="admin-brand-title">SoulAgent 管理后台</span>
      </div>
      <nav class="admin-menu">
        ${menuHtml}
      </nav>
    `;

    // 2. 包装 Body 内现有节点至 .admin-main-wrapper
    const mainWrapper = document.createElement('main');
    mainWrapper.className = 'admin-main-wrapper';

    while (document.body.firstChild) {
      mainWrapper.appendChild(document.body.firstChild);
    }

    document.body.appendChild(sidebarEl);
    document.body.appendChild(mainWrapper);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }
})();
