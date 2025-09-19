from sqlmodel import SQLModel


class RoleBase(SQLModel):
    name: str


class RoleCreate(RoleBase):
    pass


class RoleRead(RoleBase):
    id: int
