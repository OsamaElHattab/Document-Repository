from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List


class DocumentTag(SQLModel, table=True):
    __tablename__ = "document_tags"

    document_id: str = Field(foreign_key="documents.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)


class Tag(SQLModel, table=True):
    __tablename__ = "tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)

    # Many-to-many with Document
    documents: List["Document"] = Relationship(back_populates="tags", link_model=DocumentTag)
