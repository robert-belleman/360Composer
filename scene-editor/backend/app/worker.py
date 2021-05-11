import os
import sys
import redis

from rq import Worker, Queue, Connection

# fixes some bug where it cannot find module 'app'
# see: https://stackoverflow.com/questions/52164846/flask-redis-queue-rq-worker-cannot-import-module-named-app
sys.path.insert(0, '/app')

listen = os.getenv('QUEUES', 'default').split(',')

redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
conn = redis.from_url(redis_url)

if __name__ == '__main__':
    with Connection(conn):
        worker = Worker(list(map(Queue, listen)))
        worker.work()