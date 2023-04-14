FROM python:3.8

RUN apt-get update && apt-get install -y ffmpeg postgresql-client

WORKDIR /app

COPY requirements.txt .
RUN pip install uwsgi
RUN pip install --no-cache-dir -r requirements.txt

COPY ops/entrypoint.sh /
COPY ops/uwsgi.ini /

COPY migrations/ /app/migrations/

COPY app/ /app/
