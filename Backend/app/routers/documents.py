from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from app.db import get_session
from app.models.documents import Document, DocumentVersion
from app.models.permissions import DocumentUserPermission, DocumentDepartmentPermission
from app.models.users import User
from app.schemas.documents import (
    DocumentCreate, DocumentRead, DocumentUpdate,
    DocumentVersionCreate, DocumentVersionRead
)
from app.routers.auth import get_current_user, get_current_admin_user

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
    dependencies=[Depends(get_current_user)]
)

# ---------- Helpers ----------
def can_access_document(user: User, document: Document, session: Session) -> bool:
    """Check if a user can access a given document."""
    if user.role and user.role.name.lower() == "admin":
        return True  # admins can access everything

    if document.access_level == "public":
        return True

    if document.access_level == "department":
        if user.department_id == document.uploader.department_id:
            return True
        dept_perm = session.exec(
            select(DocumentDepartmentPermission).where(
                DocumentDepartmentPermission.document_id == document.id,
                DocumentDepartmentPermission.department_id == user.department_id
            )
        ).first()
        if dept_perm:
            return True

    if document.access_level == "private":
        if document.uploader_id == user.id:
            return True
        user_perm = session.exec(
            select(DocumentUserPermission).where(
                DocumentUserPermission.document_id == document.id,
                DocumentUserPermission.user_id == user.id
            )
        ).first()
        if user_perm:
            return True

    return False


# ---------- Endpoints ----------
@router.post("/", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
def create_document(
    doc: DocumentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    db_doc = Document(**doc.dict(), uploader_id=current_user.id, created_by=current_user.id)
    session.add(db_doc)
    session.commit()
    session.refresh(db_doc)

    # first version
    db_ver = DocumentVersion(
        document_id=db_doc.id,
        version_number=1,
        title=db_doc.title,
        description=db_doc.description,
        file_path=doc.file_path,
        uploaded_by=current_user.id,
        access_level=db_doc.access_level,
    )
    session.add(db_ver)
    session.commit()
    session.refresh(db_ver)

    db_doc.current_version_id = db_ver.id
    session.add(db_doc)
    session.commit()
    session.refresh(db_doc)

    return db_doc


@router.get("/", response_model=list[DocumentRead])
def list_documents(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    docs = session.exec(select(Document)).all()
    return [doc for doc in docs if can_access_document(current_user, doc, session)]


@router.get("/{doc_id}", response_model=DocumentRead)
def get_document(
    doc_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=403, detail="Not authorized")

    return doc


@router.patch("/{doc_id}", response_model=DocumentRead)
def update_document(
    doc_id: str,
    data: DocumentUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(doc, field, value)
    session.add(doc)
    session.commit()
    session.refresh(doc)
    return doc


# ----- Versions -----
@router.post("/{doc_id}/versions", response_model=DocumentVersionRead, status_code=status.HTTP_201_CREATED)
def add_version(
    doc_id: str,
    ver: DocumentVersionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=403, detail="Not authorized")

    last_version = session.exec(
        select(func.max(DocumentVersion.version_number)).where(DocumentVersion.document_id == doc_id)
    ).first()
    next_version = (last_version or 0) + 1

    db_ver = DocumentVersion(
        document_id=doc_id,
        version_number=next_version,
        title=ver.title,
        description=ver.description,
        file_path=ver.file_path,
        uploaded_by=current_user.id,
        access_level=doc.access_level,
    )
    session.add(db_ver)
    session.commit()
    session.refresh(db_ver)

    doc.current_version_id = db_ver.id
    session.add(doc)
    session.commit()

    return db_ver


@router.get("/{doc_id}/versions", response_model=list[DocumentVersionRead])
def list_versions(
    doc_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=403, detail="Not authorized")

    return session.exec(select(DocumentVersion).where(DocumentVersion.document_id == doc_id)).all()
