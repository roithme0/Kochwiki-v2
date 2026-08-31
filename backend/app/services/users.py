from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.user import CustomUser
from app.schemas.user import CustomUserCreate, CustomUserUpdate
from app.services.exceptions import ConflictError, NotFoundError


def list_users(session: Session) -> Sequence[CustomUser]:
    return session.scalars(select(CustomUser).order_by(CustomUser.id)).all()


def get_user_by_username(session: Session, username: str) -> CustomUser:
    user = session.scalar(select(CustomUser).where(CustomUser.username == username))
    if user is None:
        raise NotFoundError(f"CustomUser with username {username} not found")
    return user


def get_user(session: Session, user_id: int) -> CustomUser:
    user = session.get(CustomUser, user_id)
    if user is None:
        raise NotFoundError(f"CustomUser with id {user_id} not found")
    return user


def create_user(session: Session, payload: CustomUserCreate) -> CustomUser:
    user = CustomUser(username=payload.username)
    session.add(user)
    _flush_for_integrity(session)
    return user


def update_user(session: Session, user_id: int, payload: CustomUserUpdate) -> CustomUser:
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
