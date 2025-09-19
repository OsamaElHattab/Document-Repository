from app.db import engine
from app.models import *  # import all models so tables are registered
from sqlmodel import SQLModel

print("Dropping all tables...")
SQLModel.metadata.drop_all(engine)

print("Creating all tables...")
SQLModel.metadata.create_all(engine)

print("Database reset complete.")
