export function injectStyles(themeColor: string = '#f59e0b') {
  // Check if style already exists
  if (document.getElementById('trip-express-widget-styles')) return;

  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);

  const style = document.createElement('style');
  style.id = 'trip-express-widget-styles';
  style.textContent = `
    .tx-widget-container {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-sizing: border-box;
      width: 100%;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @media (prefers-color-scheme: dark) {
      .tx-widget-container {
        background: rgba(20, 20, 20, 0.95);
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
      }
    }
    
    .tx-widget-container * {
      box-sizing: border-box;
    }
    
    .tx-tabs-list {
      display: flex;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 8px;
      padding: 4px;
      margin-bottom: 20px;
    }
    
    @media (prefers-color-scheme: dark) {
      .tx-tabs-list {
        background: rgba(255, 255, 255, 0.06);
      }
    }
    
    .tx-tab-trigger {
      flex: 1;
      border: none;
      background: transparent;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      color: #71717a;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
    }
    
    .tx-tab-trigger.active {
      background: #ffffff;
      color: #09090b;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    @media (prefers-color-scheme: dark) {
      .tx-tab-trigger.active {
        background: #27272a;
        color: #fafafa;
      }
    }

    .tx-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }
    
    @media (min-width: 768px) {
      .tx-grid {
        grid-template-columns: 2fr 1fr 1fr;
      }
    }
    
    .tx-input-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .tx-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #71717a;
      letter-spacing: 0.05em;
    }
    
    .tx-field-wrapper {
      position: relative;
    }
    
    .tx-select, .tx-input {
      width: 100%;
      height: 48px;
      padding: 0 16px;
      background: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      color: #09090b;
      appearance: none;
      cursor: pointer;
      transition: all 0.2s;
      outline: none;
    }
    
    @media (prefers-color-scheme: dark) {
      .tx-select, .tx-input {
        background: #18181b;
        border-color: #27272a;
        color: #fafafa;
      }
    }
    
    .tx-select:focus, .tx-input:focus {
      border-color: ${themeColor};
      box-shadow: 0 0 0 2px ${themeColor}20;
    }
    
    .tx-chevron {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      width: 16px;
      height: 16px;
      stroke: #71717a;
    }
    
    .tx-route-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f4f4f5;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      padding: 12px 16px;
    }
    
    @media (prefers-color-scheme: dark) {
      .tx-route-box {
        background: #18181b;
        border-color: #27272a;
      }
    }
    
    .tx-route-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .tx-swap-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid #e4e4e7;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      transition: all 0.2s;
    }
    
    @media (prefers-color-scheme: dark) {
      .tx-swap-btn {
        background: #27272a;
        border-color: #3f3f46;
      }
    }
    
    .tx-swap-btn:hover {
      transform: rotate(180deg);
      border-color: ${themeColor};
    }
    
    .tx-search-btn {
      width: 100%;
      height: 48px;
      background: ${themeColor};
      border: none;
      border-radius: 10px;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px ${themeColor}40;
      transition: all 0.2s;
      margin-top: 8px;
    }
    
    .tx-search-btn:hover {
      opacity: 0.95;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px ${themeColor}60;
    }
    
    .tx-search-btn:active {
      transform: translateY(0);
    }
    
    .tx-date-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
  `;
  document.head.appendChild(style);
}
