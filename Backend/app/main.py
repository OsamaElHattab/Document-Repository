from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.db.session import init_db
from app.routers import auth, users, roles, departments, documents, versions, tags, permissions

app = FastAPI(title="Document Management System (POC)")

# Allow frontend origin
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],    # allow all HTTP methods
    allow_headers=["*"],    # allow all headers
)

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

DOCUMENTS_DIR = os.path.join(os.path.dirname(__file__), "..", "Documents")
app.mount("/Documents", StaticFiles(directory=DOCUMENTS_DIR), name="documents")
