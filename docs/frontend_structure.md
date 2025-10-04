# Frontend Structure Documentation

## Overview
The Expense Management System frontend is built with React and Vite, providing a modern web interface for expense management.

## Technology Stack
- React 18
- Vite (build tool)
- React Router (routing)
- Axios (HTTP client)
- CSS Modules (styling)

## Project Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── AnalyticsTiles.jsx      # Dashboard analytics display
│   │   ├── ApprovalModal.jsx       # Expense approval modal
│   │   ├── ApprovalTimeline.jsx    # Approval status timeline
│   │   ├── Header.jsx              # Application header
│   │   ├── Modal.jsx               # Generic modal component
│   │   ├── ProtectedRoute.jsx      # Route protection wrapper
│   │   ├── SearchFilter.jsx        # Search and filter component
│   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   ├── Toasts.jsx              # Toast notifications
│   │   └── UserForm.jsx            # User creation/editing form
│   ├── pages/
│   │   ├── AddExpense.jsx          # Add new expense page
│   │   ├── AdminDashboard.jsx      # Admin dashboard
│   │   ├── ApprovalDetails.jsx     # Expense approval details
│   │   ├── ApprovalRules.jsx       # Approval rules management
│   │   ├── EmployeeDashboard.jsx   # Employee dashboard
│   │   ├── ForgotPassword.jsx      # Password reset request
│   │   ├── Home.jsx                # Landing page
│   │   ├── Login.jsx               # User login page
│   │   ├── ManagerDashboard.jsx    # Manager dashboard
│   │   ├── ResetPassword.jsx       # Password reset page
│   │   ├── Signup.jsx              # User registration
│   │   └── SystemSettings.jsx      # System configuration
│   ├── services/
│   │   ├── api.js                  # API service functions
│   │   ├── auth.js                 # Authentication service
│   │   ├── mockStore.js            # Mock data store
│   │   └── __tests__/              # Service tests
│   ├── utils/
│   │   ├── exportCsv.js            # CSV export utility
│   │   ├── validators.js           # Form validation utilities
│   │   └── __tests__/              # Utility tests
│   ├── App.css                     # Global styles
│   ├── App.jsx                     # Main App component
│   ├── index.css                   # Base styles
│   ├── main.jsx                    # Application entry point
│   └── profile.jsx                 # User profile component
├── index.html                      # HTML template
├── package.json                    # Dependencies and scripts
├── vite.config.js                  # Vite configuration
└── eslint.config.js                # ESLint configuration
```

## Key Components

### Core Components
- **App.jsx**: Main application component with routing
- **Header.jsx**: Top navigation bar
- **Sidebar.jsx**: Left navigation menu
- **ProtectedRoute.jsx**: Route guard for authenticated users

### Page Components
- **Login/Signup**: Authentication pages
- **Dashboards**: Role-specific dashboards (Employee, Manager, Admin)
- **Expense Management**: Add, view, approve expenses
- **Analytics**: Expense analytics and reporting

### Utility Components
- **Modal.jsx**: Reusable modal dialog
- **Toasts.jsx**: Notification system
- **SearchFilter.jsx**: Data filtering interface

## Services

### API Service (`services/api.js`)
Handles all HTTP requests to the backend:
- Expense CRUD operations
- User management
- Analytics data fetching
- File uploads

### Auth Service (`services/auth.js`)
Manages authentication state:
- Login/logout
- Token management
- User session handling

## Utilities

### Validators (`utils/validators.js`)
Form validation functions:
- Email validation
- Password strength checking
- Amount validation
- Date validation

### Export CSV (`utils/exportCsv.js`)
Data export functionality for reports and analytics.

## Running the Frontend

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Environment Setup

Create a `.env` file in the frontend root with:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Testing

Run tests with:
```bash
npm test
```

## Deployment

The built files in `dist/` can be served by any static web server.