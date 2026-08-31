from collections.abc import Sequence

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import CustomUserCreate, CustomUserOut, CustomUserUpdate
from app.services import users

router = APIRouter()


@router.get("/users", response_model=list[CustomUserOut])
def get_users(session: Session = Depends(get_db)) -> Sequence[CustomUserOut]:
    return [CustomUserOut.model_validate(user) for user in users.list_users(session)]


@router.get("/users/{username}", response_model=CustomUserOut)
def get_user(username: str, session: Session = Depends(get_db)) -> CustomUserOut:
    return CustomUserOut.model_validate(users.get_user_by_username(session, username))


@router.post("/users", response_model=CustomUserOut, status_code=status.HTTP_201_CREATED)
def post_user(payload: CustomUserCreate, session: Session = Depends(get_db)) -> CustomUserOut:
    user = users.create_user(session, payload)
    session.commit()
    return CustomUserOut.model_validate(user)


@router.patch("/users/{user_id}", response_model=CustomUserOut)
def patch_user(user_id: int, payload: CustomUserUpdate, session: Session = Depends(get_db)) -> CustomUserOut:
    user = users.update_user(session, user_id, payload)
    session.commit()
    return CustomUserOut.model_validate(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, session: Session = Depends(get_db)) -> Response:
    users.delete_user(session, user_id)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
