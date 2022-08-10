FROM python:3.7 AS development

RUN apt-get update && apt-get install -y --no-install-recommends apt-utils postgresql ffmpeg

WORKDIR /app

COPY requirements.txt /app
RUN pip install uwsgi
RUN pip install --no-cache-dir -r requirements.txt

COPY ops/entrypoint.sh /
COPY ops/uwsgi.ini /

COPY migrations/ /app/migrations/

FROM development AS production

COPY app/ /app/
