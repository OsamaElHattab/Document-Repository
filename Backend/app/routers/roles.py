from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_session
from app.models.roles import Role
from app.schemas.roles import RoleCreate, RoleRead

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.post("/", response_model=RoleRead)
def create_role(role: RoleCreate, session: Session = Depends(get_session)):
    db_role = Role(name=role.name)
    session.add(db_role)
    session.commit()
    session.refresh(db_role)
    return db_role


@router.get("/", response_model=list[RoleRead])
def list_roles(session: Session = Depends(get_session)):
    return session.exec(select(Role)).all()
