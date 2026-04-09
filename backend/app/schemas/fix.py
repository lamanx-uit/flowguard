from pydantic import BaseModel, Field
from typing import List, Optional
from app.schemas.analysis import BugReport

class SanitizeRequest(BaseModel):
    code: str 
    bug: List[BugReport]
    language: str
    model: str

class ChangeDetail(BaseModel):
    line: int
    description: str

class SanitizeResponse(BaseModel):
    original_code: str
    fixed_code: str
    changes: List[ChangeDetail]