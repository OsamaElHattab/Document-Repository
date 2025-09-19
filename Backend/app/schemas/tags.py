from sqlmodel import SQLModel


class TagBase(SQLModel):
    name: str


class TagCreate(TagBase):
    pass


class TagRead(TagBase):
    id: int
