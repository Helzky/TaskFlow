# TaskFlow

A sleek, modern agenda desktop application built with Electron that transforms productivity through both aesthetics and functionality.

## Features

- **Clean, minimalist interface** with subtle animations and sound effects
- **Task management** system with priorities, due dates, and descriptions
- **Focus mode** to help minimize distractions (with OS integration capabilities)
- **Multiple views** including Today, Upcoming, Projects, and Analytics
- **Satisfying sound effects** and visual feedback for task completion

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

The foundation of the application has been implemented with:

- Basic UI layout with sidebar navigation
- Task creation, editing, and deletion functionality
- Task priority and due date support
- Focus mode toggle (UI only)
- Storage of tasks using electron-store

## Planned Features

- OS integration for focus mode to close distracting applications
- Smart progress notifications
- Productivity analytics
- Cloud synchronization
- Custom themes and sound packs

## Technologies Used

- Electron
- HTML/CSS/JavaScript
- electron-store for data persistence
