const { contextBridge, ipcRenderer } = require('electron');

// expose apis to renderer
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
    // todo: add helper stuff here
  }
  // might add more apis later
});
