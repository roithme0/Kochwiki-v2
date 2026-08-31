from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.services.exceptions import ConflictError, NotFoundError
from app.services.integrity import flush_for_unique_conflict


def list_users(session: Session) -> Sequence[User]:
    return session.scalars(select(User).order_by(User.id)).all()


def get_user_by_username(session: Session, username: str) -> User:
    user = session.scalar(select(User).where(User.username == username))
    if user is None:
        raise NotFoundError(f"User with username {username} not found")
    return user


def get_user(session: Session, user_id: int) -> User:
    user = session.get(User, user_id)
    if user is None:
        raise NotFoundError(f"User with id {user_id} not found")
    return user


def create_user(session: Session, payload: UserCreate) -> User:
    user = User(username=payload.username)
    session.add(user)
    flush_for_unique_conflict(session, "custom_user_username_key", "A user with the same username already exists")
    return user


def update_user(session: Session, user_id: int, payload: UserUpdate) -> User:
    user = get_user(session, user_id)
    if "username" in payload.model_fields_set:
        user.username = payload.username or user.username
    flush_for_unique_conflict(session, "custom_user_username_key", "A user with the same username already exists")
    return user


def delete_user(session: Session, user_id: int) -> None:
    session.delete(get_user(session, user_id))
    session.flush()
