from collections.abc import Sequence

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.services import users

router = APIRouter()


@router.get("/users", response_model=list[UserOut])
def get_users(session: Session = Depends(get_db)) -> Sequence[UserOut]:
    return [UserOut.model_validate(user) for user in users.list_users(session)]


@router.get("/users/{username}", response_model=UserOut)
def get_user(username: str, session: Session = Depends(get_db)) -> UserOut:
    return UserOut.model_validate(users.get_user_by_username(session, username))


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def post_user(payload: UserCreate, session: Session = Depends(get_db)) -> UserOut:
    user = users.create_user(session, payload)
    session.commit()
    return UserOut.model_validate(user)


@router.patch("/users/{user_id}", response_model=UserOut)
def patch_user(user_id: int, payload: UserUpdate, session: Session = Depends(get_db)) -> UserOut:
    user = users.update_user(session, user_id, payload)
    session.commit()
    return UserOut.model_validate(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, session: Session = Depends(get_db)) -> Response:
    users.delete_user(session, user_id)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
