from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import CustomUserCreate, CustomUserUpdate
from app.services.exceptions import ConflictError, NotFoundError


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


def create_user(session: Session, payload: CustomUserCreate) -> User:
    user = User(username=payload.username)
    session.add(user)
    _flush_for_integrity(session)
    return user


def update_user(session: Session, user_id: int, payload: CustomUserUpdate) -> User:
    user = get_user(session, user_id)
    if "username" in payload.model_fields_set:
        user.username = payload.username or user.username
    _flush_for_integrity(session)
    return user


def delete_user(session: Session, user_id: int) -> None:
    session.delete(get_user(session, user_id))
    session.flush()


def _flush_for_integrity(session: Session) -> None:
    try:
        session.flush()
    except IntegrityError as error:
        session.rollback()
        raise ConflictError("A custom user with the same username already exists") from error
