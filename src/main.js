const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

// initialize data storage
const store = new Store();

class TaskFlowApp {
  constructor() {
    this.mainWindow = null;
    this.init();
  }

  init() {
    // app event listeners
    app.on('ready', this.createWindow.bind(this));
    
    app.on('window-all-closed', () => {
      // on macOS it's common to keep the app running until explicitly quit
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
    
    app.on('activate', () => {
      // on macOS it's common to re-create a window when the dock icon is clicked
      if (this.mainWindow === null) {
        this.createWindow();
      }
    });
    
    // setup IPC listeners
    this.setupIpcListeners();
  }
  
  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      },
      // modern, sleek appearance
      backgroundColor: '#f8f9fa',
      show: false, // we'll show once ready for smoother UX
      icon: path.join(__dirname, 'assets/icons/app-icon.png'),
    });
    
    // load the index.html file
    this.mainWindow.loadFile(path.join(__dirname, 'index.html'));
    
    // open DevTools in development mode
    // this.mainWindow.webContents.openDevTools();
    
    // show window when ready to avoid flickering
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });
    
    // handle window close
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }
  
  setupIpcListeners() {
    // handle task creation
    ipcMain.handle('tasks:get', () => {
      return store.get('tasks', []);
    });
    
    ipcMain.handle('tasks:add', (event, task) => {
      const tasks = store.get('tasks', []);
      const newTask = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...task
      };
      
      store.set('tasks', [...tasks, newTask]);
      return newTask;
    });
    
    ipcMain.handle('tasks:update', (event, updatedTask) => {
      const tasks = store.get('tasks', []);
      const updatedTasks = tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      
      store.set('tasks', updatedTasks);
      return updatedTask;
    });
    
    ipcMain.handle('tasks:delete', (event, taskId) => {
      const tasks = store.get('tasks', []);
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      
      store.set('tasks', filteredTasks);
      return taskId;
    });
    
    // handle focus mode toggle
    ipcMain.handle('focus-mode:toggle', (event, enabled) => {
      // in a real implementation, this would interact with OS to close apps
      // for the prototype we'll just track the state
      store.set('focusMode', enabled);
      return enabled;
    });
  }
}

// initialize application
new TaskFlowApp();
