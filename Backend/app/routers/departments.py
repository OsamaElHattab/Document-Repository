from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_session
from app.models.departments import Department
from app.schemas.departments import DepartmentCreate, DepartmentRead
from app.routers.auth import get_current_user, get_current_admin_user

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.post(
    "/",
    response_model=DepartmentRead,
    status_code=201,
    dependencies=[Depends(get_current_admin_user), Depends(get_current_user)]
)
def create_department(dept: DepartmentCreate, session: Session = Depends(get_session)):
    db_dept = Department(name=dept.name)
    session.add(db_dept)
    session.commit()
    session.refresh(db_dept)
    return db_dept


@router.get("/", response_model=list[DepartmentRead])
def list_departments(session: Session = Depends(get_session)):
    return session.exec(select(Department)).all()
