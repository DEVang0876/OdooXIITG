# app/services/image_preprocessor.py
import cv2
import numpy as np

def preprocess_for_ocr(image_bytes: bytes):
    """
    A robust and simple pre-processing pipeline for OCR.
    1. Decode: Read the image from bytes.
    2. Grayscale: Remove color, which is noise for OCR.
    3. Binarize: Convert to pure black and white, eliminating background textures.
    """
    # 1. Decode the image from bytes into an OpenCV image format
    np_arr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # 2. Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 3. Apply adaptive thresholding. This is highly effective for images
    # with varying lighting, like photos of receipts. It calculates a
    # threshold for small regions, preventing shadows from destroying text.
    processed_image = cv2.adaptiveThreshold(
        gray,
        255,  # Max value for a pixel
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, # Method to calculate threshold
        cv2.THRESH_BINARY, # Final image will be black or white
        11, # Neighborhood size (a small odd number)
        2   # A constant subtracted from the mean
    )
    
    # Optional but recommended: Add a bit of dilation to make text thicker
    kernel = np.ones((1,1), np.uint8)
    processed_image = cv2.dilate(processed_image, kernel, iterations=1)

    return processed_image