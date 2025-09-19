from pydantic import BaseModel
import uuid


class DocumentUserPermissionBase(BaseModel):
    document_id: uuid.UUID
    user_id: uuid.UUID
    permission: str = "view"  # view | edit


class DocumentUserPermissionCreate(DocumentUserPermissionBase):
    pass


class DocumentUserPermissionRead(DocumentUserPermissionBase):
    class Config:
        from_attributes = True


class DocumentDepartmentPermissionBase(BaseModel):
    document_id: uuid.UUID
    department_id: int
    permission: str = "view"  # view | edit


class DocumentDepartmentPermissionCreate(DocumentDepartmentPermissionBase):
    pass


class DocumentDepartmentPermissionRead(DocumentDepartmentPermissionBase):
    class Config:
        from_attributes = True
