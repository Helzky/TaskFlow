const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

// storage
const store = new Store();

class TaskFlowApp {
  constructor() {
    this.mainWindow = null;
    
    // init
    this.init();
  }

  init() {
    // app events
    app.on('ready', this.createWindow.bind(this));
    
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
    
    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createWindow();
      }
    });
    
    // setup ipc
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
      // nice look
      backgroundColor: '#f8f9fa',
      show: false, // we'll show once ready for smoother UX
      icon: path.join(__dirname, 'assets/icons/app-icon.png'),
    });
    
    
    this.mainWindow.loadFile(path.join(__dirname, 'index.html'));
    
    // this.mainWindow.webContents.openDevTools();
    
    // avoid flicker
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });
    
    
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }
  
  setupIpcListeners() {
    
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
    
    
    ipcMain.handle('focus-mode:toggle', (event, enabled) => {
      // just track state for now
      store.set('focusMode', enabled);
      return enabled;
    });
  }
  

}

// go
new TaskFlowApp();
