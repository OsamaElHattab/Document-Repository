import uuid
from sqlmodel import SQLModel, Field, Relationship


class DocumentUserPermission(SQLModel, table=True):
    __tablename__ = "document_user_permissions"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True)
    document_id: str = Field(foreign_key="documents.id", nullable=False)
    user_id: str = Field(foreign_key="users.id", nullable=False)
    permission: str = Field(default="view")  # view | edit

    document: "Document" = Relationship(back_populates="user_permissions")
    user: "User" = Relationship(back_populates="document_permissions")


class DocumentDepartmentPermission(SQLModel, table=True):
    __tablename__ = "document_department_permissions"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, index=True)
    document_id: str = Field(foreign_key="documents.id", nullable=False)
    department_id: int = Field(foreign_key="departments.id", nullable=False)
    permission: str = Field(default="view")  # view | edit

    document: "Document" = Relationship(back_populates="department_permissions")
    department: "Department" = Relationship(back_populates="document_permissions")
