from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_session
from app.models.roles import Role
from app.schemas.roles import RoleCreate, RoleRead
from app.routers.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/roles", tags=["Roles"], dependencies=[Depends(get_current_user)])


@router.post("/", response_model=RoleRead, status_code=201, dependencies=[Depends(get_current_admin_user)])
def create_role(role: RoleCreate, session: Session = Depends(get_session)):
    db_role = Role(name=role.name)
    session.add(db_role)
    session.commit()
    session.refresh(db_role)
    return db_role


@router.get("/", response_model=list[RoleRead])
def list_roles(session: Session = Depends(get_session)):
    return session.exec(select(Role)).all()
