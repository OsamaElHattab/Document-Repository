from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import get_session
from app.models.tags import Tag, DocumentTagLink
from app.models.documents import Document
from app.schemas.tags import TagCreate, TagRead
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/tags",
    tags=["Tags"],
    dependencies=[Depends(get_current_user)]
)


@router.post("/", response_model=TagRead, status_code=201)
def create_tag(tag: TagCreate, session: Session = Depends(get_session)):
    # Check if tag already exists
    db_tag = session.exec(select(Tag).where(Tag.name == tag.name)).first()
    if db_tag:
        return db_tag

    db_tag = Tag(name=tag.name)
    session.add(db_tag)
    session.commit()
    session.refresh(db_tag)
    return db_tag


@router.get("/", response_model=list[TagRead])
def list_tags(session: Session = Depends(get_session)):
    return session.exec(select(Tag)).all()


# Attach a tag to a document (create tag if not exists)
@router.post("/attach/{document_id}", response_model=TagRead, status_code=201)
def attach_tag_to_document(
    document_id: str,
    tag: TagCreate,
    session: Session = Depends(get_session)
):
    # Find the document
    document = session.exec(select(Document).where(Document.id == document_id)).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check if tag exists, else create
    db_tag = session.exec(select(Tag).where(Tag.name == tag.name)).first()
    if not db_tag:
        db_tag = Tag(name=tag.name)
        session.add(db_tag)
        session.commit()
        session.refresh(db_tag)

    # Check if already attached
    existing_link = session.exec(
        select(DocumentTagLink).where(
            DocumentTagLink.document_id == document_id,
            DocumentTagLink.tag_id == db_tag.id
        )
    ).first()
    if not existing_link:
        link = DocumentTagLink(document_id=document_id, tag_id=db_tag.id)
        session.add(link)
        session.commit()

    return db_tag


# Get all tags for a document
@router.get("/document/{document_id}", response_model=list[TagRead])
def get_document_tags(document_id: str, session: Session = Depends(get_session)):
    document = session.exec(select(Document).where(Document.id == document_id)).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Collect tags via the relationship
    tags = [link.tag for link in document.tags]
    return tags
