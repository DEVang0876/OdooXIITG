# 🚀 Expense Management API - Complete Postman Testing Guide with Email OTP

## 📋 Overview
This comprehensive guide provides step-by-step instructions for testing the **Expense Management API** using Postman. The API features enterprise-grade **email OTP verification** and role-based authentication with three distinct user roles: **Admin**, **Manager**, and **User**.

### 🏗️ System Architecture
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens + **Email OTP Verification**
- **Security**: Role-based access control (RBAC) + Email verification
- **File Storage**: Multer for receipt uploads
- **Email Service**: Nodemailer with Gmail SMTP

### 🆕 NEW FEATURES
- ✅ **Email OTP Verification** for user registration
- ✅ **Email verification requirement** for login
- ✅ **Resend OTP functionality** with rate limiting
- ✅ **Professional HTML email templates**
- ✅ **Email verification middleware** for all protected routes

## 🔗 Base Configuration

### API Base URL
```
http://localhost:3000
```

### 🎯 Quick Setup Steps

#### 1. Start the Backend Server
```bash
# Navigate to backend directory
cd K:\OdooXIITG\backend

# Start the server
npm run dev
```
**Expected Output:**
```
🚀 Server is running on port 3000
🔧 API documentation: http://localhost:3000
📦 MongoDB Connected: [connection-string]
```

#### 2. Import Postman Collection
1. Download `Expense_Management_API.postman_collection.json`
2. Open Postman → Import → Select the JSON file
3. Create new environment: `Expense Management`

#### 3. Configure Postman Environment
Create these variables in your Postman environment:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseURL` | `http://localhost:3000` | `http://localhost:3000` |
| `authToken` | _(empty)_ | _(auto-set after login)_ |
| `refreshToken` | _(empty)_ | _(auto-set after login)_ |
| `userId` | _(empty)_ | _(auto-set after login)_ |
| `adminId` | _(empty)_ | _(manual entry)_ |
| `managerId` | _(empty)_ | _(manual entry)_ |
| `categoryId` | _(empty)_ | _(auto-set after category creation)_ |
| `expenseId` | _(empty)_ | _(auto-set after expense creation)_ |

---

## 🏠 1. System Health & Information

### 1.1 API Welcome Page
**Request:**
```http
GET {{baseURL}}/
```

**Expected Response:**
```json
{
  "message": "Welcome to Expense Management API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "auth": "/auth",
    "expenses": "/expenses",
    "categories": "/categories",
    "users": "/users",
    "analytics": "/analytics"
  }
}
```

### 1.2 Health Check Endpoint
**Request:**
```http
GET {{baseURL}}/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-04T12:00:00.000Z",
  "environment": "development"
}
```

**Test Script (Postman Tests tab):**
```javascript
pm.test("Health check returns OK", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response.status).to.eql("OK");
});
```

---

## 🔐 2. Authentication System with Email OTP

### 2.1 User Registration with Email OTP

#### 2.1.1 Register Admin User
**Request:**
```http
POST {{baseURL}}/api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "System",
  "lastName": "Administrator",
  "email": "admin@expenseapp.com",
  "password": "SecureAdmin123!",
  "role": "admin",
  "department": "IT Administration",
  "employeeId": "ADMIN001"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification code.",
  "data": {
    "user": {
      "id": "670ff123abc456def789",
      "firstName": "System",
      "lastName": "Administrator",
      "fullName": "System Administrator",
      "email": "admin@expenseapp.com",
      "role": "admin",
      "department": "IT Administration",
      "employeeId": "ADMIN001",
      "isActive": true,
      "isEmailVerified": false,
      "createdAt": "2025-10-04T10:30:00.000Z"
    },
    "requiresEmailVerification": true,
    "message": "Please verify your email before logging in"
  }
}
```

**Test Script:**
```javascript
pm.test("Admin registration successful", function () {
    pm.response.to.have.status(201);
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.data.user).to.have.property("email", "admin@expenseapp.com");
    pm.expect(response.data.user).to.have.property("isEmailVerified", false);
    pm.expect(response.data).to.have.property("requiresEmailVerification", true);
    
    // Store user ID for later use
    pm.environment.set("adminId", response.data.user.id);
    console.log(`Admin registered: ${response.data.user.fullName} - Email verification required`);
});
```

#### 2.1.2 Verify Email OTP
**Request:**
```http
POST {{baseURL}}/api/auth/verify-email
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@expenseapp.com",
  "otp": "123456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now login.",
  "data": {
    "user": {
      "id": "670ff123abc456def789",
      "email": "admin@expenseapp.com",
      "isEmailVerified": true,
      "verifiedAt": "2025-10-04T10:35:00.000Z"
    }
  }
}
```

**Test Script:**
```javascript
pm.test("Email verification successful", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.data.user).to.have.property("isEmailVerified", true);
    console.log("Email verified successfully - User can now login");
});
```

#### 2.1.3 Resend OTP (if needed)
**Request:**
```http
POST {{baseURL}}/api/auth/resend-otp
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@expenseapp.com"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "New verification code sent to your email",
  "data": {
    "canResendAt": "2025-10-04T10:36:00.000Z",
    "attemptsRemaining": 2
  }
}
```

