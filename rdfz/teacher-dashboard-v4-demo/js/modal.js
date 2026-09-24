/**
 * 老师工作台 - 全局通用弹窗组件 (modal.js)
 * 纯净独立的对话框引擎，提供现代 Promise 风格的 showConfirm 与 showAlert
 */
(function(global) {
  function ensureModalDOM() {
    let modalRoot = document.getElementById('app-global-dialog-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'app-global-dialog-root';
      modalRoot.innerHTML = `
        <div class="modal-backdrop" id="app-dialog-backdrop" style="z-index: 3000;">
          <div class="modal-content" style="max-width: 420px; padding: 28px 24px; text-align: center; display: flex; flex-direction: column; align-items: center;">
            <!-- 顶部居中独立图标 -->
            <div id="app-dialog-icon-wrap" style="width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <i id="app-dialog-icon" data-lucide="alert-triangle" style="width: 26px; height: 26px;"></i>
            </div>
            
            <!-- 居中标题 -->
            <div id="app-dialog-title" style="font-size: 17px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;"></div>
            
            <!-- 居中说明文案 -->
            <div id="app-dialog-content" style="font-size: 13px; color: var(--text-sub); line-height: 1.6; margin-bottom: 24px; white-space: pre-wrap; word-break: break-word; text-align: left; max-height: 320px; overflow-y: auto; width: 100%;"></div>
            
            <!-- 底部居中操作按钮 -->
            <div style="display: flex; justify-content: center; gap: 10px; width: 100%;">
              <button class="btn btn-secondary" id="app-dialog-btn-cancel" style="flex: 1;">取消</button>
              <button class="btn btn-primary" id="app-dialog-btn-confirm" style="flex: 1;">确认</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalRoot);
    }
  }

  // 确认对话框
  global.showConfirm = function(options) {
    ensureModalDOM();
    const config = typeof options === 'string' ? { content: options } : (options || {});
    const {
      title = '操作确认',
      content = '',
      type = 'warning', // 'danger' | 'warning' | 'info'
      confirmText = '确认',
      cancelText = '取消'
    } = config;

    const backdrop = document.getElementById('app-dialog-backdrop');
    const titleEl = document.getElementById('app-dialog-title');
    const contentEl = document.getElementById('app-dialog-content');
    const iconWrap = document.getElementById('app-dialog-icon-wrap');
    const iconEl = document.getElementById('app-dialog-icon');
    const btnCancel = document.getElementById('app-dialog-btn-cancel');
    const btnConfirm = document.getElementById('app-dialog-btn-confirm');

    titleEl.textContent = title;
    if (content) {
      contentEl.textContent = content;
      contentEl.style.display = 'block';
      titleEl.style.marginBottom = '8px';
    } else {
      contentEl.textContent = '';
      contentEl.style.display = 'none';
      titleEl.style.marginBottom = '22px';
    }
    btnCancel.style.display = 'inline-flex';
    btnCancel.textContent = cancelText;
    btnConfirm.textContent = confirmText;

    if (type === 'danger') {
      iconWrap.style.background = 'var(--danger-light)';
      iconWrap.style.color = 'var(--danger)';
      iconEl.setAttribute('data-lucide', 'alert-circle');
      btnConfirm.className = 'btn btn-danger';
    } else if (type === 'warning') {
      iconWrap.style.background = 'var(--warning-light)';
      iconWrap.style.color = 'var(--warning)';
      iconEl.setAttribute('data-lucide', 'alert-triangle');
      btnConfirm.className = 'btn btn-primary';
    } else {
      iconWrap.style.background = 'var(--primary-light)';
      iconWrap.style.color = 'var(--primary)';
      iconEl.setAttribute('data-lucide', 'info');
      btnConfirm.className = 'btn btn-primary';
    }

    if (global.lucide) global.lucide.createIcons();
    backdrop.classList.add('show');

    return new Promise((resolve) => {
      const finish = (result) => {
        backdrop.classList.remove('show');
        btnCancel.onclick = null;
        btnConfirm.onclick = null;
        resolve(result);
      };
      btnCancel.onclick = () => finish(false);
      btnConfirm.onclick = () => finish(true);
    });
  };

  // 提示信息对话框
  global.showAlert = function(content, title = '提示', type = 'info') {
    ensureModalDOM();
    const backdrop = document.getElementById('app-dialog-backdrop');
    const titleEl = document.getElementById('app-dialog-title');
    const contentEl = document.getElementById('app-dialog-content');
    const iconWrap = document.getElementById('app-dialog-icon-wrap');
    const iconEl = document.getElementById('app-dialog-icon');
    const btnCancel = document.getElementById('app-dialog-btn-cancel');
    const btnConfirm = document.getElementById('app-dialog-btn-confirm');

    titleEl.textContent = title;
    contentEl.textContent = typeof content === 'string' ? content : JSON.stringify(content);
    btnCancel.style.display = 'none';
    btnConfirm.textContent = '我知道了';
    btnConfirm.className = 'btn btn-primary';

    if (type === 'danger') {
      iconWrap.style.background = 'var(--danger-light)';
      iconWrap.style.color = 'var(--danger)';
      iconEl.setAttribute('data-lucide', 'alert-circle');
    } else {
      iconWrap.style.background = 'var(--primary-light)';
      iconWrap.style.color = 'var(--primary)';
      iconEl.setAttribute('data-lucide', 'info');
    }

    if (global.lucide) global.lucide.createIcons();
    backdrop.classList.add('show');

    return new Promise((resolve) => {
      btnConfirm.onclick = () => {
        backdrop.classList.remove('show');
        btnConfirm.onclick = null;
        resolve(true);
      };
    });
  };

  // 全局 Toast 轻量提示组件
  global.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    const iconName = type === 'success' ? 'check-circle-2' : (type === 'error' ? 'alert-circle' : 'info');
    const iconColor = type === 'success' ? 'var(--primary)' : (type === 'error' ? 'var(--danger)' : '#3B82F6');
    toast.innerHTML = `<i data-lucide="${iconName}" style="color: ${iconColor}; width: 18px; height: 18px;"></i><span>${message}</span>`;
    container.appendChild(toast);
    if (global.lucide) global.lucide.createIcons();
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 2600);
  };
})(window);
