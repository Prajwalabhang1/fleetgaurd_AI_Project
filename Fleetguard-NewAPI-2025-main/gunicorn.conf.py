# Gunicorn configuration file
# Optimized for Hostinger KVM 2 VPS (2 vCPU, 8GB RAM)

import multiprocessing
import os

# Bind to all interfaces on port 8000
bind = "0.0.0.0:8000"

# Worker configuration
# For KVM 2: 2 vCPU cores, use 2 workers (1 per core)
workers = int(os.getenv("GUNICORN_WORKERS", "2"))

# Use threads for better I/O handling during ML inference
threads = int(os.getenv("GUNICORN_THREADS", "2"))

# Worker class
worker_class = "sync"

# Timeout settings
# Increased timeout for ML model inference (YOLO, PaddleOCR)
timeout = 120
graceful_timeout = 30
keepalive = 5

# Maximum requests per worker before restart (prevents memory leaks)
max_requests = 1000
max_requests_jitter = 100

# Logging
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stderr
loglevel = os.getenv("LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "fleetguard_api"

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (if needed later)
# keyfile = "/path/to/key.pem"
# certfile = "/path/to/cert.pem"

def on_starting(server):
    """Called just before the master process is initialized."""
    server.log.info("Starting Gunicorn server...")

def on_reload(server):
    """Called to recycle workers during a reload via SIGHUP."""
    server.log.info("Reloading Gunicorn server...")

def when_ready(server):
    """Called just after the server is started."""
    server.log.info("Gunicorn server is ready. Spawning workers...")

def worker_int(worker):
    """Called just after a worker exited on SIGINT or SIGQUIT."""
    worker.log.info("Worker received INT or QUIT signal")

def worker_abort(worker):
    """Called when a worker received the SIGABRT signal."""
    worker.log.info("Worker received SIGABRT signal")
