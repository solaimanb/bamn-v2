import multiprocessing
import os

# Gunicorn config variables
workers_per_core_str = os.getenv("WORKERS_PER_CORE", "1")
web_concurrency_str = os.getenv("WEB_CONCURRENCY", None)
host = os.getenv("HOST", "0.0.0.0")
port = os.getenv("PORT", "10000")
bind_env = os.getenv("BIND", None)
use_loglevel = os.getenv("LOG_LEVEL", "info")

if bind_env:
    use_bind = bind_env
else:
    use_bind = f"{host}:{port}"

cores = multiprocessing.cpu_count()
workers_per_core = float(workers_per_core_str)
default_web_concurrency = workers_per_core * cores + 1

if web_concurrency_str:
    web_concurrency = int(web_concurrency_str)
else:
    web_concurrency = max(int(default_web_concurrency), 2)

# Gunicorn config
bind = use_bind
workers = web_concurrency
worker_class = "uvicorn.workers.UvicornWorker"
keepalive = 120
errorlog = "-"  # stderr
accesslog = "-"  # stdout
loglevel = use_loglevel 