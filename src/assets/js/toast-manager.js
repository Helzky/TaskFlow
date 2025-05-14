// handles toast notifications
class ToastManager {
  constructor(soundManager) {
    this.soundManager = soundManager;
    this.toastContainer = null;
    this.createToastContainer();
  }
  
  // make toast container
  createToastContainer() {
    if (this.toastContainer) return;
    
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';
    document.body.appendChild(this.toastContainer);
  }
  
  // show a toast
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
    
    // sound if enabled
    if (playSound && this.soundManager) {
      this.soundManager.play('notification', true);
    }
    

    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
      this.removeToast(toast);
    });
    
    // auto remove
    setTimeout(() => {
      this.removeToast(toast);
    }, 4000);
  }
  
  // remove with animation
  removeToast(toast) {
    // bail if already removing
    if (toast.classList.contains('animate__fadeOutDown')) return;
    

    toast.classList.remove('animate__fadeInUp');
    toast.classList.add('animate__fadeOutDown');
    

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
  
  // success toast
  success(title, message) {
    this.show(title, message, 'success', true);
  }
  
  // error toast
  error(title, message) {
    this.show(title, message, 'error', true);
  }
  
  // info toast
  info(title, message) {
    this.show(title, message, 'info', true);
  }
}

// export
module.exports = ToastManager;
