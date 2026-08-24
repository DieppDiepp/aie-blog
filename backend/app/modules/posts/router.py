"""HTTP endpoints for posts. This is the api layer, the outermost ring."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.posts import service
from app.modules.posts.schemas import PostCreate, PostRead

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=list[PostRead])
def list_posts(db: Session = Depends(get_db)) -> list[PostRead]:
    return service.list_posts(db)


@router.get("/{slug}", response_model=PostRead)
def get_post(slug: str, db: Session = Depends(get_db)) -> PostRead:
    post = service.get_post(db, slug)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("", response_model=PostRead, status_code=201)
def create_post(data: PostCreate, db: Session = Depends(get_db)) -> PostRead:
    return service.create_post(db, data)
