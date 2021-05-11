from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

migrate = Migrate()


def init_app(app: Flask, db: SQLAlchemy) -> None:
    migrate.init_app(app, db)
