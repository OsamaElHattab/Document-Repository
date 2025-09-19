from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from uuid import uuid4

from app.models.users import User  
from app.models.documents import Document

class Version(SQLModel, table=True):
    __tablename__ = "versions"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    document_id: str = Field(foreign_key="documents.id")
    uploader_id: Optional[str] = Field(foreign_key="users.id")
    file_path: str
    file_name: Optional[str] = None
    uploaded_at: Optional[str] = None

    document: "Document" = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[Version.document_id]"},
    )
    uploader: "User" = Relationship(back_populates="uploaded_versions")