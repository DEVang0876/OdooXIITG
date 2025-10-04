import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const userPath = path.join(uploadPath, 'receipts', req.user._id.toString());
    
    // Create directory if it doesn't exist
    fs.mkdirSync(userPath, { recursive: true });
    cb(null, userPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const extension = path.extname(file.originalname);
    cb(null, `receipt-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || 
                      ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
  
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5 // Maximum 5 files per expense
  }
});

// Middleware for handling file uploads
export const uploadReceipts = upload.array('receipts', 5);

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed per expense.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "receipts" as the field name.'
      });
    }
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Helper function to delete uploaded files
export const deleteUploadedFiles = (files) => {
  if (files && files.length > 0) {
    files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    });
  }
};

// Helper function to delete file by path
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};