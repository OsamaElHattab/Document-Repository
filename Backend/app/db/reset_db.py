from app.db import engine
from app.models import *
from sqlmodel import SQLModel

print("Dropping all tables...")
SQLModel.metadata.drop_all(engine)

print("Creating all tables...")
SQLModel.metadata.create_all(engine)

print("Database reset complete.")
