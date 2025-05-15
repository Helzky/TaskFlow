// sound stuff disabled for now

// main app stuff
class TaskFlowApp {
  constructor() {
    // state
    this.currentView = 'today';
    this.tasks = [];
    this.editingTaskId = null;
    this.focusModeActive = false;
    this.isLoading = true;
    
    // dom elements
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
    
    // kick things off
    this.init();
  }
  
  async init() {
    // grab splash screen
    this.splashScreen = document.getElementById('splash-screen');
    
    // hide everything while loading
    this.viewContainers.forEach(container => {
      container.style.visibility = 'hidden';
    });
    
    // load stuff in background
    await this.loadTasks();
    this.setupEventListeners();
    this.renderTasks();
    
    this.playStartupAnimation();
  }
  
  playStartupAnimation() {
    // random glow start position
    this.setRandomGlowPath();
    
    // animation takes about 2.8s total
    const splashAnimationDuration = 2800;
    
    setTimeout(() => {
      // fade splash out
      this.splashScreen.classList.add('fade-out');
      
      // show app
      const appContainer = document.querySelector('.app-container');
      appContainer.classList.add('visible');
      
      setTimeout(() => {
        this.isLoading = false;
        this.viewContainers.forEach(container => {
          if (!container.classList.contains('hidden')) {
            container.style.visibility = 'visible';
          }
        });
        
        // cleanup
        setTimeout(() => {
          this.splashScreen.remove();
        }, 500);
      }, 400);
    }, splashAnimationDuration);
  }
  
  setRandomGlowPath() {
    // find the glow
    const travelingGlow = document.querySelector('.traveling-glow');
    if (!travelingGlow) return;
    
    // start from screen edge - a bit off-screen for smooth entry
    const positions = [
      { top: `${this.getRandomInt(-25, -10)}%`, left: `${this.getRandomInt(-10, 110)}%` }, // top
      { top: `${this.getRandomInt(110, 125)}%`, left: `${this.getRandomInt(-10, 110)}%` }, // bottom
      { top: `${this.getRandomInt(-10, 110)}%`, left: `${this.getRandomInt(-25, -10)}%` }, // left
      { top: `${this.getRandomInt(-10, 110)}%`, left: `${this.getRandomInt(110, 125)}%` }  // right
    ];
    
    // pick random edge
    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    
    // place it
    travelingGlow.style.top = randomPosition.top;
    travelingGlow.style.left = randomPosition.left;
    
    // waypoints for natural motion
    const controlPoints = [
      { x: this.getRandomInt(15, 85), y: this.getRandomInt(15, 85) }, // entry
      { x: this.getRandomInt(25, 75), y: this.getRandomInt(25, 75) }, // mid
      { x: this.getRandomInt(40, 60), y: this.getRandomInt(40, 60) }, // approaching
      { x: this.getRandomInt(45, 55), y: this.getRandomInt(45, 55) }  // almost there
    ];
    
    // create keyframes for animation
    const keyframesStyle = document.createElement('style');
    keyframesStyle.textContent = `
      @keyframes windyPath {
        0% {
          top: ${randomPosition.top};
          left: ${randomPosition.left};
          opacity: 0.3;
          width: 60px;
          height: 60px;
        }
        15% {
          top: ${controlPoints[0].y}%;
          left: ${controlPoints[0].x}%;
          opacity: 0.4;
          width: 70px;
          height: 70px;
        }
        35% {
          top: ${controlPoints[1].y}%;
          left: ${controlPoints[1].x}%;
          opacity: 0.6;
          width: 80px;
          height: 80px;
        }
        60% {
          top: ${controlPoints[2].y}%;
          left: ${controlPoints[2].x}%;
          opacity: 0.75;
          width: 90px;
          height: 90px;
        }
        85% {
          top: ${controlPoints[3].y}%;
          left: ${controlPoints[3].x}%;
          opacity: 0.9;
          width: 100px;
          height: 100px;
        }
        100% {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 1;
          width: 110px;
          height: 110px;
        }
      }
    `;
    document.head.appendChild(keyframesStyle);
    
    // smoother motion with cubic-bezier
    travelingGlow.style.animation = 'windyPath 1.8s forwards cubic-bezier(0.25, 0.1, 0.25, 1)';
  }
  
  // get random num
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
      // Only save if the due date is valid or not set
      if (this.validateDueDate()) {
        this.saveTask.bind(this)();
      }
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
    
    // date validation
    const dueDateInput = document.getElementById('task-due-date');
    dueDateInput.addEventListener('change', () => {
      this.validateDueDate();
    });
    
