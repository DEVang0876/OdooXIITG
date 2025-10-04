# Odoo X IIT Hackathon - Expense Management System

**Team Members:**
- KAUSTAV DAS
- OM CHOKSI
- DEVANG DHANDHUKIYA

## 🚀 Project Overview

A comprehensive expense management system with OCR capabilities for automatic receipt processing. The system allows employees to upload receipts, extract text using OCR, and manage expense approvals through a role-based workflow.

## 🏗️ Architecture

- **Frontend**: React 19 with Vite, modern UI with routing
- **Backend**: Node.js/Express with JWT authentication and MongoDB
- **OCR Service**: FastAPI with Tesseract OCR for text extraction
- **Database**: MongoDB with Mongoose ODM

## 📋 Features

- ✅ User registration and email verification
- ✅ Role-based access control (Employee, Manager, Admin)
- ✅ Receipt upload with OCR processing
- ✅ Expense management and approval workflow
- ✅ Responsive modern UI
- ✅ RESTful API architecture

## 🛠️ Quick Setup

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB
- Git

### Installation & Run

1. **Clone and setup:**
   ```bash
   git clone <your-repo-url>
   cd OdooXIIT
   ```

2. **Follow the detailed setup guide:**
   📖 **[Complete Setup Guide](docs/setup.md)**

3. **Quick start:**
   ```bash
   # Install all dependencies
   cd backend && npm install && cd ../frontend && npm install && cd ../ocrapi && pip install -r requirements.txt

   # Start services (requires MongoDB running)
   cd backend && npm start    # Terminal 1
   cd frontend && npm run dev  # Terminal 2
   cd ocrapi && python main.py # Terminal 3
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - OCR API: http://localhost:4000

## 📁 Project Structure

```
OdooXIIT/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, validation
│   │   └── utils/        # Helper functions
│   └── uploads/          # File uploads
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── App.jsx       # Main app component
│   └── public/           # Static assets
├── ocrapi/              # FastAPI OCR service
│   ├── app/             # API endpoints
│   ├── main.py          # FastAPI app
│   └── requirements.txt # Python dependencies
└── docs/                # Documentation
    ├── setup.md         # Complete setup guide
    ├── backend_api_guide.md
    ├── ocrapi_run_guide.md
    └── postman_collection.json
```

## 🔧 Development

### Available Scripts

#### Backend
```bash
cd backend
npm start      # Start development server
npm test       # Run tests
npm run lint   # Code linting
```

#### Frontend
```bash
cd frontend
npm run dev    # Start dev server
npm run build  # Production build
npm test       # Run tests
```

#### OCR API
```bash
cd ocrapi
python main.py # Start FastAPI server
```

### Environment Variables

Create `.env` files in each service directory. See `docs/setup.md` for details.

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Render/Heroku)
- Set environment variables
- Deploy from GitHub
- Use production MongoDB URI

### OCR API (Render)
- Python web service
- Install system dependencies (Tesseract)
- Set build command: `pip install -r requirements.txt`
- Set start command: `python main.py`

## 📚 Documentation

- **[Setup Guide](docs/setup.md)** - Complete installation and run instructions
- **[Backend API](docs/backend_api_guide.md)** - API endpoints documentation
- **[OCR API](docs/ocrapi_run_guide.md)** - OCR service documentation
- **[Postman Collection](docs/postman_collection.json)** - API testing collection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is part of the Odoo X IIT Hackathon submission.

## 🆘 Support

For issues or questions:
1. Check the [Setup Guide](docs/setup.md)
2. Review existing documentation
3. Check terminal logs for errors
4. Ensure all prerequisites are installed
