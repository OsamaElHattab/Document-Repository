from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db.session import get_session
from app.models import DocumentUserPermission, DocumentDepartmentPermission
from app.schemas.permissions import (
    DocumentUserPermissionCreate, DocumentUserPermissionRead,
    DocumentDepartmentPermissionCreate, DocumentDepartmentPermissionRead
)
from typing import List

router = APIRouter(prefix="/permissions", tags=["Permissions"])

# User Permissions
@router.post("/user", response_model=DocumentUserPermissionRead)
def assign_user_permission(permission: DocumentUserPermissionCreate, session: Session = Depends(get_session)):
    perm = DocumentUserPermission(**permission.dict())
    session.add(perm)
    session.commit()
    session.refresh(perm)
    return perm

@router.get("/user", response_model=List[DocumentUserPermissionRead])
def list_user_permissions(session: Session = Depends(get_session)):
    return session.exec(select(DocumentUserPermission)).all()

# Department Permissions
@router.post("/department", response_model=DocumentDepartmentPermissionRead)
def assign_department_permission(permission: DocumentDepartmentPermissionCreate, session: Session = Depends(get_session)):
    perm = DocumentDepartmentPermission(**permission.dict())
    session.add(perm)
    session.commit()
    session.refresh(perm)
    return perm

@router.get("/department", response_model=List[DocumentDepartmentPermissionRead])
def list_department_permissions(session: Session = Depends(get_session)):
    return session.exec(select(DocumentDepartmentPermission)).all()
