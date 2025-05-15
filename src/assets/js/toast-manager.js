// popup notifications
class ToastManager {
  constructor(soundManager) {
    this.soundManager = soundManager;
    this.toastContainer = null;
    this.createToastContainer();
  }
  
  // create container if needed
  createToastContainer() {
    if (this.toastContainer) return;
    
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';
    document.body.appendChild(this.toastContainer);
  }
  
  // display notification
  show(title, message, type = 'success', playSound = true) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate__animated animate__fadeInUp`;
    
    toast.innerHTML = `
      <div class="toast-header">
        <h4>${title}</h4>
        <button class="toast-close">&times;</button>
      </div>
      <div class="toast-body">
        <p>${message}</p>
      </div>
    `;
    
    this.toastContainer.appendChild(toast);
    
    // sound disabled for now
    if (playSound && this.soundManager) {
      this.soundManager.play('notification', true);
    }
    
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
      this.removeToast(toast);
    });
    
    // auto hide after 4s
    setTimeout(() => {
      this.removeToast(toast);
    }, 4000);
  }
  
  // animate out and remove
  removeToast(toast) {
    // skip if already going away
    if (toast.classList.contains('animate__fadeOutDown')) return;
    
    toast.classList.remove('animate__fadeInUp');
    toast.classList.add('animate__fadeOutDown');
    
    // remove from dom when animation done
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
  
  // green success notification
  success(title, message) {
    this.show(title, message, 'success', true);
  }
  
  // red error notification
  error(title, message) {
    this.show(title, message, 'error', true);
  }
  
  // blue info notification
  info(title, message) {
    this.show(title, message, 'info', true);
  }
}

// for imports
module.exports = ToastManager;