#### 2.1.4 Register Manager User
**Request Body:**
```json
{
  "firstName": "Finance",
  "lastName": "Manager",
  "email": "manager@expenseapp.com",
  "password": "SecureManager123!",
  "role": "manager",
  "department": "Finance",
  "employeeId": "MGR001"
}
```

**Test Script:**
```javascript
pm.test("Manager registration successful", function () {
    pm.response.to.have.status(201);
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.data.user).to.have.property("role", "manager");
    pm.expect(response.data.user).to.have.property("department", "Finance");
    pm.expect(response.data.user).to.have.property("isEmailVerified", false);
    
    pm.environment.set("managerId", response.data.user.id);
    console.log(`Manager registered: ${response.data.user.fullName} - Requires email verification`);
});
```

#### 2.1.5 Register Regular User
**Request Body:**
```json
{
  "firstName": "Sales",
  "lastName": "Representative",
  "email": "user@expenseapp.com",
  "password": "SecureUser123!",
  "role": "user",
  "department": "Sales",
  "employeeId": "USR001",
  "manager": "{{managerId}}"
}
```
```json
{
  "name": "Sales Representative",
  "email": "user@expenseapp.com",
  "password": "SecureUser123!",
  "employeeId": "EMP003",
  "role": "user",
  "department": "Sales",
  "managerId": "{{managerId}}"
}
```

### 2.2 User Authentication with Email Verification

#### 2.2.1 Login (Verified User)
**Request:**
```http
POST {{baseURL}}/api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@expenseapp.com",
  "password": "SecureAdmin123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "670ff123abc456def789",
      "firstName": "System",
      "lastName": "Administrator",
      "fullName": "System Administrator",
      "email": "admin@expenseapp.com",
      "role": "admin",
      "department": "IT Administration",
      "employeeId": "ADMIN001",
      "isActive": true,
      "isEmailVerified": true,
      "lastLogin": "2025-10-04T10:40:00.000Z",
      "createdAt": "2025-10-04T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Test Script:**
```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.data).to.have.property("token");
    pm.expect(response.data).to.have.property("refreshToken");
    pm.expect(response.data.user).to.have.property("isEmailVerified", true);
    
    // Store tokens for authenticated requests
    pm.environment.set("authToken", response.data.token);
    pm.environment.set("refreshToken", response.data.refreshToken);
    pm.environment.set("userId", response.data.user.id);
    
    console.log(`Logged in as: ${response.data.user.fullName} (${response.data.user.role})`);
});
```

#### 2.2.2 Login (Unverified User) - Expected Error
**Request Body:**
```json
{
  "email": "unverified@expenseapp.com",
  "password": "SecureUser123!"
}
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Please verify your email before logging in",
  "requiresEmailVerification": true,
  "userId": "670ff123abc456def789"
}
```

**Test Script:**
```javascript
pm.test("Unverified login blocked", function () {
    pm.response.to.have.status(403);
    const response = pm.response.json();
    pm.expect(response.success).to.be.false;
    pm.expect(response).to.have.property("requiresEmailVerification", true);
    console.log("Login blocked - email verification required");
});
```

#### 2.2.3 Login (Manager)
**Request Body:**
```json
{
  "email": "manager@expenseapp.com",
  "password": "SecureManager123!"
}
```

#### 2.2.4 Login (User)

#### 2.2.3 Login (User)
**Request Body:**
```json
{
  "email": "user@expenseapp.com",
  "password": "SecureUser123!"
}
```

### 2.3 Token Management

#### 2.3.1 Refresh Authentication Token
**Request:**
```http
POST {{baseURL}}/auth/refresh
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "{{refreshToken}}"
}
```

**Test Script:**
```javascript
pm.test("Token refresh successful", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    
    // Update with new tokens
    pm.environment.set("authToken", response.token);
    if (response.refreshToken) {
        pm.environment.set("refreshToken", response.refreshToken);
    }
    
    pm.expect(response).to.have.property("token");
});
```

#### 2.3.2 Change Password
**Request:**
```http
POST {{baseURL}}/auth/change-password
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "SecureAdmin123!",
  "newPassword": "NewSecureAdmin123!"
}
```

#### 2.3.3 Get Current User Profile
**Request:**
```http
GET {{baseURL}}/auth/me
Authorization: Bearer {{authToken}}
```

#### 2.3.4 Logout
**Request:**
```http
POST {{baseURL}}/auth/logout
Authorization: Bearer {{authToken}}
```

**Test Script:**
```javascript
pm.test("Logout successful", function () {
    pm.response.to.have.status(200);
    
    // Clear tokens from environment
    pm.environment.unset("authToken");
    pm.environment.unset("refreshToken");
    
    console.log("User logged out, tokens cleared");
});
```

#### 2.3.5 Logout from All Devices
**Request:**
```http
POST {{baseURL}}/auth/logout-all
Authorization: Bearer {{authToken}}
```

---

## 👥 3. User Management System

### 3.1 Profile Management

#### 3.1.1 Get Current User Profile
**Request:**
```http
GET {{baseURL}}/users/profile
Authorization: Bearer {{authToken}}
```

**Test Script:**
```javascript
pm.test("Profile retrieved successfully", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    
    pm.expect(response).to.have.property("success", true);
    pm.expect(response.user).to.have.property("email");
    pm.expect(response.user).to.have.property("role");
    pm.expect(response.user).to.have.property("employeeId");
});
```

#### 3.1.2 Update User Profile
**Request:**
```http
PUT {{baseURL}}/users/profile
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Admin Name",
  "department": "Information Technology & Security",
  "phone": "+1-555-0123"
}
```

### 3.2 User Administration (Admin/Manager Only)

#### 3.2.1 Get All Users
**Request:**
```http
GET {{baseURL}}/users?page=1&limit=10&role=user&department=Sales
Authorization: Bearer {{authToken}}
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `role`: Filter by role (`admin`, `manager`, `user`)
- `department`: Filter by department
- `isActive`: Filter by active status (`true`, `false`)
- `search`: Search by name, email, or employee ID

