import uuid
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    full_name: str
    hashed_password: str
    department_id: int = Field(foreign_key="departments.id", nullable=False)
    role_id: int = Field(foreign_key="roles.id", nullable=False)

    # Relationships
    role: Optional["Role"] = Relationship(back_populates="users")
    department: Optional["Department"] = Relationship(back_populates="users")
    uploaded_documents: List["Document"] = Relationship(back_populates="uploader")
    uploaded_versions: List["DocumentVersion"] = Relationship(back_populates="uploader")
    document_permissions: List["DocumentUserPermission"] = Relationship(back_populates="user")
