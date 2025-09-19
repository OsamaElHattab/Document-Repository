from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from typing import List
import uuid
import shutil
import os

from app.db.session import get_session
from app.models import Document, DocumentVersion, DocumentUserPermission
from app.models.versions import Version
from app.schemas.documents import DocumentCreate, DocumentRead
from app.schemas.versions import DocumentVersionCreate, DocumentVersionRead
from app.routers.auth import get_current_user
from app.models.users import User

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Create a new document (first version is uploaded here)
@router.post("/", response_model=DocumentRead)
def create_document(
    document: DocumentCreate,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc_id = str(uuid.uuid4())
    version_id = str(uuid.uuid4())

    # Save file
    file_path = os.path.join(UPLOAD_DIR, f"{version_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create document
    db_doc = Document(
        id=doc_id,
        title=document.title,
        description=document.description,
        uploader_id=current_user.id,
        access_level=document.access_level,
        current_version_id=version_id,
    )
    session.add(db_doc)

    # Create first version
    db_version = Version(
        id=version_id,
        document_id=doc_id,
        uploader_id=current_user.id,
        file_path=file_path,
        file_name=file.filename,
    )
    session.add(db_version)

    session.commit()
    session.refresh(db_doc)
    return db_doc


# Upload a new version of an existing document
@router.post("/{document_id}/versions", response_model=DocumentVersionRead)
def upload_new_version(
    document_id: str,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Check document exists
    document = session.exec(select(Document).where(Document.id == document_id)).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check access (if a row exists in document_user_permissions, then allow)
    permission = session.exec(
        select(DocumentUserPermission).where(
            DocumentUserPermission.document_id == document_id,
            DocumentUserPermission.user_id == current_user.id,
        )
    ).first()

    if not permission:
        raise HTTPException(status_code=403, detail="You do not have access to this document")

    # Save new version file
    version_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{version_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create version
    db_version = Version(
        id=version_id,
        document_id=document_id,
        uploader_id=current_user.id,
        file_path=file_path,
        file_name=file.filename,
    )
    session.add(db_version)

    # Update document current_version_id
    document.current_version_id = version_id
    session.add(document)

    session.commit()
    session.refresh(db_version)
    return db_version


# Get all documents
@router.get("/", response_model=List[DocumentRead])
def list_documents(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    documents = session.exec(select(Document)).all()
    return documents


# Get one document
@router.get("/{document_id}", response_model=DocumentRead)
def get_document(
    document_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    document = session.exec(select(Document).where(Document.id == document_id)).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document