**Test Script:**
```javascript
pm.test("Users list retrieved", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    
    pm.expect(response).to.have.property("success", true);
    pm.expect(response).to.have.property("users");
    pm.expect(response).to.have.property("pagination");
    pm.expect(response.pagination).to.have.property("total");
    pm.expect(response.pagination).to.have.property("page");
    pm.expect(response.pagination).to.have.property("pages");
});
```

#### 3.2.2 Get User by ID
**Request:**
```http
GET {{baseURL}}/users/{{userId}}
Authorization: Bearer {{authToken}}
```

#### 3.2.3 Create New User (Admin Only)
**Request:**
```http
POST {{baseURL}}/users
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "HR Manager",
  "email": "hr@expenseapp.com",
  "password": "TempPassword123!",
  "employeeId": "EMP004",
  "role": "manager",
  "department": "Human Resources",
  "managerId": "{{adminId}}"
}
```

#### 3.2.4 Update User (Admin Only)
**Request:**
```http
PUT {{baseURL}}/users/{{userId}}
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated User Name",
  "role": "manager",
  "department": "Human Resources",
  "isActive": true
}
```

#### 3.2.5 Deactivate User (Admin Only)
**Request:**
```http
DELETE {{baseURL}}/users/{{userId}}
Authorization: Bearer {{authToken}}
```

**Note:** This performs a soft delete by setting `isActive: false`

#### 3.2.6 Get User Expense Summary
**Request:**
```http
GET {{baseURL}}/users/{{userId}}/expenses/summary
Authorization: Bearer {{authToken}}
```

---

## 📂 4. Category Management

### 4.1 Category Operations

#### 4.1.1 Create Category (Admin/Manager Only)
**Request:**
```http
POST {{baseURL}}/categories
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Business Travel",
  "description": "Travel expenses including flights, hotels, and transportation",
  "isActive": true
}
```

**Test Script:**
```javascript
pm.test("Category created successfully", function () {
    pm.response.to.have.status(201);
    const response = pm.response.json();
    
    if (response.category && response.category.id) {
        pm.environment.set("categoryId", response.category.id);
    }
    
    pm.expect(response).to.have.property("success", true);
    pm.expect(response.category).to.have.property("name", "Business Travel");
    pm.expect(response.category).to.have.property("isActive", true);
});
```

#### 4.1.2 Get All Categories
**Request:**
```http
GET {{baseURL}}/categories?isActive=true
Authorization: Bearer {{authToken}}
```

**Query Parameters:**
- `isActive`: Filter by active status
- `search`: Search by name or description

#### 4.1.3 Get Category by ID
**Request:**
```http
GET {{baseURL}}/categories/{{categoryId}}
Authorization: Bearer {{authToken}}
```

#### 4.1.4 Update Category (Admin/Manager Only)
**Request:**
```http
PUT {{baseURL}}/categories/{{categoryId}}
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Business Travel & Transportation",
  "description": "Updated description for travel-related expenses",
  "isActive": true
}
```

#### 4.1.5 Delete Category (Admin Only)
**Request:**
```http
DELETE {{baseURL}}/categories/{{categoryId}}
Authorization: Bearer {{authToken}}
```

#### 4.1.6 Get Category Statistics
**Request:**
```http
GET {{baseURL}}/categories/{{categoryId}}/stats
Authorization: Bearer {{authToken}}
```

### 4.2 Sample Categories to Create

Create these categories for comprehensive testing:

1. **Business Travel**
   ```json
   {
     "name": "Business Travel",
     "description": "Flights, hotels, and transportation"
   }
   ```

2. **Meals & Entertainment**
   ```json
   {
     "name": "Meals & Entertainment",
     "description": "Business meals and client entertainment"
   }
   ```

3. **Office Supplies**
   ```json
   {
     "name": "Office Supplies",
     "description": "Stationery, equipment, and office materials"
   }
   ```

4. **Training & Development**
   ```json
   {
     "name": "Training & Development",
     "description": "Professional development and training courses"
   }
   ```

---

## 💰 5. Expense Management System

### 5.1 Creating Expenses

#### 5.1.1 Create Basic Expense
**Request:**
```http
POST {{baseURL}}/expenses
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 245.75,
  "description": "Business lunch with potential client from TechCorp",
  "categoryId": "{{categoryId}}",
  "expenseDate": "2025-10-04",
  "merchant": "The Business Grill Restaurant",
  "location": "Downtown Business District",
  "notes": "Discussed potential partnership deal"
}
```

