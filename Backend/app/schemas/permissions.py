from sqlmodel import SQLModel


class DocumentUserPermissionBase(SQLModel):
    permission: str = "view"


class DocumentUserPermissionCreate(DocumentUserPermissionBase):
    document_id: str
    user_id: str


class DocumentUserPermissionRead(DocumentUserPermissionBase):
    id: str
    document_id: str
    user_id: str


class DocumentDepartmentPermissionBase(SQLModel):
    permission: str = "view"


class DocumentDepartmentPermissionCreate(DocumentDepartmentPermissionBase):
    document_id: str
    department_id: int


class DocumentDepartmentPermissionRead(DocumentDepartmentPermissionBase):
    id: str
    document_id: str
    department_id: int
