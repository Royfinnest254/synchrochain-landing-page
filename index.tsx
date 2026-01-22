import React from 'react';
import ReactDOM from 'react-dom/client';

// Show debug info on mount failure
function showMountError(error: unknown) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; background: #0a0a0b; color: white; padding: 40px; font-family: system-ui;">
        <h1 style="color: #f87171; margin-bottom: 16px;">Failed to initialize application</h1>
        <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
          The application encountered an error during startup.
        </p>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px;">
          <pre style="margin: 0; font-family: monospace; color: #fca5a5; white-space: pre-wrap; word-break: break-word;">
${error instanceof Error ? error.message + '\n\n' + error.stack : String(error)}
          </pre>
        </div>
        <button onclick="window.location.reload()" style="margin-top: 24px; padding: 12px 24px; background: white; color: black; border: none; border-radius: 9999px; cursor: pointer; font-weight: 500;">
          Reload Page
        </button>
      </div>
    `;
  }
  console.error('Mount error:', error);
}

async function initApp() {
  try {
    console.log('[SynchroChain] Starting app initialization...');

    // Dynamically import to catch any module-level errors
    const [{ default: App }, { default: ErrorBoundary }] = await Promise.all([
      import('./App'),
      import('./components/ErrorBoundary')
    ]);

    console.log('[SynchroChain] Modules loaded successfully');

    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Could not find root element to mount to");
    }

    console.log('[SynchroChain] Creating React root...');
    const root = ReactDOM.createRoot(rootElement);

    console.log('[SynchroChain] Rendering app...');
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );

    console.log('[SynchroChain] Render called successfully');
  } catch (error) {
    console.error('[SynchroChain] Critical error during initialization:', error);
    showMountError(error);
  }
}

initApp();