**Test Script:**
```javascript
pm.test("Expense created successfully", function () {
    pm.response.to.have.status(201);
    const response = pm.response.json();
    
    if (response.expense && response.expense.id) {
        pm.environment.set("expenseId", response.expense.id);
    }
    
    pm.expect(response).to.have.property("success", true);
    pm.expect(response.expense).to.have.property("status", "pending");
    pm.expect(response.expense).to.have.property("amount", 245.75);
    
    console.log(`Expense created with ID: ${response.expense.id}`);
});
```

#### 5.1.2 Create Expense with Receipt Upload
**Request:**
```http
POST {{baseURL}}/expenses/upload
Authorization: Bearer {{authToken}}
Content-Type: multipart/form-data
```

**Form Data:**
- `amount`: 1250.00
- `description`: International flight for business conference
- `categoryId`: {{categoryId}}
- `expenseDate`: 2025-10-05
- `merchant`: Airways International
- `location`: Airport
- `receipt`: [Select receipt file - JPG, PNG, PDF, DOC, DOCX up to 5MB]

**Test Script:**
```javascript
pm.test("Expense with receipt created", function () {
    pm.response.to.have.status(201);
    const response = pm.response.json();
    
    pm.expect(response.expense).to.have.property("receiptUrl");
    pm.expect(response.expense.receiptUrl).to.not.be.empty;
    
    console.log(`Receipt uploaded: ${response.expense.receiptUrl}`);
});
```

### 5.2 Retrieving Expenses

