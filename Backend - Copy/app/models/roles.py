from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List


class Role(SQLModel, table=True):
    __tablename__ = "roles"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)

    # Relationships
    users: List["User"] = Relationship(back_populates="role")
