import uuid
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

from .users import User
from .permissions import DocumentUserPermission, DocumentDepartmentPermission
from .tags import DocumentTagLink


class Document(SQLModel, table=True):
    __tablename__ = "documents"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True)
    title: str
    description: Optional[str] = None
    access_level: str = Field(default="public")  # public | department | private
    file_path: str = Field(default="")
    uploader_id: str = Field(foreign_key="users.id")
    current_version_id: Optional[str] = Field(foreign_key="document_versions.id", default=None)

    # Relationships
    uploader: Optional[User] = Relationship(back_populates="uploaded_documents")

    versions: List["DocumentVersion"] = Relationship(
        back_populates="document",
        sa_relationship_kwargs={"foreign_keys": "[DocumentVersion.document_id]"},
    )

    user_permissions: List[DocumentUserPermission] = Relationship(back_populates="document")
    department_permissions: List[DocumentDepartmentPermission] = Relationship(back_populates="document")
    tags: List[DocumentTagLink] = Relationship(back_populates="document")


class DocumentVersion(SQLModel, table=True):
    __tablename__ = "document_versions"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True)
    document_id: str = Field(foreign_key="documents.id", nullable=False)
    version_number: int
    title: str
    description: Optional[str] = None
    access_level: str = Field(default="public")  # public | department | private
    file_path: str = Field(default="")
    uploaded_by: str = Field(foreign_key="users.id")

    # Relationships
    document: Document = Relationship(
        back_populates="versions",
        sa_relationship_kwargs={"foreign_keys": "[DocumentVersion.document_id]"},
    )
    uploader: Optional[User] = Relationship(back_populates="uploaded_versions")
