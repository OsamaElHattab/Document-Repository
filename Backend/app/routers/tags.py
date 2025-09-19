from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_session
from app.models.tags import Tag
from app.schemas.tags import TagCreate, TagRead

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.post("/", response_model=TagRead)
def create_tag(tag: TagCreate, session: Session = Depends(get_session)):
    db_tag = Tag(name=tag.name)
    session.add(db_tag)
    session.commit()
    session.refresh(db_tag)
    return db_tag


@router.get("/", response_model=list[TagRead])
def list_tags(session: Session = Depends(get_session)):
    return session.exec(select(Tag)).all()
