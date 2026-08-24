"""Data access for posts. This layer knows the database, nothing about HTTP."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.posts.models import Post


def list_posts(db: Session) -> list[Post]:
    return list(db.scalars(select(Post).order_by(Post.created_at.desc())))


def get_by_slug(db: Session, slug: str) -> Post | None:
    return db.scalar(select(Post).where(Post.slug == slug))


def create(db: Session, post: Post) -> Post:
    db.add(post)
    db.commit()
    db.refresh(post)
    return post
