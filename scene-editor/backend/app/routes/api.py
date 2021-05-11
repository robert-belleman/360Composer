from typing import Any

from flask import Flask
from flask_restx import Api

api = Api()


def init_app(app: Flask, **kwargs: Any) -> None:
    api.init_app(app, **kwargs)
