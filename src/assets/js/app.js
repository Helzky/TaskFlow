// sound stuff uses ipc now

// main app class
class TaskFlowApp {
  constructor() {
    // app state
    this.currentView = 'today';
    this.tasks = [];
    this.editingTaskId = null;
    this.focusModeActive = false;
    
    // dom refs
    this.tasksList = document.getElementById('tasks-list');
    this.upcomingTasksList = document.getElementById('upcoming-tasks-list');
    this.taskModal = document.getElementById('task-modal');
    this.taskForm = document.getElementById('task-form');
    this.navItems = document.querySelectorAll('.nav-item');
    this.viewContainers = document.querySelectorAll('.view-container');
    this.focusModeToggle = document.getElementById('focus-mode-toggle');
    this.appLogo = document.getElementById('app-logo');
    this.creditsButton = document.getElementById('credits-button');
    this.creditsModal = document.getElementById('credits-modal');
    
    // init
    this.init();
  }
  
  async init() {
    // get stored tasks
    await this.loadTasks();
    
    // setup events
    this.setupEventListeners();
    
    // render tasks
    this.renderTasks();
  }
  
  setupEventListeners() {
    
    this.appLogo.addEventListener('click', () => {
      
      this.switchView('today');
    });
    
    
    this.navItems.forEach(item => {
      item.addEventListener('click', () => {
        
        const view = item.dataset.view;
        this.switchView(view);
      });
    });
    
    
    document.getElementById('add-task-btn').addEventListener('click', () => {
      
      this.openTaskModal();
    });
    
    
    this.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTask.bind(this)();
    });
    
    
    document.getElementById('cancel-task').addEventListener('click', () => {
      
      this.closeTaskModal();
    });
    
    
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        
        const modal = btn.closest('.modal');
        if (modal) {
          modal.classList.remove('open');
        }
      });
    });
    
    
    this.focusModeToggle.addEventListener('click', () => {
      
      this.toggleFocusMode();
    });
    
    
    this.creditsButton.addEventListener('click', () => {
      
      this.showCreditsModal();
    });
    
    
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
      input.addEventListener('click', () => {
        
      });
    });
    
    // handle task actions
    const handleTaskAction = (e) => {
      const taskItem = e.target.closest('.task-item');
      if (!taskItem) return;
      
      const taskId = taskItem.dataset.id;
      
      
      if (e.target.classList.contains('task-complete-checkbox')) {
        this.toggleTaskComplete(taskId, e.target.checked);
        return;
      }
      
      
      const editButton = e.target.closest('.task-edit');
      if (editButton) {
        this.editTask(taskId);
        return;
      }
      
      
      const deleteButton = e.target.closest('.task-delete');
      if (deleteButton) {
        this.deleteTask(taskId);
        return;
      }
    };
    
    
    this.tasksList.addEventListener('click', handleTaskAction);
    if (this.upcomingTasksList) {
      this.upcomingTasksList.addEventListener('click', handleTaskAction);
    }
  }
  
  async loadTasks() {
    try {
      
      this.tasks = await window.api.tasks.getAll();
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.tasks = [];
    }
  }
  
  renderTasks() {
    // grab tasks for upcoming month
    const monthAheadTasks = this.getMonthAheadTasks();
    
    
    if (this.currentView !== 'upcoming') {
      this.renderUpcomingTasks(monthAheadTasks);
    }
    
    
    const currentTasksList = this.currentView === 'upcoming' ? this.upcomingTasksList : this.tasksList;
    currentTasksList.innerHTML = '';
    
    
    const filteredTasks = this.currentView === 'upcoming' ? 
      monthAheadTasks : this.filterTasksByView();
    
    if (filteredTasks.length === 0) {
      
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      const emptyStateMessage = this.currentView === 'today' ? 
        'No tasks for today. Add your first task to get started!' : 
        'No tasks for this period yet.';
      emptyState.innerHTML = `<p>${emptyStateMessage}</p>`;
      currentTasksList.appendChild(emptyState);
      return;
    }
    
    // sort by completion -> priority -> date
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      
      return 0;
    });
    
    
    sortedTasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      currentTasksList.appendChild(taskElement);
      
      // add slide-in animation
      setTimeout(() => {
        taskElement.classList.add('animate__slideIn');
      }, 10);
    });
  }
  
  isTaskMonthAhead(task) {
    // Check if a task's due date is more than a month ahead
    if (!task.dueDate) return false;
    
    const today = new Date();
    const monthAhead = new Date();
    monthAhead.setMonth(today.getMonth() + 1);
    monthAhead.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate >= monthAhead;
  }
  
  getMonthAheadTasks() {
    // Get tasks that are more than a month ahead
    return this.tasks.filter(task => this.isTaskMonthAhead(task));
  }
  
  renderUpcomingTasks(monthAheadTasks) {
    // Render tasks that are more than a month ahead
    if (!this.upcomingTasksList) return;
    
    this.upcomingTasksList.innerHTML = '';
    
    if (monthAheadTasks.length === 0) {
      return; // Don't add empty state, keep the info text visible
    }
    
    // sort tasks by due date
    const sortedTasks = [...monthAheadTasks].sort((a, b) => {
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    
    sortedTasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      this.upcomingTasksList.appendChild(taskElement);
    });
  }
  
  filterTasksByView() {
    // tasks filtering logic based on current view
    switch (this.currentView) {
      case 'today':
        // show tasks due today or overdue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.tasks.filter(task => {
          if (!task.dueDate) return true; // tasks with no due date are shown
          
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          
          return dueDate <= today;
        });
        
      case 'upcoming':
        // We specifically want tasks more than a month ahead when viewing the upcoming tab
        return this.getMonthAheadTasks();
        
      default:
        return this.tasks;
    }
  }
  
  createTaskElement(task) {
    // clone the task template
    const template = document.getElementById('task-item-template');
    const taskElement = template.content.cloneNode(true).querySelector('.task-item');
    
    // set task data
    taskElement.dataset.id = task.id;
    
    // set checkbox state
    const checkbox = taskElement.querySelector('.task-complete-checkbox');
    checkbox.checked = task.completed || false;
    
    // set title with strikethrough if completed
    const titleElement = taskElement.querySelector('.task-title');
    titleElement.textContent = task.title;
    
    // set description if exists
    const descriptionElement = taskElement.querySelector('.task-description');
    if (task.description) {
      descriptionElement.textContent = task.description;
    } else {
      descriptionElement.remove();
    }
    
    // set due date if exists
    const dueDateElement = taskElement.querySelector('.task-due-date');
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDateElement.textContent = this.formatDate(dueDate);
      
      // highlight if overdue
      const today = new Date();
      if (dueDate < today && !task.completed) {
        dueDateElement.style.color = 'var(--danger-color)';
      }
    } else {
      dueDateElement.remove();
    }
    
    // set priority
    const priorityElement = taskElement.querySelector('.task-priority');
    priorityElement.textContent = this.capitalizeFirstLetter(task.priority || 'medium');
    priorityElement.dataset.priority = task.priority || 'medium';
    
    // Apply strikethrough effect to all task content if completed
    if (task.completed) {
      titleElement.style.textDecoration = 'line-through';
      titleElement.style.opacity = '0.6';
      
      if (descriptionElement) {
        descriptionElement.style.textDecoration = 'line-through';
        descriptionElement.style.opacity = '0.6';
      }
      
      if (dueDateElement) {
        dueDateElement.style.textDecoration = 'line-through';
        dueDateElement.style.opacity = '0.6';
      }
      
      priorityElement.style.textDecoration = 'line-through';
      priorityElement.style.opacity = '0.6';
    }
    
    return taskElement;
  }
  
  switchView(view) {
    // update current view
    this.currentView = view;
    
    // update active nav item
    this.navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.view === view);
    });
    
    // update visible view container
    this.viewContainers.forEach(container => {
      const containerId = container.id;
      container.classList.toggle('hidden', containerId !== `${view}-view`);
    });
    
    // re-render tasks for the new view
    this.renderTasks();
  }
  
  openTaskModal(taskId = null) {
    this.editingTaskId = taskId;
    
    // clear form
    this.taskForm.reset();
    
    // set modal title
    const modalTitle = document.getElementById('modal-title');
    modalTitle.textContent = taskId ? 'Edit Task' : 'Add New Task';
    
    // if editing, populate form with task data
    if (taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-due-date').value = task.dueDate ? this.formatDateForInput(task.dueDate) : '';
        document.getElementById('task-priority').value = task.priority || 'medium';
      }
    }
    
    // open modal
    this.taskModal.classList.add('open');
    
    // focus on title input
    setTimeout(() => {
      document.getElementById('task-title').focus();
    }, 100);
    
    // play sound effect
    
  }
  
  closeTaskModal() {
    this.taskModal.classList.remove('open');
    this.editingTaskId = null;
  }
  
  showCreditsModal() {
    this.creditsModal.classList.add('open');
    
  }
  
  async saveTask() {
    // gather form data
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    
    if (!title) return; // don't save empty tasks
    
    const taskData = {
      title,
      description,
      dueDate: dueDate || null,
      priority,
      completed: false
    };
    
    try {
      if (this.editingTaskId) {
        // update existing task
        const existingTask = this.tasks.find(t => t.id === this.editingTaskId);
        if (existingTask) {
          // preserve completion status
          taskData.completed = existingTask.completed;
          
          // update task
          taskData.id = this.editingTaskId;
          await window.api.tasks.update(taskData);
          
          // update local tasks array
          this.tasks = this.tasks.map(t => 
            t.id === this.editingTaskId ? taskData : t
          );
          
          // Play sound effect and show notification
          
          this.showNotification('Task Updated', `Task "${title}" has been updated`);
        }
      } else {
        // add new task
        const newTask = await window.api.tasks.add(taskData);
        this.tasks.push(newTask);
        
        // Check if this task would go to the Upcoming Tasks section
        const isMonthAheadTask = this.isTaskMonthAhead(newTask);
        
        // Play sound effect and show notification
        
        if (isMonthAheadTask) {
          this.showNotification('Task Created', `Task "${title}" created and moved to Upcoming Tasks`, 'info');
        } else {
          this.showNotification('Task Created', `New task "${title}" has been created`, 'success');
        }
      }
      
      // close modal and refresh task list
      this.closeTaskModal();
      this.renderTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      this.showNotification('Error', 'Failed to save task. Please try again.');
    }
  }
  
  async toggleTaskComplete(taskId, isComplete) {
    try {
      // find the task
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;
      
      // update task completion status
      task.completed = isComplete;
      
      // save to storage
      await window.api.tasks.update(task);
      
      // Apply strikethrough immediately for better UX
      const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
      if (taskElement) {
        const titleElement = taskElement.querySelector('.task-title');
        const descriptionElement = taskElement.querySelector('.task-description');
        const metaElements = taskElement.querySelectorAll('.task-meta span');
        
        if (isComplete) {
          titleElement.style.textDecoration = 'line-through';
          titleElement.style.opacity = '0.6';
          
          if (descriptionElement) {
            descriptionElement.style.textDecoration = 'line-through';
            descriptionElement.style.opacity = '0.6';
          }
          
          metaElements.forEach(el => {
            el.style.textDecoration = 'line-through';
            el.style.opacity = '0.6';
          });
        } else {
          titleElement.style.textDecoration = 'none';
          titleElement.style.opacity = '1';
          
          if (descriptionElement) {
            descriptionElement.style.textDecoration = 'none';
            descriptionElement.style.opacity = '1';
          }
          
          metaElements.forEach(el => {
            el.style.textDecoration = 'none';
            el.style.opacity = '1';
          });
        }
      }
      
      // Render updates after a short delay for smoother transition
      setTimeout(() => {
        this.renderTasks();
      }, 300);
      
      // play sound and show notification if completed
      if (isComplete) {
        
        this.showNotification('Task Completed', `Task "${task.title}" marked as complete`);
      } else {
        
        this.showNotification('Task Reopened', `Task "${task.title}" marked as incomplete`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      this.showNotification('Error', 'Failed to update task status');
    }
  }
  
  editTask(taskId) {
    this.openTaskModal(taskId);
  }
  
  async deleteTask(taskId) {
    try {
      // Get task details before deletion
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;
      
      // Create custom confirmation dialog
      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay';
      
      const confirmDialog = document.createElement('div');
      confirmDialog.className = 'confirm-dialog';
      
      confirmDialog.innerHTML = `
        <h3>Delete Task</h3>
        <p>Are you sure you want to delete "${task.title}"?</p>
        <div class="dialog-actions">
          <button class="btn secondary cancel-delete">Cancel</button>
          <button class="btn primary confirm-delete">Delete</button>
        </div>
      `;
      
      modalOverlay.appendChild(confirmDialog);
      document.body.appendChild(modalOverlay);
      
      // Add event listeners to buttons
      return new Promise((resolve) => {
        const cancelButton = confirmDialog.querySelector('.cancel-delete');
        const confirmButton = confirmDialog.querySelector('.confirm-delete');
        
        cancelButton.addEventListener('click', () => {
          modalOverlay.remove();
          resolve(false);
        });
        
        confirmButton.addEventListener('click', async () => {
          // delete from storage
          await window.api.tasks.delete(taskId);
          
          // remove from local array
          this.tasks = this.tasks.filter(t => t.id !== taskId);
          
          // render updates
          this.renderTasks();
          
          // Play sound and show notification
          
          this.showNotification('Task Deleted', `Task "${task.title}" has been deleted`);
          
          modalOverlay.remove();
          resolve(true);
        });
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      this.showNotification('Error', 'Failed to delete task');
      return false;
    }
  }
  
  async toggleFocusMode() {
    this.focusModeActive = !this.focusModeActive;
    
    // toggle active class
    this.focusModeToggle.classList.toggle('active', this.focusModeActive);
    
    // update text
    const textElement = this.focusModeToggle.querySelector('.focus-mode-text');
    textElement.textContent = this.focusModeActive ? 'Exit Focus Mode' : 'Focus Mode';
    
    try {
      // send to main process
      await window.api.focusMode.toggle(this.focusModeActive);
      
      // apply visual effects
      document.body.classList.toggle('focus-mode', this.focusModeActive);
      
      // play sound and show notification
      if (this.focusModeActive) {
        
        this.showNotification('Focus Mode Activated', 'Distractions minimized. Stay focused!');
      } else {
        
        this.showNotification('Focus Mode Deactivated', 'You can now return to normal mode.');
      }
    } catch (error) {
      console.error('Error toggling focus mode:', error);
      this.showNotification('Error', 'Failed to toggle focus mode');
    }
  }
  
  // utility methods
  
  formatDate(date) {
    // today, tomorrow, or date format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);
    
    if (inputDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (inputDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return inputDate.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        year: inputDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  }
  
  formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // format: YYYY-MM-DDTHH:MM
  }
  
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  // Sound playback using the main process sound system
  playSound(category, randomize = true) {
    // Sound functionality is completely disabled
    // This is an empty no-op function that doesn't do anything
    // The original implementation has been fully removed to prevent any errors
    
    // When sound functionality is restored, implement actual sound code here
    return Promise.resolve(); // Return a resolved promise to maintain async behavior
  }
  
  showNotification(title, message, type = 'success') {
    // Check for existing toast container or create one
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    
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
    toastContainer.appendChild(toast);
    
    // Add close button functionality
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
      this.removeToast(toast);
    });
    
    // Auto-remove after delay
    setTimeout(() => {
      this.removeToast(toast);
    }, 4000);
    
    // Sound functionality has been disabled
  }
  
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
}

// start when loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new TaskFlowApp();
});
