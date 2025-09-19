from typing import Optional
from sqlmodel import SQLModel


class UserBase(SQLModel):
    email: str
    full_name: str


class UserCreate(UserBase):
    password: str
    department_id: int
    role_id: int


class UserRead(UserBase):
    id: str
    department_id: int
    role_id: int


class UserUpdate(SQLModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
