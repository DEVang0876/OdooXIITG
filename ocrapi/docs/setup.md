# Setup

## Prerequisites

- Docker installed on your system
- Internet connection for pulling the Docker image

## Running the API

### Using Docker (Recommended)

1. Pull the image from Docker Hub:
   ```bash
   docker pull omchoksi/ocrapi:latest
   ```

2. Run the container:
   ```bash
   docker run -p 4000:4000 omchoksi/ocrapi:latest
   ```

3. The API will be available at `http://localhost:4000`

### Local Development

1. Clone the repository and navigate to the ocrapi directory

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install Tesseract OCR:
   - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
   - Linux: `sudo apt-get install tesseract-ocr tesseract-ocr-eng`

4. Run the application:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 4000
   ```

## Building the Docker Image Locally

If you want to build the image yourself:

```bash
cd ocrapi
docker build -t ocrapi .
docker run -p 4000:4000 ocrapi
```

## Accessing the API

- API Base URL: `http://localhost:4000`
- Interactive Documentation: `http://localhost:4000/docs`
- Alternative Documentation: `http://localhost:4000/redoc`