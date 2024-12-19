FROM python:3.9-slim

WORKDIR /app

# Install bash
RUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*

# Create instance directory
RUN mkdir -p instance

# Create and activate virtual environment
RUN python -m venv .venv

# Copy backend files
COPY requirements.txt .
COPY wsgi.py .
COPY app/ ./app/
COPY instance/.env ./instance/.env

# Copy frontend dist files - Changed this line
COPY frontend/dist/ ./frontend/dist/

# Install dependencies in virtual environment
RUN /bin/bash -c "source .venv/bin/activate && pip install --no-cache-dir -r requirements.txt"

# Use the port from .env file
ENV PORT=446
EXPOSE ${PORT}

# Run the application 
CMD ["/bin/bash", "-c", "source .venv/bin/activate && gunicorn --bind 0.0.0.0:${PORT} \
     --timeout 3600 \
     --workers 3 \
     --log-level debug \
     --error-logfile - \
     --access-logfile - \
     --capture-output \
     wsgi:app"]