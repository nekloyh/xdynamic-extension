# ===================================
# XDynamic Backend API - Dockerfile
# ===================================
# Multi-stage build for optimal image size
# Supports: FastAPI + PyTorch CPU + SQLite

# ===== Stage 1: Builder =====
FROM python:3.12-slim AS builder

ENV PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy requirements first (for layer caching)
COPY requirements.txt ./

# Create virtual environment and install Python dependencies
RUN python -m venv /opt/venv && \
    . /opt/venv/bin/activate && \
    python -m pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

# ===== Stage 2: Runtime =====
FROM python:3.12-slim AS runtime

# Metadata
LABEL maintainer="XDynamic Team"
LABEL description="XDynamic Backend API"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    TZ=Asia/Ho_Chi_Minh

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg-turbo-progs \
    libjpeg62-turbo \
    zlib1g \
    curl \
    tzdata \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

# Create app user (security best practice)
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Copy application code
COPY app ./app
COPY mobilenetv2_dangerous_objects.pth ./

# Create data directory for SQLite database
RUN mkdir -p /app/data && \
    chown -R appuser:appuser /app/data && \
    chmod 755 /app/data

# Change ownership of all app files
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
