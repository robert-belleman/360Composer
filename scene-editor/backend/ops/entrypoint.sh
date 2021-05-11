#!/usr/bin/env bash
set -e

echo '=== ROUTES ==='
flask routes

echo '=== WAITING FOR DATABASE ==='
while ! pg_isready --host=postgres --user=postgres --quiet  --dbname=$DATABASE_URI; do
    sleep 1
done

echo '=== MIGRATING DATABASE ==='
flask db upgrade

if [ "$DEBUG" ]; then
    echo '=== STARTING DEVELOPMENT SERVER ==='
    export FLASK_DEBUG=1
    export FLASK_ENV=development
    flask run --host=0.0.0.0 --port=5000
else
    echo '=== STARTING PRODUCTION SERVER ==='
    uwsgi /uwsgi.ini
fi
