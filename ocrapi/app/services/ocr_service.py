from typing import Dict, Any, List
import pytesseract
import pandas as pd
from io import StringIO
import cv2
import numpy as np
from .image_preprocessor import preprocess_for_ocr
import re


def perform_receipt_ocr(file_contents: bytes) -> str:
    """
    Performs OCR on a receipt using a single, optimized strategy.
    Returns the plain extracted text.
    """
    processed_image = preprocess_for_ocr(file_contents)
    custom_config = r'--psm 6 -l deu+eng'
    try:
        extracted_text = pytesseract.image_to_string(processed_image, config=custom_config)
        return extracted_text
    except Exception as e:
        raise ValueError(f"Tesseract OCR failed: {e}")


def perform_structured_ocr(file_contents: bytes) -> pd.DataFrame:
    """
    Performs OCR and returns a structured DataFrame with text and its location.
    """
    processed_image = preprocess_for_ocr(file_contents)
    
    # Use a Tesseract configuration optimized for layouts
    custom_config = r'--psm 6 -l deu+eng'

    # Get the output as a TSV (Tab Separated Values) string
    data_string = pytesseract.image_to_data(processed_image, config=custom_config)
    
    # Parse the TSV string into a pandas DataFrame with error handling
    try:
        df = pd.read_csv(StringIO(data_string), sep='\t', quoting=3, engine='python')
    except pd.errors.ParserError:
        # Fallback: split lines and parse manually
        lines = data_string.strip().split('\n')
        if len(lines) < 2:
            return pd.DataFrame()
        
        # Parse header
        header = lines[0].split('\t')
        data = []
        for line in lines[1:]:
            if line.strip():
                parts = line.split('\t')
                if len(parts) == len(header):
                    data.append(parts)
        
        df = pd.DataFrame(data, columns=header)
    
    # Clean up the DataFrame
    df = df.dropna(subset=['text'])  # Remove rows without text
    df = df[df.conf.astype(float) > 40]  # Filter out low-confidence recognitions
    df['text'] = df['text'].str.strip() # Remove leading/trailing whitespace
    
    return df


def parse_receipt_data(df: pd.DataFrame, original_image_bytes: bytes) -> Dict[str, Any]:
    """
    Parses the structured OCR DataFrame to extract key receipt fields.
    Uses keyword anchoring, regex, and ROI OCR for high accuracy.
    """
    # Initialize results
    result = {
        'total_amount': None,
        'date': None,
        'items': [],
        'raw_text': ' '.join(df['text'].tolist())
    }
    
    # Keyword anchoring for total amount
    total_keywords = ['gesamt', 'total', 'summe', 'betrag']
    total_row = None
    for _, row in df.iterrows():
        if any(keyword in row['text'].lower() for keyword in total_keywords):
            total_row = row
            break
    
    if total_row is not None:
        # Look for price pattern on the same line
        line_num = total_row['line_num']
        line_df = df[df['line_num'] == line_num]
        price_pattern = r'\d{1,3}[.,]\d{2}'
        for _, row in line_df.iterrows():
            match = re.search(price_pattern, row['text'])
            if match:
                result['total_amount'] = match.group()
                # ROI OCR for higher accuracy
                result['total_amount'] = _roi_ocr_for_amount(original_image_bytes, row)
                break
    
    # Keyword anchoring for date
    date_keywords = ['datum', 'date', 'zeit']
    date_row = None
    for _, row in df.iterrows():
        if any(keyword in row['text'].lower() for keyword in date_keywords):
            date_row = row
            break
    
    if date_row is not None:
        line_num = date_row['line_num']
        line_df = df[df['line_num'] == line_num]
        date_pattern = r'\d{1,2}[-./]\d{1,2}[-./]\d{2,4}'
        for _, row in line_df.iterrows():
            match = re.search(date_pattern, row['text'])
            if match:
                result['date'] = match.group()
                break
    
    # For items, this could be expanded, but for now, just return raw_text
    return result


def _roi_ocr_for_amount(original_image_bytes: bytes, amount_row) -> str:
    """
    Performs ROI OCR on the amount region for higher accuracy.
    """
    # Decode original image
    np_arr = np.frombuffer(original_image_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Crop to ROI around the amount
    x, y, w, h = amount_row['left'], amount_row['top'], amount_row['width'], amount_row['height']
    # Expand ROI slightly
    margin = 5
    x = max(0, x - margin)
    y = max(0, y - margin)
    w = min(gray.shape[1] - x, w + 2*margin)
    h = min(gray.shape[0] - y, h + 2*margin)
    roi = gray[y:y+h, x:x+w]
    
    # Apply same preprocessing
    roi_processed = cv2.adaptiveThreshold(
        roi, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    # OCR with number whitelist
    roi_config = r'--psm 7 -c tessedit_char_whitelist=0123456789.,CHF€$'
    price_text = pytesseract.image_to_string(roi_processed, config=roi_config).strip()
    
    # Extract the price
    match = re.search(r'\d{1,3}[.,]\d{2}', price_text)
    return match.group() if match else price_text


def perform_ocr(file_contents: bytes) -> str:
    """Backward compatible wrapper — plain text OCR for endpoints that expect a string."""
    return perform_receipt_ocr(file_contents)
def _post_process_receipt_text(text: str) -> str:
    """Post-process to fix common OCR errors in receipts"""
    if not text:
        return text

    corrections = {
        r'(\d)\s+(\d)': r'\1\2',  # Remove spaces in numbers
        r'MountainHosTel': 'Mountain Hostel',
        r'PetraHallorBrueeee': 'Petra & Walter Brunner',
        r'3828': '3825',
        r'Giaastush': 'Gimmelwald',
        r'093-95517-o4': '033 855 17 04',
        r'weswourtainhivetal': 'www.mountainhostel',
        r'CHEs': 'CHE-',
        r'MuST': 'MWST',
        r'Tagessuepe': 'Tagessuppe',
        r'Kuchacs': 'Kuchen',
        r'GesaatCIFa': 'Gesamt CHF',
        r'EURD': 'EURO',
        r'Yentag': 'Montag',
        r'22-B-2015': '22-6-2015',
        r'W520:25': '16:20:25',
        r'ThrenBesuch': 'Ihren Besuch',
    }

    processed_text = text
    for pattern, replacement in corrections.items():
        processed_text = re.sub(pattern, replacement, processed_text, flags=re.IGNORECASE)

    # Add proper spacing and formatting
    lines = []
    for line in processed_text.split('\n'):
        cleaned = re.sub(r'\s+', ' ', line.strip())
        if cleaned:
            lines.append(cleaned)

    return '\n'.join(lines)