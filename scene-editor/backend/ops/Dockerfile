FROM python:3.11

RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg postgresql-client && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uwsgi
COPY requirements.txt /
RUN pip install --no-cache-dir -r /requirements.txt

ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.app
ENV ASSET_DIR=/assets

COPY ops/entrypoint.sh /
COPY ops/uwsgi.ini /

COPY . /app/

WORKDIR /app

ENTRYPOINT ["/entrypoint.sh"]
