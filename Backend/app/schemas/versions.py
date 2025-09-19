# from pydantic import BaseModel
# from typing import Optional
# import uuid
# from datetime import datetime


# class DocumentVersionBase(BaseModel):
#     document_id: uuid.UUID
#     uploader_id: uuid.UUID
#     file_path: str
#     file_name: Optional[str] = None


# class DocumentVersionCreate(DocumentVersionBase):
#     pass


# class DocumentVersionRead(DocumentVersionBase):
#     id: uuid.UUID
#     uploaded_at: datetime

#     class Config:
#         from_attributes = True
