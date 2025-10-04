# app/api/endpoints/ocr.py
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from app.services import ocr_service
from app.schemas.ocr import OCRResponse, OCRErrorResponse, ReceiptResponse, ReceiptParsed

# Create an API router
router = APIRouter()

@router.post(
    "/extract-text/",
    response_model=OCRResponse,
    responses={
        400: {"model": OCRErrorResponse, "description": "Invalid file or processing error"},
        500: {"model": OCRErrorResponse, "description": "Internal server error"}
    },
    summary="Extract Text from an Image"
)
async def extract_text_from_image(file: UploadFile = File(...)):
    """
    Accepts an image file and returns the text extracted from it using advanced OCR.

    - **file**: The image file (e.g., PNG, JPG) to process.
    """
    # Check for a valid file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload an image."
        )

    try:
        # Read the file content
        contents = await file.read()
        
        # Pass the content to the enhanced OCR service
        extracted_text = ocr_service.perform_ocr(contents)
        
        return OCRResponse(filename=file.filename, text=extracted_text)

    except ValueError as e:
        # Handle errors from the OCR service (e.g., corrupt image)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Catch any other unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {e}"
        )

@router.post(
    "/extract-receipt/",
    response_model=ReceiptParsed,
    responses={
        400: {"model": OCRErrorResponse, "description": "Invalid file or processing error"},
        500: {"model": OCRErrorResponse, "description": "Internal server error"}
    },
    summary="Extract Parsed Data from Receipt/Invoice"
)
async def extract_receipt_text(file: UploadFile = File(...)):
    """
    Specialized endpoint for receipt/invoice OCR with structured parsing.
    
    Extracts key fields like total amount and date with high accuracy using keyword anchoring and ROI OCR.

    - **file**: The receipt/invoice image file to process.
    """
    # Check for a valid file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload an image."
        )

    try:
        # Read the file content
        contents = await file.read()

        # Get structured OCR data
        df = ocr_service.perform_structured_ocr(contents)
        
        # Parse key fields
        parsed_data = ocr_service.parse_receipt_data(df, contents)

        return ReceiptParsed(filename=file.filename, **parsed_data)

    except ValueError as e:
        # Handle errors from the OCR service (e.g., corrupt image)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Catch any other unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {e}"
        )