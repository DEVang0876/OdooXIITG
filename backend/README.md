# Expense Management System - Backend API

A Node.js Express backend API for managing expenses, built with modern JavaScript/ES6.

## 🚀 Installed Modules

### Core Dependencies
- **express** - Fast, unopinionated web framework for Node.js
- **cors** - Enable Cross-Origin Resource Sharing
- **helmet** - Security middleware for Express
- **morgan** - HTTP request logging middleware
- **dotenv** - Loads environment variables from .env file

### Database & Data
- **mongoose** - MongoDB object modeling for Node.js
- **joi** - Object schema validation
- **bcryptjs** - Password hashing library

### Authentication & Security
- **jsonwebtoken** - JSON Web Token implementation
- **express-rate-limit** - Rate limiting middleware
- **cookie-parser** - Parse cookie headers

### File Handling & Utilities
- **multer** - Middleware for handling multipart/form-data (file uploads)
- **moment** - Date manipulation library
- **uuid** - Generate unique identifiers

### Development Dependencies
- **nodemon** - Automatically restart server during development
- **jest** - JavaScript testing framework
- **supertest** - HTTP testing library

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # Route definitions
│   └── utils/          # Utility functions
├── tests/              # Test files
├── uploads/            # File upload directory
├── .env                # Environment variables
├── .env.example        # Environment variables template
├── index.js            # Application entry point
└── package.json        # Dependencies and scripts
```

## 🛠️ Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## 🚀 Getting Started

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Test the API**:
   - Health check: http://localhost:3000/health
   - API info: http://localhost:3000/api

## 🗄️ Database Setup

### MongoDB (Recommended)
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in your `.env` file
3. The app will connect automatically

### PostgreSQL (Alternative)
If you prefer PostgreSQL, install these additional packages:
```bash
npm install pg sequelize
```

## 📋 Next Steps

1. **Create Database Models** - Define schemas for users, expenses, categories
2. **Implement Authentication** - JWT-based auth system
3. **Create API Routes** - CRUD operations for expenses
4. **Add File Upload** - Receipt/document upload functionality
5. **Write Tests** - Unit and integration tests
6. **Add Validation** - Input validation using Joi
7. **Error Handling** - Comprehensive error handling
8. **Documentation** - API documentation with Swagger

## 🔒 Security Features

- Rate limiting to prevent abuse
- Helmet for security headers
- CORS configuration
- JWT authentication
- Password hashing with bcrypt
- Input validation

## 📝 Environment Variables

Check `.env.example` for all available configuration options including:
- Database connection
- JWT secrets
- File upload settings
- Email configuration
- Security settings