    // task actions handler
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
      // grab from storage
      this.tasks = await window.api.tasks.getAll();
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.tasks = [];
    }
  }
  
  renderTasks() {
    // far future tasks
    const monthAheadTasks = this.getMonthAheadTasks();
    
    if (this.currentView !== 'upcoming') {
      this.renderUpcomingTasks(monthAheadTasks);
    }
    
    // get the right container
    const currentTasksList = this.currentView === 'upcoming' ? this.upcomingTasksList : this.tasksList;
    currentTasksList.innerHTML = '';
    
    // filter based on view
    const filteredTasks = this.currentView === 'upcoming' ? 
      monthAheadTasks : this.filterTasksByView();
    
    if (filteredTasks.length === 0) {
      // show empty state
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      const emptyStateMessage = this.currentView === 'today' ? 
        'No tasks for today. Add your first task to get started!' : 
        'No tasks for this period yet.';
      emptyState.innerHTML = `<p>${emptyStateMessage}</p>`;
      currentTasksList.appendChild(emptyState);
      return;
    }
    
    // sort tasks (completed last, then by priority, then by date)
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      // completed tasks go last
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // priority order
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      // date order
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      
      return 0;
    });
    
    // add to dom
    sortedTasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      currentTasksList.appendChild(taskElement);
      
      // animate in
      setTimeout(() => {
        taskElement.classList.add('animate__slideIn');
      }, 10);
    });
  }
  
  isTaskMonthAhead(task) {
    // is it due more than a month from now?
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
    // tasks due more than a month away
    return this.tasks.filter(task => this.isTaskMonthAhead(task));
  }
  
  renderUpcomingTasks(monthAheadTasks) {
    // show tasks in upcoming section
    if (!this.upcomingTasksList) return;
    
    this.upcomingTasksList.innerHTML = '';
    
    if (monthAheadTasks.length === 0) {
      return; // keep info text visible instead of empty state
    }
    
    // sort by date
    const sortedTasks = [...monthAheadTasks].sort((a, b) => {
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    
    sortedTasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      this.upcomingTasksList.appendChild(taskElement);
    });
  }
  
  filterTasksByView() {
    // filter stuff based on which tab we're in
    switch (this.currentView) {
      case 'today':
        // today or overdue stuff
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.tasks.filter(task => {
          if (!task.dueDate) return true; // no date = show it
          
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          
          return dueDate <= today;
        });
        
      case 'upcoming':
        // far future stuff (>1mo)
        return this.getMonthAheadTasks();
        
      default:
        return this.tasks;
    }
  }
  
  createTaskElement(task) {
    // grab template
    const template = document.getElementById('task-item-template');
    const taskElement = template.content.cloneNode(true).querySelector('.task-item');
    
    // id for data attrs
    taskElement.dataset.id = task.id;
    
    // checkbox
    const checkbox = taskElement.querySelector('.task-complete-checkbox');
    checkbox.checked = task.completed || false;
    
    // title
    const titleElement = taskElement.querySelector('.task-title');
    titleElement.textContent = task.title;
    
    // description (if any)
    const descriptionElement = taskElement.querySelector('.task-description');
    if (task.description) {
      descriptionElement.textContent = task.description;
    } else {
      descriptionElement.remove();
    }
    
    // due date
    const dueDateElement = taskElement.querySelector('.task-due-date');
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDateElement.textContent = this.formatDate(dueDate);
      
      // red for overdue
      const today = new Date();
      if (dueDate < today && !task.completed) {
        dueDateElement.style.color = 'var(--danger-color)';
      }
    } else {
      dueDateElement.remove();
    }
    
    // priority tag
    const priorityElement = taskElement.querySelector('.task-priority');
    priorityElement.textContent = this.capitalizeFirstLetter(task.priority || 'medium');
    priorityElement.dataset.priority = task.priority || 'medium';
    
    // strikethrough completed stuff
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
    if (this.isLoading) return;
    
    // bail if already on this view
    if (this.currentView === view) return;
    
    // highlight right nav item
    this.navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.view === view);
    });
    
    // hide current stuff first
    const currentViewContainer = document.getElementById(`${this.currentView}-view`);
    if (currentViewContainer) {
      currentViewContainer.style.visibility = 'hidden';
      
      // need timeouts for smooth transitions
      setTimeout(() => {
        this.currentView = view;
        
        // hide everything
        this.viewContainers.forEach(container => {
          container.classList.toggle('hidden', container.id !== `${view}-view`);
          container.style.visibility = 'hidden';
        });
        
        // get tasks for new view
        this.renderTasks();
        
        // show new container after tiny delay
        setTimeout(() => {
          const newViewContainer = document.getElementById(`${view}-view`);
          if (newViewContainer) {
            newViewContainer.style.visibility = 'visible';
          }
        }, 50);
      }, 100);
    }
  }
  
  openTaskModal(taskId = null) {
    this.editingTaskId = taskId;
    
    // reset inputs
    this.taskForm.reset();
    
    // title based on add/edit mode
    const modalTitle = document.getElementById('modal-title');
    modalTitle.textContent = taskId ? 'Edit Task' : 'Add New Task';
    
    // fill form if editing
    if (taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-due-date').value = task.dueDate ? this.formatDateForInput(task.dueDate) : '';
        document.getElementById('task-priority').value = task.priority || 'medium';
      }
    }
    
    // show it
    this.taskModal.classList.add('open');
    
    // focus title field
    setTimeout(() => {
      document.getElementById('task-title').focus();
    }, 100);
  }
  
  closeTaskModal() {
    this.taskModal.classList.remove('open');
    this.editingTaskId = null;
  }
  
  showCreditsModal() {
    this.creditsModal.classList.add('open');
    
  }
  
  async saveTask() {
    // grab form stuff
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    
    if (!title) return; // need a title at least
    
    const taskData = {
      title,
      description,
      dueDate: dueDate || null,
      priority,
      completed: false
    };
    
    try {
      if (this.editingTaskId) {
        // editing existing
        const existingTask = this.tasks.find(t => t.id === this.editingTaskId);
        if (existingTask) {
          // keep completion status
          taskData.completed = existingTask.completed;
          
          taskData.id = this.editingTaskId;
          await window.api.tasks.update(taskData);
          
          // update local state
          this.tasks = this.tasks.map(t => 
            t.id === this.editingTaskId ? taskData : t
          );
          
          this.showNotification('Task Updated', `Task "${title}" has been updated`);
        }
      } else {
        // new task
        const newTask = await window.api.tasks.add(taskData);
        this.tasks.push(newTask);
        
        // check if it'll go in upcoming
        const isMonthAheadTask = this.isTaskMonthAhead(newTask);
        
        if (isMonthAheadTask) {
          this.showNotification('Task Created', `Task "${title}" created and moved to Upcoming Tasks`, 'info');
        } else {
          this.showNotification('Task Created', `New task "${title}" has been created`, 'success');
        }
      }
      
      // cleanup and refresh
      this.closeTaskModal();
      this.renderTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      this.showNotification('Error', 'Failed to save task. Please try again.');
    }
  }
  
  async toggleTaskComplete(taskId, isComplete) {
    try {
      // get task
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;
      
      // flip status
      task.completed = isComplete;
      
      // persist to db
      await window.api.tasks.update(task);
      
      // instant visual update
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
      
      // re-render after a moment
      setTimeout(() => {
        this.renderTasks();
      }, 300);
      
      // notify user
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
      // grab the task
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;
      
      // make confirmation dialog
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
      
      // button handlers
      return new Promise((resolve) => {
        const cancelButton = confirmDialog.querySelector('.cancel-delete');
        const confirmButton = confirmDialog.querySelector('.confirm-delete');
        
        cancelButton.addEventListener('click', () => {
          modalOverlay.remove();
          resolve(false);
        });
        
        confirmButton.addEventListener('click', async () => {
          // remove from db
          await window.api.tasks.delete(taskId);
          
          // remove locally
          this.tasks = this.tasks.filter(t => t.id !== taskId);
          
          // update ui
          this.renderTasks();
          
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
    
    // ui button state
    this.focusModeToggle.classList.toggle('active', this.focusModeActive);
    
    // button text
    const textElement = this.focusModeToggle.querySelector('.focus-mode-text');
    textElement.textContent = this.focusModeActive ? 'Exit Focus Mode' : 'Focus Mode';
    
    try {
      // store to electron
      await window.api.focusMode.toggle(this.focusModeActive);
      
      // visual changes
      document.body.classList.toggle('focus-mode', this.focusModeActive);
      
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
  
  // helper functions
  
  formatDate(date) {
    // friendly date display
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
  
  validateDueDate() {
    const dueDateInput = document.getElementById('task-due-date');
    const dueDateError = document.getElementById('due-date-error');
    const saveButton = document.getElementById('save-task');
    
    // Reset validation state
    dueDateError.classList.add('hidden');
    saveButton.disabled = false;
    
    // If no due date is set, it's valid
    if (!dueDateInput.value) {
      return true;
    }
    
    // Compare with current time
    const selectedDate = new Date(dueDateInput.value);
    const currentDate = new Date();
    
    // If due date is in the past
    if (selectedDate < currentDate) {
      dueDateError.classList.remove('hidden');
      saveButton.disabled = true;
      return false;
    }
    
    return true;
  }
  
  // sound - disabled for now
  playSound(category, randomize = true) {
    // empty function - sounds were causing app to freeze
    return Promise.resolve(); // keep async interface
  }
  
  showNotification(title, message, type = 'success') {
    // find or create toast container
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    
    // make the toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate__animated animate__fadeInUp`;
    
    // add content
    toast.innerHTML = `
      <div class="toast-header">
        <h4>${title}</h4>
        <button class="toast-close">&times;</button>
      </div>
      <div class="toast-body">
        <p>${message}</p>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // close button
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
      this.removeToast(toast);
    });
    
    // auto dismiss
    setTimeout(() => {
      this.removeToast(toast);
    }, 4000);
  }
  
  removeToast(toast) {
    // bail if already fading
    if (toast.classList.contains('animate__fadeOutDown')) return;
    
    // fade out
    toast.classList.remove('animate__fadeInUp');
    toast.classList.add('animate__fadeOutDown');
    
    // cleanup when done
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
}

// init app when dom ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new TaskFlowApp();
});
