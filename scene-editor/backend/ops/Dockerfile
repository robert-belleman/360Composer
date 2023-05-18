FROM python:3.11

RUN apt-get update && apt-get install -y ffmpeg postgresql-client

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir uwsgi
RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.app
ENV ASSET_DIR=/assets

COPY ops/entrypoint.sh /
COPY ops/uwsgi.ini /

COPY . /app/

ENTRYPOINT ["/entrypoint.sh"]
