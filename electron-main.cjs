const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const AdmZip = require('adm-zip');

// --- NATIVE SYSTEM AUTHORITY ---
const SYSTEM_CONFIG = {
  workspace: path.join(os.homedir(), 'JaniAI_Workspace'),
  logs: path.join(os.homedir(), 'JaniAI_Logs')
};

// Ensure directories exist
[SYSTEM_CONFIG.workspace, SYSTEM_CONFIG.logs].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "JANI AI - NATIVE NEURAL CORE",
    backgroundColor: '#000000',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Allows local file access
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  win.once('ready-to-show', () => {
    win.show();
    win.maximize();
  });

  // Handle system-level requests from the AI
  ipcMain.on('system-command', async (event, { command, args, payload }) => {
    console.log(`[SYSTEM] Executing: ${command}`);
    
    switch (command) {
      case 'OPEN_APP':
        // Direct Windows execution
        exec(`start "" "${args.appName}"`, (err) => {
          event.reply('system-reply', { success: !err, error: err?.message });
        });
        break;

      case 'WRITE_CODE':
        const filePath = path.join(SYSTEM_CONFIG.workspace, args.filename);
        fs.writeFileSync(filePath, payload);
        // Automatically open in VS Code after writing
        exec(`code "${filePath}"`);
        event.reply('system-reply', { success: true, path: filePath });
        break;

      case 'RUN_SHELL':
        exec(payload, (err, stdout, stderr) => {
          event.reply('system-reply', { success: !err, stdout, stderr });
        });
        break;

      case 'GET_FILES':
        const files = fs.readdirSync(args.path || SYSTEM_CONFIG.workspace);
        event.reply('system-reply', { success: true, files });
        break;

      case 'EXTRACT_ZIP':
        try {
          const { zipPath, targetDir } = args;
          const zip = new AdmZip(zipPath);
          const extractPath = targetDir || path.join(SYSTEM_CONFIG.workspace, path.basename(zipPath, '.zip'));
          
          if (!fs.existsSync(extractPath)) {
            fs.mkdirSync(extractPath, { recursive: true });
          }

          zip.extractAllTo(extractPath, true);
          event.reply('system-reply', { success: true, path: extractPath });
        } catch (err) {
          event.reply('system-reply', { success: false, message: err.message });
        }
        break;

      case 'BUILD_APP':
        try {
          const { projectPath, appName } = args;
          const buildDir = path.join(os.homedir(), 'JaniAI_Builds', appName || 'NewApp');
          
          if (!fs.existsSync(path.dirname(buildDir))) {
            fs.mkdirSync(path.dirname(buildDir), { recursive: true });
          }

          console.log(`[BUILD] Starting build for ${appName} in ${projectPath}`);
          
          const buildProcess = spawn('npm', ['run', 'electron:build'], {
            cwd: projectPath,
            shell: true
          });

          buildProcess.stdout.on('data', (data) => console.log(`[BUILD STDOUT] ${data}`));
          buildProcess.stderr.on('data', (data) => console.log(`[BUILD STDERR] ${data}`));

          buildProcess.on('close', (code) => {
            if (code === 0) {
              event.reply('system-reply', { success: true, message: `Build complete for ${appName}. Check the dist folder in ${projectPath}` });
            } else {
              event.reply('system-reply', { success: false, message: `Build failed with code ${code}` });
            }
          });
        } catch (err) {
          event.reply('system-reply', { success: false, message: err.message });
        }
        break;
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
