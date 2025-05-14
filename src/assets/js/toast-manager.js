/**
 * Toast Notification Manager for TaskFlow Application
 * Manages displaying toast notifications with sound effects
 */
class ToastManager {
  constructor(soundManager) {
    this.soundManager = soundManager;
    this.toastContainer = null;
    this.createToastContainer();
  }
  
  /**
   * Create a container for toast notifications
   */
  createToastContainer() {
    if (this.toastContainer) return;
    
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';
    document.body.appendChild(this.toastContainer);
  }
  
  /**
   * Show a toast notification
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {string} type - Toast type: 'success', 'error', 'info'
   * @param {boolean} playSound - Whether to play a sound
   */
  show(title, message, type = 'success', playSound = true) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate__animated animate__fadeInUp`;
    
    // Set toast content
    toast.innerHTML = `
      <div class="toast-header">
        <h4>${title}</h4>
        <button class="toast-close">&times;</button>
      </div>
      <div class="toast-body">
        <p>${message}</p>
      </div>
    `;
    
    // Add to container
    this.toastContainer.appendChild(toast);
    
    // Play sound effect if enabled
    if (playSound && this.soundManager) {
      this.soundManager.play('notification', true);
    }
    
    // Add close button functionality
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
      this.removeToast(toast);
    });
    
    // Auto-remove after delay
    setTimeout(() => {
      this.removeToast(toast);
    }, 4000);
  }
  
  /**
   * Remove a toast notification with animation
   * @param {HTMLElement} toast - Toast element to remove
   */
  removeToast(toast) {
    // If already being removed, return
    if (toast.classList.contains('animate__fadeOutDown')) return;
    
    // Apply exit animation
    toast.classList.remove('animate__fadeInUp');
    toast.classList.add('animate__fadeOutDown');
    
    // Remove after animation completes
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
  
  /**
   * Show success toast
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   */
  success(title, message) {
    this.show(title, message, 'success', true);
  }
  
  /**
   * Show error toast
   * @param {string} title - Toast title
   * @param {string} message - Toast message 
   */
  error(title, message) {
    this.show(title, message, 'error', true);
  }
  
  /**
   * Show info toast
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   */
  info(title, message) {
    this.show(title, message, 'info', true);
  }
}

// Export using CommonJS format
module.exports = ToastManager;
