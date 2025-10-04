# OCR API Documentation

Welcome to the OCR API documentation. This API provides optical character recognition capabilities for extracting text from images, with specialized support for receipts.

## Overview

The OCR API is built with FastAPI and uses Tesseract OCR engine to extract text from uploaded images. It supports both plain text extraction and structured receipt parsing.

## Features

- Image upload and processing
- Plain text OCR extraction
- Structured receipt data extraction
- CORS enabled for frontend integration
- Docker containerized deployment

## Quick Start

1. Start the API server:
   ```bash
   docker run -p 4000:4000 omchoksi/ocrapi:latest
   ```

2. Access the API at `http://localhost:4000`

3. View interactive API documentation at `http://localhost:4000/docs`

## API Endpoints

- `GET /` - Health check
- `POST /api/v1/ocr/extract-text/` - Extract plain text from image
- `POST /api/v1/ocr/extract-receipt/` - Extract structured receipt data

## Testing

Use the provided Postman collection for testing the API endpoints.