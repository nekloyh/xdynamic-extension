from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class URLCreate(BaseModel):
    url: str


class URLItem(BaseModel):
    id: str
    url: str
    addedAt: datetime
    visits: int = 0


class ApiResponse(BaseModel):
    success: bool = True
    data: Optional[object] = None
    error: Optional[object] = None
    metadata: Optional[object] = None
