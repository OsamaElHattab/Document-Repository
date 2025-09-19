from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db.session import get_session
from app.models import Tag
from app.schemas.tags import TagCreate, TagRead
from typing import List

router = APIRouter(prefix="/tags", tags=["Tags"])

@router.post("/", response_model=TagRead)
def create_tag(tag: TagCreate, session: Session = Depends(get_session)):
    new_tag = Tag(**tag.dict())
    session.add(new_tag)
    session.commit()
    session.refresh(new_tag)
    return new_tag

@router.get("/", response_model=List[TagRead])
def list_tags(session: Session = Depends(get_session)):
    return session.exec(select(Tag)).all()
