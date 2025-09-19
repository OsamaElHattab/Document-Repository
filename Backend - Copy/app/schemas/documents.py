from pydantic import BaseModel
from typing import Optional
import uuid


class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    access_level: str = "public"  # public | department | private


class DocumentCreate(DocumentBase):
    uploader_id: uuid.UUID


class DocumentRead(DocumentBase):
    id: uuid.UUID
    uploader_id: Optional[uuid.UUID] = None
    current_version_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True
