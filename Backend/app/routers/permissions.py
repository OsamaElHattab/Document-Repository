from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_session
from app.models.permissions import DocumentUserPermission, DocumentDepartmentPermission
from app.schemas.permissions import (
    DocumentUserPermissionCreate, DocumentUserPermissionRead,
    DocumentDepartmentPermissionCreate, DocumentDepartmentPermissionRead,
)
from app.routers.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/permissions", tags=["Permissions"], dependencies=[Depends(get_current_user)])


@router.post("/users", response_model=DocumentUserPermissionRead)
def add_user_permission(perm: DocumentUserPermissionCreate, session: Session = Depends(get_session)):
    db_perm = DocumentUserPermission(**perm.dict())
    session.add(db_perm)
    session.commit()
    session.refresh(db_perm)
    return db_perm


@router.get("/users", response_model=list[DocumentUserPermissionRead])
def list_user_permissions(session: Session = Depends(get_session)):
    return session.exec(select(DocumentUserPermission)).all()


@router.post("/departments", response_model=DocumentDepartmentPermissionRead)
def add_department_permission(perm: DocumentDepartmentPermissionCreate, session: Session = Depends(get_session)):
    db_perm = DocumentDepartmentPermission(**perm.dict())
    session.add(db_perm)
    session.commit()
    session.refresh(db_perm)
    return db_perm


@router.get("/departments", response_model=list[DocumentDepartmentPermissionRead])
def list_department_permissions(session: Session = Depends(get_session)):
    return session.exec(select(DocumentDepartmentPermission)).all()
