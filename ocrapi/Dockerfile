# Dockerfile

# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set environment variables to prevent buffering of stdout/stderr
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install Tesseract OCR engine and other system dependencies
# libgl1 is a common dependency for libraries like OpenCV if you add them later
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-deu \
    tesseract-ocr-fra \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libglib2.0-0 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY ./app /app/app
COPY main.py /app/

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application using Uvicorn
# --host 0.0.0.0 makes it accessible from outside the container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4000"] 