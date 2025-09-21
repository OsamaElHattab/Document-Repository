from typing import Optional
from sqlmodel import SQLModel, Field
from fastapi import UploadFile, Form


class DocumentBase(SQLModel):
    title: str
    description: Optional[str] = None
    access_level: str = "public"
    file_path: str = Field(default="")


class DocumentCreate(DocumentBase):
    file_path: Optional[str] = None  # will be filled in after saving file


class DocumentRead(DocumentBase):
    id: str
    current_version_id: Optional[str] = None
    created_at: Optional[str] = None  # ISO format datetime string


class DocumentUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    access_level: Optional[str] = None


# Versions
class DocumentVersionBase(SQLModel):
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


# Use this for FastAPI form parsing
def as_form(file: UploadFile = Form(...)):
    return {"file": file}
