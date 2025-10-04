# Testing

## Postman Collection

A Postman collection is provided for testing the API endpoints. Import the `postman_collection.json` file into Postman.

### Collection Structure

- **OCR API Tests**
  - Health Check
  - Extract Text
  - Extract Receipt

### Environment Variables

Set up the following environment variables in Postman:

- `base_url`: `http://localhost:4000`

### Test Cases

1. **Health Check**
   - Method: GET
   - URL: `{{base_url}}/`
   - Expected: 200 OK with welcome message

2. **Extract Text**
   - Method: POST
   - URL: `{{base_url}}/api/v1/ocr/extract-text/`
   - Body: form-data with file
   - Expected: 200 OK with extracted text

3. **Extract Receipt**
   - Method: POST
   - URL: `{{base_url}}/api/v1/ocr/extract-receipt/`
   - Body: form-data with receipt image
   - Expected: 200 OK with structured receipt data

## Manual Testing

You can also test the API using curl:

```bash
# Health check
curl http://localhost:4000/

# Extract text
curl -X POST "http://localhost:4000/api/v1/ocr/extract-text/" -F "file=@image.jpg"

# Extract receipt
curl -X POST "http://localhost:4000/api/v1/ocr/extract-receipt/" -F "file=@receipt.jpg"
```

## Sample Images

Place test images in a `test/` directory for easy access during testing.