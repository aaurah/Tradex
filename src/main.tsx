import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (renderError) {
    console.error('[Tradex App Mount Error]:', renderError);
    rootElement.innerHTML = `
      <div style="min-height:100vh;background:#050505;color:#E0E0E0;display:flex;align-items:center;justify-content:center;font-family:sans-serif;padding:24px;">
        <div style="max-width:440px;background:#0e0e0e;border:1px solid #222;border-radius:16px;padding:32px;text-align:center;">
          <h2 style="color:#00FF41;font-size:20px;font-weight:900;margin-bottom:12px;">Tradex Sovereign Terminal</h2>
          <p style="font-size:13px;color:#888;margin-bottom:20px;line-height:1.5;">Initializing terminal interface...</p>
          <button onclick="window.location.reload()" style="background:#00FF41;color:#000;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;">
            Reload View
          </button>
        </div>
      </div>
    `;
  }
}
