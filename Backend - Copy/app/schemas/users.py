from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    department_id: Optional[int] = None
    role_id: Optional[int] = None


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: uuid.UUID

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department_id: Optional[int] = None
    role_id: Optional[int] = None
    password: Optional[str] = None
    