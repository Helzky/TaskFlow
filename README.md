# TaskFlow

A sleek, modern agenda desktop application built with Electron that transforms productivity through both aesthetics and functionality.

## Features

- **Clean, minimalist interface** with subtle animations and visual feedback
- **Task management** system with priorities, due dates, and descriptions
- **Focus mode** to help minimize distractions
- **Multiple views** including Today, Upcoming, Projects, and Analytics
- **Visual feedback** via toast notifications for task operations
- **Responsive design** that adapts to different window sizes

## Project Structure

```
TaskFlow/
├── src/                 # Source files
│   ├── main.js          # Main Electron process
│   ├── preload.js       # Preload script for secure IPC
│   ├── index.html       # Main application UI
│   └── assets/          # Application assets
│       ├── css/         # Stylesheets
│       ├── js/          # JavaScript files
│       ├── sounds/      # Sound effects 
│       └── icons/       # Application icons
└── package.json         # Project metadata and dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Running the Application

```bash
npm start
```

## Current Implementation Status

The application has been implemented with:

- Complete UI layout with sidebar navigation and modern design elements
- Task creation, editing, and deletion functionality with full validation
- Task priority and due date support with visual indicators
- Toast notification system for operation feedback (task creation, updates, errors)
- Focus mode toggle (UI implementation)
- Multiple view support (Today, Upcoming, Projects, Analytics)
- Secure IPC communication between renderer and main processes
- Persistent storage using electron-store
- Dialog system for task input and confirmation

## Planned Features

- OS integration for focus mode to close distracting applications
- Productivity analytics implementation in the Analytics view
- Cloud synchronization for cross-device access
- Custom themes and appearance settings
- Sound effects integration (currently disabled for stability reasons)
- Project management features
- Task filtering and search capabilities
- Keyboard shortcuts for power users

## Technologies Used

- Electron
- HTML/CSS/JavaScript
- electron-store for data persistence
- CSS animations for visual feedback
- IPC (Inter-Process Communication) for secure main-renderer process interaction
- Context isolation for security
