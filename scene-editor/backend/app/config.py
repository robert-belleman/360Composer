from os import environ

SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_DATABASE_URI = environ.get("DATABASE_URI")
RESTPLUS_VALIDATE = True
ASSET_DIR = environ.get("ASSET_DIR")
REDIS_URL = environ.get("REDIS_URL", "redis://redis:6379/0")
QUEUES = environ.get("QUEUES", "default").split(",")
JWT_SECRET_KEY = environ.get("JWT_SECRET_KEY")
JWT_IDENTITY_CLAIM = 'sub'
JWT_ACCESS_COOKIE_PATH = "/api/"
JWT_REFRESH_COOKIE_PATH = "/api/token/refresh"
JWT_CSRF_IN_COOKIES = False
JWT_COOKIE_CSRF_PROTECT = False
JWT_COOKIE_SAMESITE = "Lax"
JWT_COOKIE_SECURE = False
JWT_TOKEN_LOCATION = "cookies"