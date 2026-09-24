/**
 * SoulAgent v1 - 全局轻量 Toast 提示组件 (components/toast.js)
 */
(function (global) {
  function showToast(message, type = 'success') {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.className = 'toast-notification';
      toast.innerHTML = `
        <svg class="icon toast-icon" viewBox="0 0 24 24" style="width:16px;height:16px;stroke:#10b981;">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span id="toast-message" style="font-size:13px;font-weight:500;color:#1e293b;"></span>
      `;
      document.body.appendChild(toast);
    }

    const msgEl = toast.querySelector('#toast-message');
    if (msgEl) msgEl.innerText = message;

    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // 注入基础 CSS
  const style = document.createElement('style');
  style.textContent = `
    .toast-notification {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: #ffffff;
      padding: 10px 18px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 99999;
      opacity: 0;
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast-notification.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
      pointer-events: auto;
    }
  `;
  document.head.appendChild(style);

  global.Toast = { show: showToast };
  global.showToast = showToast;
})(window);