#### 5.2.1 Get User's Own Expenses
**Request:**
```http
GET {{baseURL}}/expenses?page=1&limit=10&status=pending&sortBy=expenseDate&sortOrder=desc
Authorization: Bearer {{authToken}}
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `status`: Filter by status (`pending`, `approved`, `rejected`)
- `categoryId`: Filter by category
- `startDate`: Start date filter (YYYY-MM-DD)
- `endDate`: End date filter (YYYY-MM-DD)
- `minAmount`: Minimum amount filter
- `maxAmount`: Maximum amount filter
- `sortBy`: Sort field (`expenseDate`, `amount`, `createdAt`)
- `sortOrder`: Sort order (`asc`, `desc`)
- `search`: Search in description, merchant, or notes

#### 5.2.2 Get All Expenses (Admin/Manager Only)
**Request:**
```http
GET {{baseURL}}/expenses/all?userId={{userId}}&department=Sales
Authorization: Bearer {{authToken}}
```

**Additional Query Parameters (Admin/Manager):**
- `userId`: Filter by specific user
- `department`: Filter by department
- `managerId`: Filter by manager (Admin only)

#### 5.2.3 Get Expense by ID
**Request:**
```http
GET {{baseURL}}/expenses/{{expenseId}}
Authorization: Bearer {{authToken}}
```

**Test Script:**
```javascript
pm.test("Expense details retrieved", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    
    pm.expect(response).to.have.property("success", true);
    pm.expect(response.expense).to.have.property("id");
    pm.expect(response.expense).to.have.property("amount");
    pm.expect(response.expense).to.have.property("status");
    pm.expect(response.expense).to.have.property("user");
    pm.expect(response.expense).to.have.property("category");
});
```

### 5.3 Updating Expenses

#### 5.3.1 Update Expense (Own expenses, pending status only)
**Request:**
```http
PUT {{baseURL}}/expenses/{{expenseId}}
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 275.50,
  "description": "Updated: Business lunch with TechCorp team (extended meeting)",
  "merchant": "The Business Grill Restaurant",
  "location": "Downtown Business District",
  "notes": "Meeting extended, discussed contract details and timeline"
}
```

#### 5.3.2 Update Expense with Receipt
**Request:**
```http
PUT {{baseURL}}/expenses/{{expenseId}}/upload
Authorization: Bearer {{authToken}}
Content-Type: multipart/form-data
```

**Form Data:**
- `amount`: 275.50
- `description`: Updated business lunch expense
- `receipt`: [Select new receipt file]

### 5.4 Expense Approval Workflow

#### 5.4.1 Approve Expense (Manager/Admin Only)
**Request:**
```http
PUT {{baseURL}}/expenses/{{expenseId}}/approve
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "comments": "Approved - Valid business expense with proper documentation. Reimbursement will be processed in next payroll cycle."
}
```

**Test Script:**
```javascript
pm.test("Expense approved successfully", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    
    pm.expect(response).to.have.property("success", true);
    pm.expect(response.expense).to.have.property("status", "approved");
    pm.expect(response.expense).to.have.property("approvedBy");
    pm.expect(response.expense).to.have.property("approvedAt");
    
    console.log(`Expense approved by: ${response.expense.approvedBy.name}`);
});
```

#### 5.4.2 Reject Expense (Manager/Admin Only)
**Request:**
```http
PUT {{baseURL}}/expenses/{{expenseId}}/reject
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "comments": "Rejected - Receipt is unclear and does not show business purpose. Please resubmit with proper documentation."
}
```

### 5.5 Expense Deletion

#### 5.5.1 Delete Expense
**Request:**
```http
DELETE {{baseURL}}/expenses/{{expenseId}}
Authorization: Bearer {{authToken}}
```

**Test Script:**
```javascript
pm.test("Expense deleted successfully", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    
    pm.expect(response).to.have.property("success", true);
    pm.expect(response).to.have.property("message");
});
```

### 5.6 Bulk Operations

#### 5.6.1 Bulk Approve Expenses (Manager/Admin Only)
**Request:**
```http
POST {{baseURL}}/expenses/bulk/approve
Authorization: Bearer {{authToken}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "expenseIds": ["expenseId1", "expenseId2", "expenseId3"],
  "comments": "Bulk approval - All expenses reviewed and verified"
}
```

#### 5.6.2 Export Expenses (CSV/Excel)
**Request:**
```http
GET {{baseURL}}/expenses/export?format=csv&startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer {{authToken}}
```

**Query Parameters:**
- `format`: Export format (`csv`, `excel`)
- `startDate`: Start date for export
- `endDate`: End date for export
- All other expense filtering parameters apply

---

## 📊 6. Analytics & Reporting System

### 6.1 Dashboard Analytics

#### 6.1.1 Get Dashboard Overview
**Request:**
```http
GET {{baseURL}}/analytics/dashboard?period=monthly
Authorization: Bearer {{authToken}}
```

**Query Parameters:**
- `period`: Time period (`daily`, `weekly`, `monthly`, `yearly`)

**Expected Response:**
```json
{
  "success": true,
  "analytics": {
    "overview": {
      "totalExpenses": 1250.75,
      "pendingExpenses": 3,
      "approvedExpenses": 15,
      "rejectedExpenses": 2,
      "averageExpenseAmount": 156.34
    },
    "topCategories": [
      {
        "category": "Business Travel",
        "totalAmount": 850.00,
        "count": 8
      }
    ],
    "recentExpenses": [...],
    "monthlyTrends": [...]
  }
}
```

**Test Script:**
```javascript
pm.test("Dashboard analytics retrieved", function () {
    pm.response.to.have.status(200);
    const response = pm.response.json();
    
    pm.expect(response).to.have.property("success", true);
    pm.expect(response.analytics).to.have.property("overview");
    pm.expect(response.analytics).to.have.property("topCategories");
    pm.expect(response.analytics.overview).to.have.property("totalExpenses");
    
    console.log(`Total expenses: $${response.analytics.overview.totalExpenses}`);
});
```

### 6.2 Detailed Reports

#### 6.2.1 Expense Reports by Category
**Request:**
```http
GET {{baseURL}}/analytics/reports?groupBy=category&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer {{authToken}}
```

**Query Parameters:**
- `groupBy`: Grouping field (`category`, `user`, `month`, `status`, `department`)
- `startDate`: Report start date (YYYY-MM-DD)
- `endDate`: Report end date (YYYY-MM-DD)
- `userId`: Filter by specific user (Admin/Manager only)
- `department`: Filter by department (Admin/Manager only)
- `categoryId`: Filter by specific category

#### 6.2.2 User Expense Reports
**Request:**
```http
GET {{baseURL}}/analytics/reports?groupBy=user&department=Sales
Authorization: Bearer {{authToken}}
```

#### 6.2.3 Monthly Expense Reports
**Request:**
```http
GET {{baseURL}}/analytics/reports?groupBy=month&year=2025
Authorization: Bearer {{authToken}}
```

#### 6.2.4 Status-wise Reports
**Request:**
```http
GET {{baseURL}}/analytics/reports?groupBy=status&startDate=2025-10-01
Authorization: Bearer {{authToken}}
```

### 6.3 Trend Analysis

#### 6.3.1 Monthly Trends
**Request:**
```http
GET {{baseURL}}/analytics/trends?period=monthly&compare=true
Authorization: Bearer {{authToken}}
```

**Query Parameters:**
- `period`: Analysis period (`daily`, `weekly`, `monthly`, `yearly`)
- `compare`: Compare with previous period (`true`, `false`)
- `months`: Number of months to analyze (default: 12)

#### 6.3.2 Weekly Trends
**Request:**
```http
GET {{baseURL}}/analytics/trends?period=weekly&weeks=8
Authorization: Bearer {{authToken}}
```

#### 6.3.3 Yearly Comparison
**Request:**
```http
GET {{baseURL}}/analytics/trends?period=yearly&compare=true&years=3
Authorization: Bearer {{authToken}}
```

### 6.4 Advanced Analytics (Admin/Manager Only)

#### 6.4.1 Department Performance
**Request:**
```http
GET {{baseURL}}/analytics/departments
Authorization: Bearer {{authToken}}
```

#### 6.4.2 Expense Approval Analytics
**Request:**
```http
GET {{baseURL}}/analytics/approvals?managerId={{managerId}}&period=monthly
Authorization: Bearer {{authToken}}
```

#### 6.4.3 Budget vs Actual Analysis
**Request:**
```http
GET {{baseURL}}/analytics/budget-analysis?department=Sales&period=monthly
Authorization: Bearer {{authToken}}
```

---

## 🧪 7. Complete Testing Workflows

### 7.1 Admin Complete Workflow
**Testing Sequence:**

1. **Initial Setup**
   ```http
   POST {{baseURL}}/auth/register    # Register as admin
   POST {{baseURL}}/auth/login       # Login as admin
   ```

2. **System Configuration**
   ```http
   POST {{baseURL}}/categories       # Create categories
   POST {{baseURL}}/users           # Create manager user
   POST {{baseURL}}/users           # Create regular user
   ```

3. **User Management**
   ```http
   GET {{baseURL}}/users            # View all users
   PUT {{baseURL}}/users/{{userId}} # Update user details
   GET {{baseURL}}/users/{{userId}}/expenses/summary # View user summary
   ```

4. **Expense Oversight**
   ```http
   GET {{baseURL}}/expenses/all     # View all expenses
   PUT {{baseURL}}/expenses/{{expenseId}}/approve  # Approve expenses
   PUT {{baseURL}}/expenses/{{expenseId}}/reject   # Reject expenses
   ```

5. **Analytics & Reporting**
   ```http
   GET {{baseURL}}/analytics/dashboard    # View dashboard
   GET {{baseURL}}/analytics/reports      # Generate reports
   GET {{baseURL}}/analytics/departments  # Department analysis
   ```

### 7.2 Manager Workflow
**Testing Sequence:**

1. **Authentication**
   ```http
   POST {{baseURL}}/auth/login       # Login as manager
   GET {{baseURL}}/auth/me          # Verify profile
   ```

2. **Team Management**
   ```http
   GET {{baseURL}}/users?managerId={{managerId}}  # View team members
   GET {{baseURL}}/expenses/all?department=Sales  # View team expenses
   ```

3. **Personal Expenses**
   ```http
   POST {{baseURL}}/expenses        # Create personal expense
   POST {{baseURL}}/expenses/upload # Upload receipt
   GET {{baseURL}}/expenses         # View own expenses
   ```

4. **Approval Workflow**
   ```http
   GET {{baseURL}}/expenses/all?status=pending    # View pending expenses
   PUT {{baseURL}}/expenses/{{expenseId}}/approve # Approve team expenses
   ```

5. **Team Analytics**
   ```http
   GET {{baseURL}}/analytics/dashboard            # Team dashboard
   GET {{baseURL}}/analytics/reports?groupBy=user # Team reports
   ```

### 7.3 User Workflow
**Testing Sequence:**

1. **Authentication & Profile**
   ```http
   POST {{baseURL}}/auth/login       # Login as user
   GET {{baseURL}}/users/profile     # View profile
   PUT {{baseURL}}/users/profile     # Update profile
   ```

2. **Expense Management**
   ```http
   GET {{baseURL}}/categories        # View available categories
   POST {{baseURL}}/expenses         # Create expense
   POST {{baseURL}}/expenses/upload  # Upload expense with receipt
   GET {{baseURL}}/expenses          # View own expenses
   PUT {{baseURL}}/expenses/{{expenseId}} # Update pending expense
   ```

3. **Expense Tracking**
   ```http
   GET {{baseURL}}/expenses?status=pending   # View pending expenses
   GET {{baseURL}}/expenses?status=approved  # View approved expenses
   GET {{baseURL}}/expenses/{{expenseId}}    # View expense details
   ```

4. **Personal Analytics**
   ```http
   GET {{baseURL}}/analytics/dashboard       # Personal dashboard
   GET {{baseURL}}/analytics/trends?period=monthly # Personal trends
   ```

---

## 🎯 8. Advanced Testing Scenarios

### 8.1 Authentication & Authorization Tests

#### 8.1.1 Invalid Authentication Tests
```http
# Test without token
GET {{baseURL}}/users/profile

