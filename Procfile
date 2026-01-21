# This file is optional when using Dockerfile
# Render will automatically detect and use the Dockerfile
web: gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 app:app
