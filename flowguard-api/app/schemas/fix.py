from pydantic import BaseModel
from typing import List
from app.schemas.analysis import BugReport

class FixRequest(BaseModel):
    code: str 
    bug: List[BugReport]
    language: str
    model: str

class ChangeDetail(BaseModel):
    line: int
    description: str

class FixResponse(BaseModel):
    original_code: str
    fixed_code: str
    changes: List[ChangeDetail]