# Test with invalid token
GET {{baseURL}}/users/profile
Authorization: Bearer invalid_token_here

# Test with expired token
GET {{baseURL}}/users/profile
Authorization: Bearer {{expiredToken}}
```

#### 8.1.2 Role-based Access Tests
```http
# User trying to access admin endpoint (should fail)
GET {{baseURL}}/users
Authorization: Bearer {{userToken}}

# Manager trying to access admin-only endpoint (should fail)
DELETE {{baseURL}}/users/{{userId}}
Authorization: Bearer {{managerToken}}
```

### 8.2 Data Validation Tests

#### 8.2.1 Invalid Expense Data
```json
{
  "amount": -100,              // Negative amount (should fail)
  "description": "",           // Empty description (should fail)
  "categoryId": "invalid_id",  // Invalid category (should fail)
  "expenseDate": "invalid_date" // Invalid date (should fail)
}
```

#### 8.2.2 Invalid User Registration
```json
{
  "name": "",                  // Empty name (should fail)
  "email": "invalid_email",    // Invalid email format (should fail)
  "password": "123",           // Weak password (should fail)
  "role": "invalid_role"       // Invalid role (should fail)
}
```

### 8.3 Edge Cases Testing

#### 8.3.1 Large File Upload
```http
# Upload file larger than 5MB (should fail)
POST {{baseURL}}/expenses/upload
# Attach file > 5MB
```

#### 8.3.2 Concurrent Operations
```http
# Simultaneous approval by different managers (should handle gracefully)
PUT {{baseURL}}/expenses/{{expenseId}}/approve
PUT {{baseURL}}/expenses/{{expenseId}}/reject
```

#### 8.3.3 Pagination Limits
```http
# Request more than maximum limit
GET {{baseURL}}/expenses?limit=1000
```

---

## 🔐 9. Security & Performance Testing

### 9.1 Rate Limiting Tests

#### 9.1.1 Test Rate Limits
```http
# Send multiple rapid requests to test rate limiting
# Current limit: 100 requests per 15 minutes
GET {{baseURL}}/health
```

**Expected Response (when limit exceeded):**
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

### 9.2 File Upload Security

#### 9.2.1 Valid File Types
- ✅ JPG, JPEG, PNG (images)
- ✅ PDF (documents)
- ✅ DOC, DOCX (Word documents)

#### 9.2.2 Invalid File Types (should fail)
- ❌ EXE, BAT (executables)
- ❌ JS, PHP (scripts)
- ❌ ZIP, RAR (archives)

### 9.3 Input Sanitization Tests

#### 9.3.1 SQL Injection Attempts
```json
{
  "email": "admin@test.com'; DROP TABLE users; --",
  "password": "password"
}
```

#### 9.3.2 XSS Attempts
```json
{
  "description": "<script>alert('XSS')</script>",
  "amount": 100
}
```

---

## 🎯 10. Complete Testing Checklist

### ✅ Authentication & Authorization
- [ ] Register admin user
- [ ] Register manager user  
- [ ] Register regular user
- [ ] Login with valid credentials (all roles)
- [ ] Login with invalid credentials (should fail)
- [ ] Access protected routes without token (should fail)
- [ ] Access protected routes with invalid token (should fail)
- [ ] Refresh token functionality
- [ ] Logout functionality
- [ ] Logout from all devices
- [ ] Change password
- [ ] Role-based access control verification

### ✅ User Management
- [ ] Get current user profile
- [ ] Update user profile
- [ ] Get all users (admin/manager only)
- [ ] Get user by ID
- [ ] Create new user (admin only)
- [ ] Update user (admin only)
- [ ] Deactivate user (admin only)
- [ ] Get user expense summary
- [ ] Test user access restrictions

### ✅ Category Management
- [ ] Create category (admin/manager only)
- [ ] Get all categories
- [ ] Get category by ID
- [ ] Update category (admin/manager only)
- [ ] Delete category (admin only)
- [ ] Get category statistics
- [ ] Test category access restrictions

### ✅ Expense Management
- [ ] Create basic expense
- [ ] Create expense with receipt upload
- [ ] Get user's expenses with filters
- [ ] Get all expenses (admin/manager only)
- [ ] Get expense by ID
- [ ] Update expense (own, pending only)
- [ ] Update expense with receipt
- [ ] Approve expense (manager/admin only)
- [ ] Reject expense (manager/admin only)
- [ ] Delete expense
- [ ] Bulk operations
- [ ] Export expenses

### ✅ Analytics & Reporting
- [ ] Dashboard analytics
- [ ] Expense reports by category
- [ ] Expense reports by user
- [ ] Monthly expense reports
- [ ] Status-wise reports
- [ ] Trend analysis (monthly, weekly, yearly)
- [ ] Department performance (admin/manager only)
- [ ] Approval analytics
- [ ] Budget vs actual analysis

### ✅ Data Validation
- [ ] Invalid expense amounts (negative, zero)
- [ ] Invalid dates (future dates, invalid formats)
- [ ] Missing required fields
- [ ] Invalid email formats
- [ ] Weak passwords
- [ ] Invalid file uploads
- [ ] Large file uploads (>5MB)
- [ ] Invalid file types

### ✅ Security Testing
- [ ] Rate limiting functionality
- [ ] File upload security
- [ ] Input sanitization (XSS, SQL injection)
- [ ] CORS policy enforcement
- [ ] Secure headers (helmet)
- [ ] JWT token expiration
- [ ] Refresh token rotation

### ✅ Edge Cases
- [ ] Concurrent expense approvals
- [ ] Pagination with large datasets
- [ ] Empty result sets
- [ ] Database connection failures
- [ ] Server error handling

---

## 🚨 11. Common Error Codes & Solutions

### 400 Bad Request
**Causes:**
- Invalid request data format
- Missing required fields
- Validation errors

**Example Response:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}
```

