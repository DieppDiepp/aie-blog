# Backend image: FastAPI served by uvicorn, dependencies managed by uv.
FROM python:3.12-slim

# Install uv, the Python environment and dependency manager.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Install dependencies first so this layer caches when only source changes.
COPY pyproject.toml ./
RUN uv sync --no-dev

# Copy application source.
COPY app ./app

EXPOSE 8000

# uv run executes inside the managed environment.
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
