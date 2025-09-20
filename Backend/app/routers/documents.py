import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlmodel import Session, select, func
from app.db import get_session
from app.models.documents import Document, DocumentVersion
from app.models.permissions import DocumentUserPermission, DocumentDepartmentPermission
from app.models.users import User
from app.schemas.documents import (
    DocumentRead, DocumentUpdate,
    DocumentVersionCreate, DocumentVersionRead
)
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
    dependencies=[Depends(get_current_user)]
)

# Ensure upload directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "Documents")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ================================================================================================
#                                        Helpers
# ================================================================================================
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


# ================================================================================================
#                                     Documents Endpoints
# ================================================================================================
@router.post("/", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
def create_document(
    title: str = Form(...),
    description: str = Form(""),
    access_level: str = Form("public"),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Create DB record first (to get UUID as ID)
    db_doc = Document(
        title=title,
        description=description,
        access_level=access_level,
        uploader_id=current_user.id,
    )
    session.add(db_doc)
    session.commit()
    session.refresh(db_doc)

    # Use doc.id as filename
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{db_doc.id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save uploaded file
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    # Update doc with relative path
    relative_path = f"Documents/{unique_filename}"
    db_doc.file_path = relative_path
    session.add(db_doc)
    session.commit()
    session.refresh(db_doc)

    # Create first version
    db_ver = DocumentVersion(
        document_id=db_doc.id,
        version_number=1,
        title=title,
        description=description,
        file_path="",  # will set after saving file
        uploaded_by=current_user.id,
        access_level=access_level,
    )
    session.add(db_ver)
    session.commit()
    session.refresh(db_ver)

    # Save version file with version UUID
    version_filename = f"{db_ver.id}{ext}"
    version_file_path = os.path.join(UPLOAD_DIR, version_filename)
    # Copy the original file to the version file
    with open(file_path, "rb") as src, open(version_file_path, "wb") as dst:
        dst.write(src.read())
    version_relative_path = f"Documents/{version_filename}"
    db_ver.file_path = version_relative_path
    session.add(db_ver)
    session.commit()
    session.refresh(db_ver)

    # Update current version pointer
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


@router.get("/my", response_model=list[DocumentRead])
def list_my_documents(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return session.exec(
        select(Document).where(Document.uploader_id == current_user.id)
    ).all()


@router.get("/{doc_id}", response_model=DocumentRead, status_code=status.HTTP_200_OK)
def get_document(
    doc_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc = session.get(Document, doc_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")

    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=403, detail="Not authorized")

    return doc


@router.get("/{doc_id}/download")
def download_document(
    doc_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=403, detail="Not authorized")

    abs_path = os.path.join(os.path.dirname(__file__), "..", "..", doc.file_path)
    abs_path = os.path.abspath(abs_path)

    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        abs_path,
        filename=os.path.basename(abs_path),
        media_type="application/octet-stream"
    )


@router.get("/by-path/{path:path}")
def get_document_by_path(
    path: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc = session.exec(select(Document).where(Document.file_path == path)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found by path")

    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=403, detail="Not authorized")

    return doc


@router.get("/file/{doc_id}")
def get_file(doc_id: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=403, detail="Not authorized")

    file_path = doc.file_path
    return FileResponse(
        path=file_path,
        media_type="application/pdf" if file_path.endswith(".pdf") else "image/*",
        headers={"Content-Disposition": "inline"}
    )


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

@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    doc_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Delete associated versions
    versions = session.exec(
        select(DocumentVersion).where(DocumentVersion.document_id == doc_id)
    ).all()
    for ver in versions:
        session.delete(ver)

    # Delete the document record
    session.delete(doc)
    session.commit()
    return


# ================================================================================================
#                                     Versions Endpoints
# ================================================================================================
@router.post("/{doc_id}/versions", response_model=DocumentVersionRead, status_code=status.HTTP_201_CREATED)
def add_version(
    doc_id: str,
    title: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=403, detail="Not authorized")

    last_version = session.exec(
        select(func.max(DocumentVersion.version_number)).where(
            DocumentVersion.document_id == doc_id
        )
    ).first()
    next_version = (last_version or 0) + 1

    # Create version DB record first (to get UUID as ID)
    db_ver = DocumentVersion(
        document_id=doc_id,
        version_number=next_version,
        title=title,
        description=description,
        file_path="",  # will set after saving file
        uploaded_by=current_user.id,
        access_level=doc.access_level,
    )
    session.add(db_ver)
    session.commit()
    session.refresh(db_ver)

    # Save uploaded file with version UUID as filename
    ext = os.path.splitext(file.filename)[1]
    version_filename = f"{db_ver.id}{ext}"
    version_file_path = os.path.join(UPLOAD_DIR, version_filename)
    with open(version_file_path, "wb") as f:
        f.write(file.file.read())
    version_relative_path = f"Documents/{version_filename}"

    # Update version record with file path
    db_ver.file_path = version_relative_path
    session.add(db_ver)
    session.commit()
    session.refresh(db_ver)

    # Update document's current version pointer
    doc.current_version_id = db_ver.id
    session.add(doc)
    session.commit()

    return db_ver


@router.get("/{doc_id}/versions", response_model=list[DocumentVersion])
def list_versions(
    doc_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    versions = session.exec(select(DocumentVersion).where(DocumentVersion.document_id == doc_id).order_by(DocumentVersion.version_number)).all()
    return versions


@router.get("/versions/{version_id}", response_model=DocumentVersion)
def get_version(
    version_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    ver = session.get(DocumentVersion, version_id)
    if not ver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")

    doc = session.get(Document, ver.document_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent document not found")

    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    return ver


@router.get("/{doc_id}/versions/{version_number}/download")
def download_version(
    doc_id: str,
    version_number: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    version = session.exec(
        select(DocumentVersion).where(
            DocumentVersion.document_id == doc_id,
            DocumentVersion.version_number == version_number
        )
    ).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    doc = session.get(Document, doc_id)
    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=403, detail="Not authorized")

    abs_path = os.path.join(os.path.dirname(__file__), "..", "..", version.file_path)
    abs_path = os.path.abspath(abs_path)

    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        abs_path,
        filename=os.path.basename(abs_path),
        media_type="application/octet-stream"
    )

@router.get("/versions/{version_id}/file")
def get_version_file(
    version_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Serve the file bytes for a specific version. Returns FileResponse inline."""
    ver = session.get(DocumentVersion, version_id)
    if not ver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Version not found")
    doc = session.get(Document, ver.document_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent document not found")
    if not can_access_document(current_user, doc, session):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Build absolute path safely:
    # target_path = os.path.normpath(os.path.join(UPLOAD_DIR, ver.file_path))
    # # Prevent path traversal (ensure target_path is inside UPLOAD_DIR)
    # if not target_path.startswith(os.path.abspath(UPLOAD_DIR) + os.sep):
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file path")
    # if not os.path.isfile(target_path):
    #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on disk")

    # # Return inline content (not attachment)
    # filename = os.path.basename(target_path)
    # return FileResponse(
    #     target_path,
    #     media_type=None,  # let starlette/uvicorn guess or you can use mimetypes.guess_type
    #     filename=filename,
    #     headers={"Content-Disposition": f'inline; filename="{filename}"'},
    # )
    file_path = ver.file_path
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(
        path=file_path,
        media_type="application/pdf" if file_path.endswith(".pdf") else "image/*",
        headers={"Content-Disposition": "inline"}
    )