### 401 Unauthorized
**Causes:**
- Missing authentication token
- Invalid or expired token
- Malformed Authorization header

**Solutions:**
- Ensure token is set: `Authorization: Bearer {{authToken}}`
- Login again to get fresh token
- Check token format and validity

### 403 Forbidden
**Causes:**
- Insufficient permissions for the requested action
- Role-based access control violations

**Example Response:**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
**Causes:**
- Invalid endpoint URL
- Resource does not exist
- Incorrect resource ID

### 409 Conflict
**Causes:**
- Duplicate email during registration
- Duplicate employee ID
- Resource already exists

### 413 Payload Too Large
**Causes:**
- File upload exceeds 5MB limit
- Request body too large

### 429 Too Many Requests
**Causes:**
- Rate limit exceeded (100 requests per 15 minutes)
- Multiple rapid requests from same IP

### 500 Internal Server Error
**Causes:**
- Database connection issues
- Server-side errors
- Unhandled exceptions

**Solutions:**
- Check server logs
- Verify database connection
- Contact system administrator

---

## 📝 12. Sample Test Data Sets

### 12.1 User Test Data

#### Admin User
```json
{
  "name": "System Administrator",
  "email": "admin@expenseapp.com",
  "password": "SecureAdmin123!",
  "employeeId": "EMP001",
  "role": "admin",
  "department": "Information Technology"
}
```

