"""FastAPI application entry point: wire middleware and routers."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.modules.posts.router import router as posts_router

# Import models so their tables register on Base before create_all runs.
from app.modules.posts import models as _posts_models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Walking skeleton: create tables directly. Alembic comes once schema stabilizes.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="AIE_Blog API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(posts_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
