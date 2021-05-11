from flask import Flask
from flask_sqlalchemy import SQLAlchemy as SA


class SQLAlchemy(SA):
    """
    Extends the SQLAlchemy class to apply the
    `pool_pre_ping` option.

    This tests the connection to the SQL server before doing
    a request, which eliminates errors due to the connection
    being lost.
    """

    def apply_pool_defaults(self, app, options):
        SA.apply_pool_defaults(self, app, options)
        options["pool_pre_ping"] = True


db = SA()


def init_app(app: Flask) -> None:
    db.init_app(app)
