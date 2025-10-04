# OCR API Run Guide

## Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

## Installation

1. Navigate to the ocrapi directory:
   ```bash
   cd ocrapi
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

### Method 1: Using Python
```bash
python main.py
```

### Method 2: Using Docker
If you have Docker installed:

1. Build the Docker image:
   ```bash
   docker build -t ocrapi .
   ```

2. Run the container:
   ```bash
   docker run -p 8000:8000 ocrapi
   ```

## API Endpoints

The OCR API will be available at `http://localhost:8000` (or the configured port).

## Testing

You can test the API using the provided Postman collection in `docs/postman_collection.json`.