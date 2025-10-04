# app/schemas/ocr.py
from pydantic import BaseModel
from typing import Optional
from typing import List, Dict, Any

class OCRResponse(BaseModel):
    filename: str
    text: str

class OCRErrorResponse(BaseModel):
    filename: str
    error: str


class ReceiptWord(BaseModel):
    text: str
    conf: int
    left: int
    top: int
    width: int
    height: int
    line_num: int
    word_num: int


class ReceiptResponse(BaseModel):
    filename: str
    lines: List[str]
    words: List[ReceiptWord]


class ReceiptParsed(BaseModel):
    filename: str
    total_amount: Optional[str] = None
    date: Optional[str] = None
    items: List[Dict[str, Any]] = []
    raw_text: str