#### Manager Users
```json
[
  {
    "name": "Finance Manager",
    "email": "finance.manager@expenseapp.com",
    "password": "SecureManager123!",
    "employeeId": "EMP002",
    "role": "manager",
    "department": "Finance"
  },
  {
    "name": "Sales Manager",
    "email": "sales.manager@expenseapp.com",
    "password": "SecureManager123!",
    "employeeId": "EMP003",
    "role": "manager",
    "department": "Sales"
  }
]
```

#### Regular Users
```json
[
  {
    "name": "Sales Representative",
    "email": "sales.rep@expenseapp.com",
    "password": "SecureUser123!",
    "employeeId": "EMP004",
    "role": "user",
    "department": "Sales",
    "managerId": "EMP003"
  },
  {
    "name": "Marketing Specialist",
    "email": "marketing@expenseapp.com",
    "password": "SecureUser123!",
    "employeeId": "EMP005",
    "role": "user",
    "department": "Marketing",
    "managerId": "EMP002"
  }
]
```

### 12.2 Category Test Data
```json
[
  {
    "name": "Business Travel",
    "description": "Flights, hotels, transportation, and accommodation"
  },
  {
    "name": "Meals & Entertainment",
    "description": "Business meals, client entertainment, and team events"
  },
  {
    "name": "Office Supplies",
    "description": "Stationery, equipment, furniture, and office materials"
  },
  {
    "name": "Training & Development",
    "description": "Professional courses, certifications, and skill development"
  },
  {
    "name": "Technology",
    "description": "Software licenses, hardware, and IT equipment"
  },
  {
    "name": "Marketing",
    "description": "Advertising, promotional materials, and marketing campaigns"
  }
]
```

### 12.3 Expense Test Data
```json
[
  {
    "amount": 450.00,
    "description": "Round-trip flight to client meeting in Chicago",
    "categoryId": "business_travel_id",
    "expenseDate": "2025-10-01",
    "merchant": "United Airlines",
    "location": "Chicago, IL"
  },
  {
    "amount": 125.75,
    "description": "Business lunch with potential client",
    "categoryId": "meals_entertainment_id",
    "expenseDate": "2025-10-02",
    "merchant": "The Business Grill",
    "location": "Downtown"
  },
  {
    "amount": 89.99,
    "description": "Office supplies: pens, notebooks, printer paper",
    "categoryId": "office_supplies_id",
    "expenseDate": "2025-10-03",
    "merchant": "Office Depot",
    "location": "Main Street"
  },
  {
    "amount": 299.00,
    "description": "Project management certification course",
    "categoryId": "training_development_id",
    "expenseDate": "2025-10-04",
    "merchant": "Training Institute",
    "location": "Online"
  }
]
```

---

## 🎉 13. Success Criteria & Completion

### 🎯 Testing Complete When:
- [ ] All authentication flows work correctly
- [ ] Role-based permissions are properly enforced
- [ ] All CRUD operations function as expected
- [ ] File upload system works securely
- [ ] Analytics provide accurate data
- [ ] Error handling is robust
- [ ] Security measures are effective
- [ ] Performance meets requirements

### 🏆 API Quality Metrics:
- **Response Time**: < 500ms for most operations
- **Uptime**: 99.9% availability
- **Security**: Zero successful unauthorized access attempts
- **Data Integrity**: 100% accurate financial calculations
- **User Experience**: Intuitive error messages and responses

---

## 🚀 14. Next Steps

### 🔄 Continuous Testing
1. **Automated Testing**: Consider implementing automated API tests
2. **Load Testing**: Test with multiple concurrent users
3. **Security Audits**: Regular security vulnerability assessments
4. **Performance Monitoring**: Monitor API response times and resource usage

### 📈 Enhancements
1. **API Documentation**: Generate OpenAPI/Swagger documentation
2. **Monitoring**: Implement logging and monitoring solutions
3. **Caching**: Add Redis for improved performance
4. **Notifications**: Email/SMS notifications for expense approvals

---

## 🎊 Congratulations!

You now have a **complete, enterprise-grade** Expense Management API with:

- ✅ **Robust Authentication** with JWT and refresh tokens
- ✅ **Role-Based Access Control** (Admin/Manager/User)
- ✅ **Comprehensive CRUD Operations** for all entities
- ✅ **File Upload System** with security validation
- ✅ **Advanced Analytics** and reporting capabilities
- ✅ **Professional Error Handling** and validation
- ✅ **Security Best Practices** implementation
- ✅ **Complete Test Coverage** documentation

**Start testing and building amazing expense management solutions!** 🚀💼

---

**Happy Testing & Development!** 🎯✨