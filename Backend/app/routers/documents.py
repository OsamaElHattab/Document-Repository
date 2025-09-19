from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from app.db import get_session
from app.models.documents import Document, DocumentVersion
from app.schemas.documents import (
    DocumentCreate, DocumentRead, DocumentUpdate,
    DocumentVersionCreate, DocumentVersionRead
)

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/", response_model=DocumentRead)
def create_document(doc: DocumentCreate, session: Session = Depends(get_session)):
    db_doc = Document(**doc.dict())
    session.add(db_doc)
    session.commit()
    session.refresh(db_doc)

    # Create the first version
    from app.models.documents import DocumentVersion
    from app.schemas.documents import DocumentVersionCreate

    version_data = {
        'document_id': db_doc.id,
        'version_number': 1,
        'title': getattr(doc, 'title', getattr(db_doc, 'title', None)),
        'description': getattr(doc, 'description', getattr(db_doc, 'description', None)),
        'file_path': getattr(doc, 'file_path', None),
        'uploaded_by': getattr(doc, 'uploader_id', None),
        'access_level': getattr(doc, 'access_level', 'public'),
    }
    db_ver = DocumentVersion(**version_data)
    session.add(db_ver)
    session.commit()
    session.refresh(db_ver)

    # Update document's current_version_id
    db_doc.current_version_id = db_ver.id
    session.add(db_doc)
    session.commit()
    session.refresh(db_doc)

    return db_doc


@router.get("/", response_model=list[DocumentRead])
def list_documents(session: Session = Depends(get_session)):
    return session.exec(select(Document)).all()


@router.get("/{doc_id}", response_model=DocumentRead)
def get_document(doc_id: str, session: Session = Depends(get_session)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.patch("/{doc_id}", response_model=DocumentRead)
def update_document(doc_id: str, data: DocumentUpdate, session: Session = Depends(get_session)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(doc, field, value)
    session.add(doc)
    session.commit()
    session.refresh(doc)
    return doc


# ----- Versions -----
@router.post("/{doc_id}/versions", response_model=DocumentVersionRead)
def add_version(doc_id: str, ver: DocumentVersionCreate, session: Session = Depends(get_session)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # get latest version number
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
        uploaded_by=ver.uploaded_by,
    )
    session.add(db_ver)
    session.commit()
    session.refresh(db_ver)

    # update document current_version_id
    doc.current_version_id = db_ver.id
    session.add(doc)
    session.commit()

    return db_ver


@router.get("/{doc_id}/versions", response_model=list[DocumentVersionRead])
def list_versions(doc_id: str, session: Session = Depends(get_session)):
    return session.exec(select(DocumentVersion).where(DocumentVersion.document_id == doc_id)).all()
