

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Architecture](#core-architecture)
5. [Directory-by-Directory Breakdown](#directory-by-directory-breakdown)
6. [Key Features & Implementation](#key-features--implementation)
7. [State Management](#state-management)
8. [Authentication System](#authentication-system)
9. [Data Flow](#data-flow)
10. [API Integration](#api-integration)
11. [Styling & UI Components](#styling--ui-components)
12. [Development Workflow](#development-workflow)
13. [Backend Integration Guide](#backend-integration-guide)
14. [Testing Strategy](#testing-strategy)
15. [Deployment](#deployment)

## Project Overview

DemAI is a sophisticated project management platform that combines traditional project management features with AI-powered analytics. The application is built as a single-page application (SPA) using React 18 with TypeScript, featuring a modular architecture that separates concerns and promotes maintainability.

### Key Features
- **Project Management**: CRUD operations for projects with team management
- **Bid Management**: Create, track, and manage project bids
- **AI Analysis**: AI-powered insights and recommendations
- **Real-time Notifications**: Toast notifications and real-time updates
- **Authentication**: Secure user authentication and authorization
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Technology Stack

### Frontend
- **React 18**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **React Router v6**: Client-side routing
- **React Query**: Server state management
- **React Hook Form**: Form handling with validation

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: High-quality React components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Recharts**: Data visualization

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Project Structure

```
demAI/
├── public/                 # Static assets
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components (Shadcn)
│   │   ├── layout/        # Layout components
│   │   ├── dashboard/     # Dashboard-specific components
│   │   ├── projects/      # Project-related components
│   │   ├── ai/           # AI analysis components
│   │   └── notifications/ # Notification components
│   ├── pages/             # Page components (routes)
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and business logic
│   ├── types/             # TypeScript type definitions
│   ├── lib/               # Utility functions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   ├── App.css           # Global styles
│   └── index.css         # Tailwind CSS imports
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md             # Project documentation
```

## Core Architecture

### Application Flow
1. **Entry Point**: `main.tsx` renders the App component
2. **Routing**: `App.tsx` sets up React Router with protected routes
3. **Authentication**: AuthProvider wraps the entire app
4. **State Management**: React Query for server state, React hooks for local state
5. **Components**: Modular component architecture with clear separation

### Data Flow
```
User Action → Component → Hook → Service → Local Storage → UI Update
```

## Directory-by-Directory Breakdown

### `/src/pages/` - Page Components
Contains all route-level components that represent full pages in the application.

**Key Files:**
- `Dashboard.tsx` - Main dashboard with analytics and overview
- `Projects.tsx` - Project listing and management
- `ProjectDetail.tsx` - Individual project view with full details
- `EditProject.tsx` - Project editing form
- `NewProject.tsx` - Project creation form
- `Bids.tsx` - Bid management interface
- `GenerateBid.tsx` - AI-powered bid generation
- `AiAnalysis.tsx` - AI analysis interface
- `Login.tsx` - Authentication page
- `Settings.tsx` - User settings and preferences

**How to Modify:**
- Add new pages by creating a new `.tsx` file
- Update routing in `App.tsx`
- Follow the existing pattern of using hooks for data fetching
- Implement proper TypeScript types

### `/src/components/` - Reusable Components

#### `/src/components/ui/` - Base UI Components
Contains all Shadcn UI components built on Radix UI primitives.

**Key Components:**
- `button.tsx` - Button component with variants
- `card.tsx` - Card layout component
- `dialog.tsx` - Modal dialogs
- `form.tsx` - Form components with validation
- `table.tsx` - Data table component
- `chart.tsx` - Data visualization charts

**How to Modify:**
- Add new UI components following Shadcn patterns
- Use Radix UI primitives for accessibility
- Maintain consistent styling with Tailwind CSS
- Add proper TypeScript types

#### `/src/components/layout/` - Layout Components
Contains layout-specific components like navigation, headers, etc.

#### `/src/components/dashboard/` - Dashboard Components
Dashboard-specific components for analytics and overview.

#### `/src/components/projects/` - Project Components
Project-related components like project cards, forms, etc.

#### `/src/components/ai/` - AI Components
AI analysis and recommendation components.

#### `/src/components/notifications/` - Notification Components
Toast notifications and alert components.

### `/src/hooks/` - Custom React Hooks
Contains custom hooks for shared logic and state management.

**Key Hooks:**
- `use-auth.tsx` - Authentication state and methods
- `use-notifications.tsx` - Notification management
- `use-toast.ts` - Toast notification system
- `use-profile-info.tsx` - User profile management
- `use-company-info.tsx` - Company information
- `use-mobile.tsx` - Mobile detection

**How to Modify:**
- Create new hooks for shared logic
- Follow React hooks best practices
- Use TypeScript for type safety
- Implement proper error handling

### `/src/services/` - Business Logic & API
Contains service layer for data management and API calls.

**Key Services:**
- `projectService.ts` - Project CRUD operations
- `aiAnalysisService.ts` - AI analysis functionality

**Current Implementation:**
- Uses localStorage for data persistence
- Mock data for demonstration
- Promise-based API structure
- TypeScript interfaces for type safety

**How to Modify for Backend Integration:**
```typescript
// Example: Replace localStorage with API calls
export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) throw new Error('Failed to fetch projects');
    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};
```

### `/src/types/` - TypeScript Type Definitions
Contains all TypeScript interfaces and type definitions.

**Key Types:**
- `project.ts` - Project-related types and interfaces

**How to Modify:**
- Add new types for new features
- Maintain consistency with backend API
- Use proper TypeScript patterns
- Document complex types

### `/src/lib/` - Utility Functions
Contains utility functions and shared logic.

**Key Files:**
- `utils.ts` - General utility functions
- `formatters.ts` - Data formatting utilities

**How to Modify:**
- Add new utility functions as needed
- Keep functions pure and testable
- Use TypeScript for type safety
- Document complex functions

## Key Features & Implementation

### 1. Authentication System
**Location**: `/src/hooks/use-auth.tsx`

**Current Implementation:**
- Local storage-based authentication
- Mock user creation for demo
- Protected routes with RequireAuth component
- Password update functionality

**Backend Integration:**
```typescript
// Replace localStorage with API calls
const login = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const userData = await response.json();
    setUser(userData);
    localStorage.setItem('token', userData.token);
  } catch (error) {
    throw error;
  }
};
```

### 2. Project Management
**Location**: `/src/services/projectService.ts`

**Current Implementation:**
- localStorage-based data persistence
- CRUD operations for projects
- Team member management
- Document management
- Task tracking

**Backend Integration:**
```typescript
// Example API integration
export const createProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(project)
  });
  
  if (!response.ok) throw new Error('Failed to create project');
  return await response.json();
};
```

### 3. AI Analysis
**Location**: `/src/services/aiAnalysisService.ts`

**Current Implementation:**
- Mock AI analysis responses
- Analysis history tracking
- Recommendation generation

**Backend Integration:**
```typescript
// Example AI service integration
export const analyzeProject = async (projectId: string): Promise<AnalysisResult> => {
  const response = await fetch(`/api/ai/analyze/${projectId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  if (!response.ok) throw new Error('Analysis failed');
  return await response.json();
};
```

## State Management

### Current Approach
- **React Query**: For server state management
- **React Hooks**: For local component state
- **Context API**: For global state (auth, notifications)
- **Local Storage**: For data persistence

### State Flow
1. **User Action**: Triggers component state change
2. **Hook Update**: Updates local state
3. **Service Call**: Makes API call or localStorage operation
4. **UI Update**: Component re-renders with new data

## Data Flow

### 1. Project Creation Flow
```
NewProject Component → useForm Hook → projectService.createProject() → localStorage → UI Update
```

### 2. Authentication Flow
```
Login Component → useAuth Hook → localStorage → Protected Route → Dashboard
```

### 3. AI Analysis Flow
```
AiAnalysis Component → aiAnalysisService → Mock AI Response → UI Update
```

## API Integration

### Current Mock Implementation
The application currently uses localStorage for data persistence, making it easy to replace with real API calls.

### Backend API Structure (Recommended)
```
/api
├── /auth
│   ├── POST /login
│   ├── POST /register
│   └── POST /logout
├── /projects
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── PUT /:id
│   └── DELETE /:id
├── /bids
│   ├── GET /
│   ├── POST /
│   └── PUT /:id
└── /ai
    ├── POST /analyze
    └── GET /history
```

### Integration Steps
1. **Replace localStorage calls** with fetch/axios requests
2. **Add authentication headers** to all API calls
3. **Implement error handling** for network failures
4. **Add loading states** for better UX
5. **Update TypeScript types** to match API responses

## Styling & UI Components

### Tailwind CSS Configuration
**Location**: `tailwind.config.ts`

**Customization:**
- Add custom colors, fonts, and spacing
- Configure component variants
- Set up responsive breakpoints

### Component Styling
- Use Tailwind utility classes
- Follow Shadcn UI patterns
- Maintain consistent design system
- Implement responsive design

## Development Workflow

### 1. Setting Up Development Environment
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

### 2. Adding New Features
1. **Create TypeScript types** in `/src/types/`
2. **Add service functions** in `/src/services/`
3. **Create custom hooks** in `/src/hooks/` if needed
4. **Build UI components** in `/src/components/`
5. **Create page component** in `/src/pages/`
6. **Update routing** in `App.tsx`

### 3. Code Quality
- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful component names
- Add proper error handling
- Include loading states

## Backend Integration Guide

### 1. Authentication Backend
```typescript
// Required endpoints
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET /api/auth/me
```

### 2. Project Management Backend
```typescript
// Required endpoints
GET /api/projects
POST /api/projects
GET /api/projects/:id
PUT /api/projects/:id
DELETE /api/projects/:id
```

### 3. AI Analysis Backend
```typescript
// Required endpoints
POST /api/ai/analyze
GET /api/ai/history
POST /api/ai/generate-bid
```

### 4. File Upload Backend
```typescript
// Required endpoints
POST /api/upload
GET /api/files/:id
DELETE /api/files/:id
```

### 5. Real-time Features
```typescript
// WebSocket endpoints
WS /api/notifications
WS /api/project-updates
```

## Testing Strategy

### 1. Unit Testing
- Test individual components
- Test custom hooks
- Test utility functions
- Test service functions

### 2. Integration Testing
- Test component interactions
- Test API integrations
- Test authentication flow

### 3. E2E Testing
- Test complete user workflows
- Test critical paths
- Test responsive design

## Deployment

### 1. Build Process
```bash
npm run build
```

### 2. Environment Configuration
- Set up environment variables
- Configure API endpoints
- Set up authentication providers

### 3. Hosting Options
- Vercel (recommended for React apps)
- Netlify
- AWS S3 + CloudFront
- Docker containers

## Common Development Tasks

### Adding a New Page
1. Create component in `/src/pages/`
2. Add route in `App.tsx`
3. Add navigation link if needed
4. Implement required functionality

### Adding a New Feature
1. Define types in `/src/types/`
2. Create service functions
3. Build UI components
4. Add to appropriate page
5. Update navigation if needed

### Modifying Existing Features
1. Locate relevant files
2. Update types if needed
3. Modify service functions
4. Update UI components
5. Test thoroughly

### Debugging
1. Use React DevTools
2. Check browser console
3. Use TypeScript for type checking
4. Verify localStorage data
5. Test API responses

## Performance Optimization

### 1. Code Splitting
- Use React.lazy() for route-based splitting
- Implement dynamic imports for heavy components

### 2. Memoization
- Use React.memo() for expensive components
- Use useMemo() for expensive calculations
- Use useCallback() for function props

### 3. Bundle Optimization
- Tree shaking for unused code
- Optimize imports
- Use proper chunking

## Security Considerations

### 1. Authentication
- Implement proper JWT handling
- Add token refresh logic
- Secure localStorage usage

### 2. Data Validation
- Validate all user inputs
- Sanitize data before storage
- Use TypeScript for type safety

### 3. API Security
- Implement CORS properly
- Add rate limiting
- Validate API responses

## Troubleshooting

### Common Issues
1. **TypeScript Errors**: Check type definitions
2. **Routing Issues**: Verify route configuration
3. **State Management**: Check hook dependencies
4. **Styling Issues**: Verify Tailwind classes
5. **Build Errors**: Check import paths

### Debugging Tips
1. Use browser dev tools
2. Check React DevTools
3. Verify localStorage data
4. Test API endpoints
5. Review console errors

---

This guide provides a comprehensive overview of the DemAI codebase. For specific questions or additional guidance, refer to the individual file comments or create issues in the project repository.