const { app, BrowserWindow, BrowserView, ipcMain, session } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    title: "WebNet",
    autoHideMenuBar: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  // 1. SECURITY: Block dangerous permissions globally
  session.defaultSession.setPermissionCheckHandler(() => false); 

  const shellHtml = `
    <!DOCTYPE html>
    <html style="margin:0; padding:0; overflow:hidden; font-family: sans-serif;">
      <div id="nav-bar" style="height: 50px; background: #1e293b; display: flex; align-items: center; padding: 0 15px; gap: 10px; border-bottom: 1px solid #334155;">
        <button onclick="ipc.send('go-back')" style="background:none; border:none; color:white; cursor:pointer;">⬅</button>
        <button onclick="ipc.send('reload')" style="background:none; border:none; color:white; cursor:pointer;">⟳</button>
        <input type="text" id="url-input" placeholder="Search WebNet..." style="flex:1; padding: 8px 15px; border-radius: 20px; border:none; background:#0f172a; color:white; outline:none;">
        <button id="incog-btn" onclick="ipc.send('toggle-incognito')" style="background:#475569; border:none; color:white; padding: 5px 10px; border-radius: 5px; cursor:pointer; font-size:12px;">Normal Mode</button>
      </div>
      <script>
        const { ipcRenderer } = require('electron');
        window.ipc = ipcRenderer;
        const input = document.getElementById('url-input');
        const btn = document.getElementById('incog-btn');

        input.onkeydown = (e) => { if (e.key === 'Enter') ipcRenderer.send('load-url', input.value); };
        ipcRenderer.on('url-changed', (e, url) => { input.value = url; });
        ipcRenderer.on('mode-changed', (e, mode) => { 
            btn.innerText = mode; 
            btn.style.background = mode === 'Incognito' ? '#7c3aed' : '#475569';
        });
      </script>
    </html>
  `;

  win.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(shellHtml)}`);

  // 2. Setup the Views (Normal and Incognito)
  let isIncognito = false;
  const normalView = new BrowserView({
    webPreferences: { partition: 'persist:main' } // Saves cache/cookies
  });
  const incognitoView = new BrowserView({
    webPreferences: { partition: 'incognito' } // Temporary (In-memory only)
  });

  let currentView = normalView;
  win.setBrowserView(currentView);
  currentView.setBounds({ x: 0, y: 50, width: 1280, height: 750 });
  currentView.setAutoResize({ width: true, height: true });
  currentView.webContents.loadURL('https://duckduckgo.com');

  // Handle Logic
  ipcMain.on('load-url', (event, val) => {
    const url = (val.includes('.') && !val.includes(' ')) 
      ? (val.startsWith('http') ? val : 'https://' + val)
      : "https://duckduckgo.com" + encodeURIComponent(val) + "&rpl=1&kp=1&ia=web";
    currentView.webContents.loadURL(url);
  });

  ipcMain.on('toggle-incognito', () => {
    isIncognito = !isIncognito;
    win.removeBrowserView(currentView);
    currentView = isIncognito ? incognitoView : normalView;
    win.setBrowserView(currentView);
    currentView.setBounds({ x: 0, y: 50, width: 1280, height: 750 });
    
    if (!currentView.webContents.getURL()) {
        currentView.webContents.loadURL('https://duckduckgo.com');
    }
    
    win.webContents.send('mode-changed', isIncognito ? 'Incognito' : 'Normal Mode');
  });

  ipcMain.on('go-back', () => currentView.webContents.goBack());
  ipcMain.on('reload', () => currentView.webContents.reload());

  // Security: Block pop-ups and new windows
  [normalView, incognitoView].forEach(v => {
    v.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    v.webContents.on('did-navigate', (e, url) => win.webContents.send('url-changed', url));
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
