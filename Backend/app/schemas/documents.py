from typing import Optional, List
from sqlmodel import SQLModel, Field


class DocumentBase(SQLModel):
    title: str
    description: Optional[str] = None
    access_level: str = "public"
    file_path: str = Field(default="")


class DocumentCreate(DocumentBase):
    uploader_id: str


class DocumentRead(DocumentBase):
    id: str
    current_version_id: Optional[str] = None


class DocumentUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    access_level: Optional[str] = None


# Versions
class DocumentVersionBase(SQLModel):
    title: str
    description: Optional[str] = None
    access_level: str = "public"
    file_path: str


class DocumentVersionCreate(DocumentVersionBase):
    document_id: str
    uploaded_by: str


class DocumentVersionRead(DocumentVersionBase):
    id: str
    document_id: str
    version_number: int
    uploaded_by: str
    uploaded_at: Optional[str] = None
