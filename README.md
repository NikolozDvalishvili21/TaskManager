# TaskFlow

A modern, production-quality Kanban-style task management platform built with React, TypeScript, Firebase, and Framer Motion.

## Features

- **Google Authentication** - Sign in with Google for secure access
- **Kanban Board** - Organize tasks across To Do, In Progress, Testing, and Done columns
- **Drag and Drop** - Move tasks between columns with smooth animations
- **Task Management** - Create, edit, and delete tasks with titles, descriptions, priorities, due dates, and tags
- **Comments** - Add and manage comments on tasks
- **Image Attachments** - Upload and preview images on tasks
- **Search & Filters** - Search tasks and filter by priority or status
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Firebase** - Authentication, Firestore database, and Storage
- **Zustand** - State management
- **@dnd-kit** - Drag and drop
- **Framer Motion** - Animations
- **CSS Modules** - Scoped styling

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Firebase project

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication** with Google provider:
   - Go to Authentication > Sign-in method
   - Enable Google provider
4. Create a **Firestore Database**:
   - Go to Firestore Database
   - Create database in production or test mode
5. Enable **Storage**:
   - Go to Storage
   - Get started with storage
6. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" and add a web app
   - Copy the config values

### Firestore Security Rules

Add these rules to your Firestore:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Security Rules

Add these rules to your Storage:

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd TaskManager
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Fill in your Firebase configuration in `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:

```bash
npm run dev
```

6. Open http://localhost:5173 in your browser

## Project Structure

```
src/
├── app/                    # App configuration
│   ├── AppLayout.tsx       # Main layout with sidebar/topbar
│   ├── ProtectedRoute.tsx  # Auth protection
│   └── router.tsx          # Route definitions
├── components/             # Reusable UI components
│   ├── Avatar/
│   ├── Button/
│   ├── Card/
│   ├── Dropdown/
│   ├── EmptyState/
│   ├── ImagePreview/
│   ├── ImageUpload/
│   ├── Input/
│   ├── Modal/
│   ├── Sidebar/
│   ├── Spinner/
│   ├── Toast/
│   └── Topbar/
├── features/               # Feature modules
│   ├── auth/               # Authentication
│   ├── board/              # Board state and components
│   ├── comments/           # Comments service
│   └── tasks/              # Task management
├── hooks/                  # Custom hooks
├── lib/                    # Utilities and configuration
│   ├── firebase.ts         # Firebase initialization
│   └── utils.ts            # Helper functions
├── pages/                  # Page components
│   ├── Board/
│   ├── Login/
│   ├── Settings/
│   └── TaskDetail/
├── styles/                 # Global styles
│   ├── global.css
│   └── tokens.css          # CSS custom properties
└── types/                  # TypeScript types
    └── index.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Routes

| Route               | Description                    |
| ------------------- | ------------------------------ |
| `/login`            | Login page with Google sign-in |
| `/app/board`        | Main Kanban board              |
| `/app/task/:taskId` | Task detail page               |
| `/app/settings`     | User settings (theme toggle)   |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT
