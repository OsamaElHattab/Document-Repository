from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
import uuid
from app.models.tags import DocumentTag  # ✅ import the class, not string


class Document(SQLModel, table=True):
    __tablename__ = "documents"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True)
    title: str
    description: Optional[str] = None
    uploader_id: str = Field(foreign_key="users.id")
    created_by: str = Field(foreign_key="users.id")
    access_level: str = Field(default="public")  # public | department | private
    current_version_id: Optional[str] = Field(foreign_key="document_versions.id", default=None)

    # Relationships
    uploader: "User" = Relationship(back_populates="uploaded_documents")

    # disambiguate with foreign_keys
    versions: List["DocumentVersion"] = Relationship(
        back_populates="document",
        sa_relationship_kwargs={"foreign_keys": "[DocumentVersion.document_id]"},
    )

    tags: List["Tag"] = Relationship(back_populates="document")
    user_permissions: List["DocumentUserPermission"] = Relationship(back_populates="document")
    department_permissions: List["DocumentDepartmentPermission"] = Relationship(back_populates="document")

class DocumentVersion(SQLModel, table=True):
    __tablename__ = "document_versions"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True)
    document_id: str = Field(foreign_key="documents.id", nullable=False)
    version_number: int
    file_path: str
    uploaded_by: str = Field(foreign_key="users.id")

    document: "Document" = Relationship(
        back_populates="versions",
        sa_relationship_kwargs={"foreign_keys": "[DocumentVersion.document_id]"},
    )