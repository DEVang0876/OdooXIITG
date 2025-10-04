# Project Setup and Run Guide

## Overview
This project is an Expense Management System with OCR capabilities for receipt processing. It consists of three main components:

- **Frontend**: React application (Vite)
- **Backend**: Node.js/Express API server
- **OCR API**: FastAPI service for image text extraction

## Prerequisites

### System Requirements
- Node.js 18+ and npm
- Python 3.8+
- MongoDB (local or cloud)
- Git

### Optional
- Docker (for containerized deployment)
- Docker Compose (for local development)

## Quick Start

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd OdooXIIT
```

### 2. Environment Setup

#### Backend Environment (.env)
Create `backend/.env`:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/expense_management
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
OCR_API_URL=http://localhost:4000
```

#### Frontend Environment (.env)
Create `frontend/.env`:
```env
VITE_BASE_URL=http://localhost:3000
```

#### OCR API Environment (.env)
Create `ocrapi/.env`:
```env
PORT=4000
```

### 3. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

#### OCR API
```bash
cd ../ocrapi
pip install -r requirements.txt
```

### 4. Start Services

#### Option A: Using Docker Compose (Recommended)
```bash
# From project root
docker-compose up -d
```

#### Option B: Manual Startup

**Terminal 1: MongoDB**
```bash
# If MongoDB is installed locally
mongod
# Or use MongoDB Compass/Atlas for cloud database
```

**Terminal 2: Backend**
```bash
cd backend
npm start
```

**Terminal 3: Frontend**
```bash
cd frontend
npm run dev
```

**Terminal 4: OCR API**
```bash
cd ocrapi
python main.py
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **OCR API**: http://localhost:4000

## Development Workflow

### Running Tests

#### Backend Tests
```bash
cd backend
npm test
```

#### Frontend Tests
```bash
cd frontend
npm test
```

### Building for Production

#### Frontend Build
```bash
cd frontend
npm run build
```

#### Backend Build (if needed)
```bash
cd backend
npm run build
```

## Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend Deployment (Render/Heroku)
```bash
cd backend
# Follow hosting service instructions
# Set environment variables in hosting dashboard
```

### OCR API Deployment (Render)
```bash
cd ocrapi
# See deployment section below
```

## API Documentation

- **Backend API**: Check `docs/backend_api_guide.md`
- **OCR API**: Check `docs/ocrapi_run_guide.md`
- **Postman Collection**: `docs/postman_collection.json`

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port
   netstat -ano | findstr :3000
   # Kill process
   taskkill /PID <PID> /F
   ```

2. **MongoDB connection issues**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env
   - For cloud MongoDB, whitelist your IP

3. **OCR API not responding**
   - Check if Python service is running on port 4000
   - Verify Tesseract OCR is installed
   - Check logs for errors

### Logs

#### Backend Logs
```bash
cd backend
npm start  # Logs will appear in terminal
```

#### Frontend Logs
- Open browser DevTools (F12) → Console tab

#### OCR API Logs
```bash
cd ocrapi
python main.py  # Logs will appear in terminal
```

## Project Structure

```
OdooXIIT/
├── backend/           # Node.js/Express API
├── frontend/          # React application
├── ocrapi/           # FastAPI OCR service
├── docs/             # Documentation
├── docker-compose.yml # Docker orchestration
└── README.md
```</content>
<parameter name="filePath">d:\WORKSPACE\COMPITITION\OdooXIIT\OdooXIITG\docs\setup.md