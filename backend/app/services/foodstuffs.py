from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.foodstuff import Foodstuff
from app.models.recipe import Ingredient
from app.schemas.foodstuff import FoodstuffCreate, FoodstuffOut, FoodstuffUpdate
from app.services.exceptions import ConflictError, NotFoundError


def foodstuff_out(foodstuff: Foodstuff) -> FoodstuffOut:
    return FoodstuffOut(
        id=foodstuff.id,
        name=foodstuff.name,
        brand=foodstuff.brand,
        unit=foodstuff.unit,
        unitVerbose=foodstuff.unit.verbose_name,
        kcal=foodstuff.kcal,
        carbs=foodstuff.carbs,
        protein=foodstuff.protein,
        fat=foodstuff.fat,
        recipeIds=sorted({ingredient.recipe_id for ingredient in foodstuff.ingredients}),
    )


def list_foodstuffs(session: Session) -> Sequence[Foodstuff]:
    statement = select(Foodstuff).options(selectinload(Foodstuff.ingredients)).order_by(Foodstuff.id)
    return session.scalars(statement).all()


def get_foodstuff(session: Session, foodstuff_id: int) -> Foodstuff:
    statement = (
        select(Foodstuff)
        .options(selectinload(Foodstuff.ingredients))
        .where(Foodstuff.id == foodstuff_id)
    )
    foodstuff = session.scalar(statement)
    if foodstuff is None:
        raise NotFoundError(f"Foodstuff with id {foodstuff_id} not found")
    return foodstuff


def create_foodstuff(session: Session, payload: FoodstuffCreate) -> Foodstuff:
    foodstuff = Foodstuff(**payload.model_dump())
    session.add(foodstuff)
    _flush_for_integrity(session)
    return get_foodstuff(session, foodstuff.id)


def update_foodstuff(session: Session, foodstuff_id: int, payload: FoodstuffUpdate) -> Foodstuff:
    foodstuff = get_foodstuff(session, foodstuff_id)
    for field_name, value in payload.model_dump(exclude_unset=True).items():
        setattr(foodstuff, field_name, value)
    _flush_for_integrity(session)
    return get_foodstuff(session, foodstuff.id)


def delete_foodstuff(session: Session, foodstuff_id: int) -> None:
    foodstuff = get_foodstuff(session, foodstuff_id)
    usage_count = session.scalar(
        select(func.count()).select_from(Ingredient).where(Ingredient.foodstuff_id == foodstuff.id)
    )
    if usage_count and usage_count > 0:
        raise ConflictError("Foodstuff cannot be deleted while it is used by a recipe")
    session.delete(foodstuff)
    session.flush()


def _flush_for_integrity(session: Session) -> None:
    try:
        session.flush()
    except IntegrityError as error:
        session.rollback()
        raise ConflictError("A foodstuff with the same name and brand already exists") from error
