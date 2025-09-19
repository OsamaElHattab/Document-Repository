from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List


class Department(SQLModel, table=True):
    __tablename__ = "departments"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)

    # Relationships
    users: List["User"] = Relationship(back_populates="department")
    document_permissions: List["DocumentDepartmentPermission"] = Relationship(
        back_populates="department"
    )
