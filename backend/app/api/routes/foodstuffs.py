from collections.abc import Sequence

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.foodstuff import FoodstuffCreate, FoodstuffOut, FoodstuffUpdate
from app.services import foodstuffs

router = APIRouter()


@router.get("/foodstuffs", response_model=list[FoodstuffOut])
def get_foodstuffs(session: Session = Depends(get_db)) -> Sequence[FoodstuffOut]:
    return [foodstuffs.foodstuff_out(foodstuff) for foodstuff in foodstuffs.list_foodstuffs(session)]


@router.get("/foodstuffs/{foodstuff_id}", response_model=FoodstuffOut)
def get_foodstuff(foodstuff_id: int, session: Session = Depends(get_db)) -> FoodstuffOut:
    return foodstuffs.foodstuff_out(foodstuffs.get_foodstuff(session, foodstuff_id))


@router.post("/foodstuffs", response_model=FoodstuffOut, status_code=status.HTTP_201_CREATED)
def post_foodstuff(payload: FoodstuffCreate, session: Session = Depends(get_db)) -> FoodstuffOut:
    foodstuff = foodstuffs.create_foodstuff(session, payload)
    session.commit()
    return foodstuffs.foodstuff_out(foodstuff)


@router.patch("/foodstuffs/{foodstuff_id}", response_model=FoodstuffOut)
def patch_foodstuff(
    foodstuff_id: int, payload: FoodstuffUpdate, session: Session = Depends(get_db)
) -> FoodstuffOut:
    foodstuff = foodstuffs.update_foodstuff(session, foodstuff_id, payload)
    session.commit()
    return foodstuffs.foodstuff_out(foodstuff)


@router.delete("/foodstuffs/{foodstuff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_foodstuff(foodstuff_id: int, session: Session = Depends(get_db)) -> Response:
    foodstuffs.delete_foodstuff(session, foodstuff_id)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/foodstuffs-meta-data/verbose-names")
def get_foodstuff_verbose_names() -> dict[str, str]:
    return {
        "name": "Name",
        "brand": "Marke",
        "unit": "Einheit",
        "unitVerbose": "Einheit",
        "kcal": "Kalorien",
        "carbs": "Kohlenhydrate",
        "protein": "Proteine",
        "fat": "Fett",
    }


@router.get("/foodstuffs-meta-data/unit-choices")
def get_foodstuff_unit_choices() -> dict[str, str]:
    return {"G": "g", "ML": "ml", "PIECE": "Stk."}
