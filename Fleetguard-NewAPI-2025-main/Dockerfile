# Multi-stage Dockerfile for Django Backend with ML Dependencies
# Optimized for Hostinger KVM 2 VPS (2 vCPU, 8GB RAM)

FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libmariadb-dev \
    pkg-config \
    poppler-utils \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /app

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install Python dependencies
# Install large ML packages first for better caching
RUN pip install --no-cache-dir torch==2.3.1 torchvision==0.18.1 --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir paddlepaddle==2.6.2 && \
    pip install --no-cache-dir ultralytics==8.2.63 && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy YOLO model files
COPY best.pt /app/best.pt
COPY best_old.pt /app/best_old.pt

# Create necessary directories
RUN mkdir -p /app/media /app/static /app/logs

# Collect static files (will run migrations separately)
# RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/admin/', timeout=5)" || exit 1

# Run Gunicorn
CMD ["gunicorn", "--config", "gunicorn.conf.py", "fleetguard_api.wsgi:application"]
