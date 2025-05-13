// main application class
class TaskFlowApp {
  constructor() {
    // app state
    this.currentView = 'today';
    this.tasks = [];
    this.editingTaskId = null;
    this.focusModeActive = false;
    
    // dom elements
    this.tasksList = document.getElementById('tasks-list');
    this.taskModal = document.getElementById('task-modal');
    this.taskForm = document.getElementById('task-form');
    this.navItems = document.querySelectorAll('.nav-item');
    this.viewContainers = document.querySelectorAll('.view-container');
    this.focusModeToggle = document.getElementById('focus-mode-toggle');
    this.appLogo = document.getElementById('app-logo');
    this.creditsButton = document.getElementById('credits-button');
    this.creditsModal = document.getElementById('credits-modal');
    
    // initialize the app
    this.init();
  }
  
  async init() {
    // load tasks from storage
    await this.loadTasks();
    
    // setup event listeners
    this.setupEventListeners();
    
    // render initial tasks
    this.renderTasks();
  }
  
  setupEventListeners() {
    // logo click to return to Today view
    this.appLogo.addEventListener('click', () => {
      this.switchView('today');
    });
    
    // navigation
    this.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        this.switchView(view);
      });
    });
    
    // add task button
    document.getElementById('add-task-btn').addEventListener('click', () => {
      this.openTaskModal();
    });
    
    // task form submit
    this.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTask();
    });
    
    // cancel task button
    document.getElementById('cancel-task').addEventListener('click', () => {
      this.closeTaskModal();
    });
    
    // close modal button
    document.querySelector('.close-modal').addEventListener('click', () => {
      this.closeTaskModal();
    });
    
    // focus mode toggle
    this.focusModeToggle.addEventListener('click', () => {
      this.toggleFocusMode();
    });
    
    // credits button
    this.creditsButton.addEventListener('click', () => {
      this.showCreditsModal();
    });
    
    // close credits modal
    const creditsCloseBtn = this.creditsModal.querySelector('.close-modal');
    creditsCloseBtn.addEventListener('click', () => {
      this.creditsModal.classList.remove('open');
    });
    
    // delegate task actions (complete, edit, delete)
    this.tasksList.addEventListener('click', (e) => {
      const taskItem = e.target.closest('.task-item');
      if (!taskItem) return;
      
      const taskId = taskItem.dataset.id;
      
      if (e.target.classList.contains('task-complete-checkbox')) {
        this.toggleTaskComplete(taskId, e.target.checked);
      } else if (e.target.classList.contains('task-edit')) {
        this.editTask(taskId);
      } else if (e.target.classList.contains('task-delete')) {
        this.deleteTask(taskId);
      }
    });
  }
  
  async loadTasks() {
    try {
      // get tasks from electron store via our preload api
      this.tasks = await window.api.tasks.getAll();
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.tasks = [];
    }
  }
  
  renderTasks() {
    // clear current tasks
    this.tasksList.innerHTML = '';
    
    // get tasks for current view
    const filteredTasks = this.filterTasksByView();
    
    if (filteredTasks.length === 0) {
      // show empty state
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = '<p>No tasks for today. Add your first task to get started!</p>';
      this.tasksList.appendChild(emptyState);
      return;
    }
    
    // sort tasks (incomplete first, then by priority and due date)
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      // completed tasks go to the bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // then sort by priority (high to low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      // then by due date (earliest first)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      
      return 0;
    });
    
    // create task elements
    sortedTasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      this.tasksList.appendChild(taskElement);
      
      // add slide-in animation
      setTimeout(() => {
        taskElement.classList.add('animate__slideIn');
      }, 10);
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
        // show future tasks
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return this.tasks.filter(task => {
          if (!task.dueDate) return false;
          
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          
          return dueDate >= tomorrow;
        });
        
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
    if (task.completed) {
      titleElement.style.textDecoration = 'line-through';
      titleElement.style.opacity = '0.6';
    }
    
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
    this.playSound('modal-open');
  }
  
  closeTaskModal() {
    this.taskModal.classList.remove('open');
    this.editingTaskId = null;
  }
  
  showCreditsModal() {
    this.creditsModal.classList.add('open');
    // play sound effect
    this.playSound('modal-open');
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
        }
      } else {
        // add new task
        const newTask = await window.api.tasks.add(taskData);
        this.tasks.push(newTask);
        
        // play sound effect
        this.playSound('task-added');
      }
      
      // close modal and refresh task list
      this.closeTaskModal();
      this.renderTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
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
      
      // render updates
      this.renderTasks();
      
      // play sound effect if completed
      if (isComplete) {
        this.playSound('task-complete');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }
  
  editTask(taskId) {
    this.openTaskModal(taskId);
  }
  
  async deleteTask(taskId) {
    // confirm delete
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      // delete from storage
      await window.api.tasks.delete(taskId);
      
      // remove from local array
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      
      // render updates
      this.renderTasks();
      
      // play sound effect
      this.playSound('task-deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
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
      
      // play sound effect
      this.playSound(this.focusModeActive ? 'focus-mode-on' : 'focus-mode-off');
      
      // show notification
      this.showNotification(
        this.focusModeActive ? 'Focus Mode Activated' : 'Focus Mode Deactivated',
        this.focusModeActive ? 'Distractions minimized. Stay focused!' : 'You can now return to normal mode.'
      );
    } catch (error) {
      console.error('Error toggling focus mode:', error);
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
  
  playSound(soundName) {
    try {
      // call the preload api to play sound
      window.api.utils.playSound(soundName);
    } catch (error) {
      // fail silently - sounds are non-critical
      console.warn('Failed to play sound:', error);
    }
  }
  
  showNotification(title, message) {
    // create notification element
    const notification = document.createElement('div');
    notification.className = 'notification animate__fadeIn';
    notification.innerHTML = `
      <div class="notification-content">
        <h4>${title}</h4>
        <p>${message}</p>
      </div>
    `;
    
    // add to document
    document.body.appendChild(notification);
    
    // remove after delay
    setTimeout(() => {
      notification.classList.add('animate__fadeOut');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new TaskFlowApp();
});
