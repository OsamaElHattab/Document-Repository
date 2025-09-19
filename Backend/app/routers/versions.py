# from fastapi import APIRouter, Depends, HTTPException
# from sqlmodel import Session, select
# from app.db.session import get_session
# from app.models.documents import DocumentVersion
# from app.schemas.versions import DocumentVersionCreate, DocumentVersionRead
# from typing import List

# router = APIRouter(prefix="/versions", tags=["versions"])


# @router.post("/", response_model=DocumentVersionRead)
# def create_version(version: DocumentVersionCreate, session: Session = Depends(get_session)):
#     db_version = DocumentVersion(**version.dict())
#     session.add(db_version)
#     session.commit()
#     session.refresh(db_version)
#     return db_version


# @router.get("/", response_model=List[DocumentVersionRead])
# def list_versions(session: Session = Depends(get_session)):
#     versions = session.exec(select(DocumentVersion)).all()
#     return versions


# @router.get("/{version_id}", response_model=DocumentVersionRead)
# def get_version(version_id: str, session: Session = Depends(get_session)):
#     version = session.get(DocumentVersion, version_id)
#     if not version:
#         raise HTTPException(status_code=404, detail="Version not found")
#     return version
