/**
 * 老师工作台 - 极简 AI 助手模块 (js/ai-assistant.js)
 * Siri 风格灵动悬浮球 + Q弹果冻液态毛玻璃底部输入框
 */

(function () {
  'use strict';

  class AIAssistant {
    constructor() {
      this.isOpen = false;
      this.isAnimating = false;
      this.init();
    }

    init() {
      if (document.getElementById('ai-assistant-container')) return;
      this.createDOM();
      this.bindEvents();
    }

    createDOM() {
      const container = document.createElement('div');
      container.id = 'ai-assistant-container';

      container.innerHTML = `
        <!-- 右下角 Siri 灵动悬浮球 (无额外文字提示) -->
        <button class="ai-assistant-fab" id="ai-fab" aria-label="AI 助手">
          <div class="ai-assistant-fab-glow"></div>
          <div class="ai-assistant-fab-ring"></div>
          <div class="ai-assistant-fab-core">
            <div class="ai-assistant-fab-icon-wrap">
              <svg class="ai-assistant-fab-sparkle" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.2 8.3L20.5 10.5L14.2 12.7L12 19L9.8 12.7L3.5 10.5L9.8 8.3L12 2Z" />
                <path d="M19 16L20 19L23 20L20 21L19 24L18 21L15 20L18 19L19 16Z" opacity="0.85" />
                <path d="M6 3L6.8 5.2L9 6L6.8 6.8L6 9L5.2 6.8L3 6L5.2 5.2L6 3Z" opacity="0.85" />
              </svg>
            </div>
          </div>
        </button>

        <!-- 屏幕下方极简液态毛玻璃输入卡片 (无遮罩) -->
        <div class="ai-minimal-dock" id="ai-dock" role="dialog">
          <div class="ai-minimal-glass-card">
            <!-- 自适应多行文本输入区域 -->
            <textarea 
              class="ai-minimal-textarea" 
              id="ai-input" 
              rows="1" 
              placeholder="发送消息给SoulAgent..."
            ></textarea>
            
            <!-- 底部纯净工具栏：置左附件，置右发送 -->
            <div class="ai-minimal-toolbar">
              <!-- 置左附件按钮 (📎) -->
              <input type="file" id="ai-file-input" style="display: none;" multiple>
              <button class="ai-minimal-btn-attach" id="ai-btn-attach" title="上传附件/参考文件">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                </svg>
              </button>

              <!-- 置右发送按钮 (↑) -->
              <button class="ai-minimal-btn-send" id="ai-btn-send" title="发送 (Enter)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(container);

      this.fab = document.getElementById('ai-fab');
      this.dock = document.getElementById('ai-dock');
      this.input = document.getElementById('ai-input');
      this.sendBtn = document.getElementById('ai-btn-send');
      this.attachBtn = document.getElementById('ai-btn-attach');
      this.fileInput = document.getElementById('ai-file-input');
    }

    bindEvents() {
      // 1. 点击右下角 FAB 切换
      this.fab.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      // 2. 阻止输入卡片内部点击冒泡
      this.dock.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // 3. 点击外部区域收起
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.dock.contains(e.target) && !this.fab.contains(e.target)) {
          this.close();
        }
      });

      // 4. ESC 键收起
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // 5. 动态自适应高度与 Enter 发送
      this.input.addEventListener('input', () => {
        this.adjustTextareaHeight();
      });

      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSend();
        }
      });

      // 6. 附件上传交互
      this.attachBtn.addEventListener('click', () => {
        this.fileInput.click();
      });

      this.fileInput.addEventListener('change', () => {
        const files = Array.from(this.fileInput.files);
        if (files.length > 0) {
          const fileNames = files.map(f => f.name).join('、');
          const currentText = this.input.value.trim();
          this.input.value = currentText ? `${currentText}\n[附件: ${fileNames}] ` : `[附件: ${fileNames}] `;
          this.adjustTextareaHeight();
          this.input.focus();
        }
      });

      // 7. 发送按钮
      this.sendBtn.addEventListener('click', () => {
        this.handleSend();
      });
    }

    adjustTextareaHeight() {
      this.input.style.height = 'auto';
      this.input.style.height = Math.min(this.input.scrollHeight, 130) + 'px';
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      if (this.isAnimating) return;
      this.isOpen = true;
      this.fab.classList.add('active');
      this.dock.classList.remove('closing');
      this.dock.classList.add('show');
      setTimeout(() => {
        this.input.focus();
      }, 150);
    }

    close() {
      if (!this.isOpen || this.isAnimating) return;
      this.isOpen = false;
      this.fab.classList.remove('active');
      this.dock.classList.remove('show');
      this.dock.classList.add('closing');
      this.isAnimating = true;

      setTimeout(() => {
        this.dock.classList.remove('closing');
        this.isAnimating = false;
      }, 350);
    }

    handleSend() {
      const text = this.input.value.trim();
      if (!text) return;

      // 发送动画微反馈
      this.sendBtn.style.transform = 'scale(0.85)';
      setTimeout(() => {
        this.sendBtn.style.transform = '';
      }, 150);

      // 清空输入并收起
      this.input.value = '';
      this.adjustTextareaHeight();
      this.close();
    }
  }

  // 页面就绪后立即初始化单例
  function setupAIAssistant() {
    if (!window.__aiAssistantInstance) {
      window.__aiAssistantInstance = new AIAssistant();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAIAssistant);
  } else {
    setupAIAssistant();
  }
})();
