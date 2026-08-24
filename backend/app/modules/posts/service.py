"""Business logic for posts. Knows use cases, not HTTP and not raw SQL."""

import re

from sqlalchemy.orm import Session

from app.modules.posts import repository
from app.modules.posts.models import Post
from app.modules.posts.schemas import PostCreate


def _slugify(text: str) -> str:
    """Turn a title into a url-safe slug. Minimal on purpose."""
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def list_posts(db: Session) -> list[Post]:
    return repository.list_posts(db)


def get_post(db: Session, slug: str) -> Post | None:
    return repository.get_by_slug(db, slug)


def create_post(db: Session, data: PostCreate) -> Post:
    slug = data.slug or _slugify(data.title)
    post = Post(slug=slug, title=data.title, summary=data.summary, body=data.body)
    return repository.create(db, post)
