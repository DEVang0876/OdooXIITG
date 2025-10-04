# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import ocr
from app.core.config import settings

# Initialize the FastAPI application
app = FastAPI(title=settings.APP_NAME)

# Add CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include the OCR router
# All routes from ocr.py will be prefixed with /api/v1/ocr
app.include_router(ocr.router, prefix="/api/v1/ocr", tags=["OCR"])

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the FastAPI OCR API"}
