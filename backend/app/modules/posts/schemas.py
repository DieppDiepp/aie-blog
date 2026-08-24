"""Pydantic schemas: the shape of request and response bodies for posts."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PostCreate(BaseModel):
    title: str
    summary: str = ""
    body: str = ""
    # Optional. When omitted, the service derives a slug from the title.
    slug: str | None = None


class PostRead(BaseModel):
    id: int
    slug: str
    title: str
    summary: str
    body: str
    created_at: datetime

    # Allow building this schema directly from an ORM object.
    model_config = ConfigDict(from_attributes=True)
