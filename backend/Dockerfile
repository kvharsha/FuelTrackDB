# backend/Dockerfile (Production)

# Use a specific Python version for stability
FROM python:3.12-slim

# Set working directory inside the container
WORKDIR /app

# Install build dependencies for mysqlclient
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    pkg-config \
    default-libmysqlclient-dev \
    default-mysql-client \
    netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# Copy the wrapper script and make it executable
COPY wait-for-db.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/wait-for-db.sh

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn whitenoise

# Copy the rest of the application code
COPY . /app

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose the port Django runs on
EXPOSE 8000

# Use gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "core.wsgi:application"]
