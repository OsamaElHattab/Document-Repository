from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class DocumentTagLink(SQLModel, table=True):
    __tablename__ = "document_tags"

    document_id: str = Field(foreign_key="documents.id", primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", primary_key=True)

    document: "Document" = Relationship(back_populates="tags")
    tag: "Tag" = Relationship(back_populates="documents")


class Tag(SQLModel, table=True):
    __tablename__ = "tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)

    documents: List[DocumentTagLink] = Relationship(back_populates="tag")
