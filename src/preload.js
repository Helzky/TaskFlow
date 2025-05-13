const { contextBridge, ipcRenderer } = require('electron');

// expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
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
    // play a sound file from our assets
    playSound: (soundName) => {
      const audio = new Audio(`../assets/sounds/${soundName}.mp3`);
      audio.play();
    }
  }
});
