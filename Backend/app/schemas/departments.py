from sqlmodel import SQLModel


class DepartmentBase(SQLModel):
    name: str


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentRead(DepartmentBase):
    id: int
