from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.session import get_session
from app.models import Department
from app.schemas.departments import DepartmentCreate, DepartmentRead
from typing import List

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.post("/", response_model=DepartmentRead)
def create_department(department: DepartmentCreate, session: Session = Depends(get_session)):
    db_department = session.exec(select(Department).where(Department.name == department.name)).first()
    if db_department:
        raise HTTPException(status_code=400, detail="Department already exists")
    new_department = Department(**department.dict())
    session.add(new_department)
    session.commit()
    session.refresh(new_department)
    return new_department

@router.get("/", response_model=List[DepartmentRead])
def list_departments(session: Session = Depends(get_session)):
    return session.exec(select(Department)).all()
