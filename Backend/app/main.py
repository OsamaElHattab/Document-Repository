from fastapi import FastAPI
from app.db.session import init_db
from app.routers import auth, users, roles, departments, documents, versions, tags, permissions

app = FastAPI(title="Document Management System (POC)")

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(documents.router)
app.include_router(departments.router)
# app.include_router(versions.router)
app.include_router(permissions.router)
app.include_router(tags.router)

@app.on_event("startup")
def on_startup():
    init_db()
