from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.session import get_session
from app.models import Role
from app.schemas.roles import RoleCreate, RoleRead
from typing import List

router = APIRouter(prefix="/roles", tags=["Roles"])

@router.post("/", response_model=RoleRead)
def create_role(role: RoleCreate, session: Session = Depends(get_session)):
    db_role = session.exec(select(Role).where(Role.name == role.name)).first()
    if db_role:
        raise HTTPException(status_code=400, detail="Role already exists")
    new_role = Role(**role.dict())
    session.add(new_role)
    session.commit()
    session.refresh(new_role)
    return new_role

@router.get("/", response_model=List[RoleRead])
def list_roles(session: Session = Depends(get_session)):
    return session.exec(select(Role)).all()
