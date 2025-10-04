# Backend API Documentation

## Overview
The Expense Management System backend provides RESTful APIs for managing users, expenses, categories, analytics, and authentication.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication Routes (`/auth`)
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### User Routes (`/users`)
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `DELETE /users/profile` - Delete user account

### Expense Routes (`/expenses`)
- `GET /expenses` - Get all expenses (with filtering)
- `POST /expenses` - Create new expense
- `GET /expenses/:id` - Get expense by ID
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense
- `POST /expenses/:id/approve` - Approve expense (manager only)
- `POST /expenses/:id/reject` - Reject expense (manager only)

### Category Routes (`/categories`)
- `GET /categories` - Get all categories
- `POST /categories` - Create new category (admin only)
- `GET /categories/:id` - Get category by ID
- `PUT /categories/:id` - Update category (admin only)
- `DELETE /categories/:id` - Delete category (admin only)

### Analytics Routes (`/analytics`)
- `GET /analytics/summary` - Get expense summary
- `GET /analytics/trends` - Get expense trends
- `GET /analytics/category-breakdown` - Get expenses by category
- `GET /analytics/user-stats` - Get user statistics

## Running the Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (copy `.env.example` to `.env` and configure)

4. Start the server:
   ```bash
   npm start
   ```

## Postman Collection

Import the Postman collection from `backend/POSTMAN_TESTING_GUIDE.md` or the JSON file for testing all endpoints.

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in JSON format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Data Models

### User
- id: String
- name: String
- email: String
- role: String (employee/manager/admin)
- department: String

### Expense
- id: String
- title: String
- amount: Number
- category: String
- description: String
- date: Date
- status: String (pending/approved/rejected)
- userId: String
- receipts: Array of file URLs

### Category
- id: String
- name: String
- description: String