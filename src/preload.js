const { contextBridge, ipcRenderer } = require('electron');

// expose safe ipc methods
contextBridge.exposeInMainWorld('api', {
  tasks: {
    getAll: () => ipcRenderer.invoke('tasks:get'),
    add: (task) => ipcRenderer.invoke('tasks:add', task),
    update: (task) => ipcRenderer.invoke('tasks:update', task),
    delete: (taskId) => ipcRenderer.invoke('tasks:delete', taskId)
  },
  focusMode: {
    toggle: (enabled) => ipcRenderer.invoke('focus-mode:toggle', enabled)
  },
  utils: {
    // for later
  },
  // more stuff later
});
