# API Reference

## Base URL

```
http://localhost:4000
```

## Authentication

No authentication required for this API.

## Endpoints

### GET /

Health check endpoint.

**Response:**
```json
{
  "message": "OCR API is running"
}
```

### POST /api/v1/ocr/extract-text/

Extract plain text from an uploaded image.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (image file)

**Response:**
```json
{
  "filename": "image.jpg",
  "text": "Extracted text content...",
  "confidence": 85.5
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "detail": "Additional details"
}
```

### POST /api/v1/ocr/extract-receipt/

Extract structured data from a receipt image.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (receipt image)

**Response:**
```json
{
  "filename": "receipt.jpg",
  "lines": [
    {
      "text": "Line of text",
      "confidence": 90.0
    }
  ],
  "words": [
    {
      "text": "Word",
      "confidence": 95.0,
      "x": 10,
      "y": 20,
      "width": 50,
      "height": 15
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "detail": "Additional details"
}
```

## Data Models

### OCRResponse
```json
{
  "filename": "string",
  "text": "string",
  "confidence": "number"
}
```

### ReceiptResponse
```json
{
  "filename": "string",
  "lines": [
    {
      "text": "string",
      "confidence": "number"
    }
  ],
  "words": [
    {
      "text": "string",
      "confidence": "number",
      "x": "number",
      "y": "number",
      "width": "number",
      "height": "number"
    }
  ]
}
```

### Error Response
```json
{
  "error": "string",
  "detail": "string"
}
```

## Supported Image Formats

- JPEG
- PNG
- BMP
- TIFF

## Rate Limiting

No rate limiting implemented.

## CORS

CORS is enabled for all origins to allow frontend integration.