from collections.abc import Sequence
from decimal import Decimal
from typing import Literal

from sqlalchemy import Select, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.foodstuff import Foodstuff
from app.models.recipe import Ingredient, Recipe, Step
from app.schemas.recipe import IngredientOut, IngredientWrite, RecipeCreate, RecipeOut, RecipeUpdate, StepOut, StepWrite
from app.services.exceptions import ConflictError, NotFoundError
from app.services.foodstuffs import foodstuff_summary_out

NutritionField = Literal["kcal", "carbs", "protein", "fat"]


def list_recipes(session: Session) -> Sequence[Recipe]:
    return session.scalars(_recipe_statement()).all()


def get_recipe(session: Session, recipe_id: int) -> Recipe:
    recipe = session.scalar(_recipe_statement().where(Recipe.id == recipe_id))
    if recipe is None:
        raise NotFoundError(f"Recipe with id {recipe_id} not found")
    return recipe


def create_recipe(session: Session, payload: RecipeCreate) -> Recipe:
    foodstuffs = _foodstuffs_for_ingredients(session, payload.ingredients)
    recipe = Recipe(
        name=payload.name,
        servings=payload.servings,
        preptime=payload.preptime,
        origin_name=payload.originName,
        origin_url=payload.originUrl,
    )
    recipe.ingredients = _new_ingredients(payload.ingredients, foodstuffs)
    recipe.steps = _new_steps(payload.steps)
    session.add(recipe)
    _flush_for_integrity(session, "A recipe with the same name already exists")
    return get_recipe(session, recipe.id)


def update_recipe(session: Session, recipe_id: int, payload: RecipeUpdate) -> Recipe:
    recipe = get_recipe(session, recipe_id)
    updated_fields = payload.model_fields_set
    if "name" in updated_fields and payload.name is not None:
        recipe.name = payload.name
    if "servings" in updated_fields and payload.servings is not None:
        recipe.servings = payload.servings
    if "preptime" in updated_fields:
        recipe.preptime = payload.preptime
    if "originName" in updated_fields:
        recipe.origin_name = payload.originName
    if "originUrl" in updated_fields:
        recipe.origin_url = payload.originUrl

    if "ingredients" in updated_fields:
        ingredient_payloads = payload.ingredients or []
        foodstuffs = _foodstuffs_for_ingredients(session, ingredient_payloads)
        _replace_ingredients(recipe, ingredient_payloads, foodstuffs)
    if "steps" in updated_fields:
        recipe.steps = _new_steps(payload.steps or [])

    _flush_for_integrity(session, "A recipe with the same name or duplicate foodstuff already exists")
    return get_recipe(session, recipe.id)


def delete_recipe(session: Session, recipe_id: int) -> None:
    recipe = get_recipe(session, recipe_id)
    session.delete(recipe)
    session.flush()


def recipe_out(recipe: Recipe) -> RecipeOut:
    total_kcal = _total_nutrition(recipe, "kcal")
    total_carbs = _total_nutrition(recipe, "carbs")
    total_protein = _total_nutrition(recipe, "protein")
    total_fat = _total_nutrition(recipe, "fat")
    return RecipeOut(
        id=recipe.id,
        name=recipe.name,
        servings=recipe.servings,
        preptime=recipe.preptime,
        originName=recipe.origin_name,
        originUrl=recipe.origin_url,
        kcal=_per_serving(total_kcal, recipe.servings),
        carbs=_per_serving(total_carbs, recipe.servings),
        protein=_per_serving(total_protein, recipe.servings),
        fat=_per_serving(total_fat, recipe.servings),
        ingredients=[ingredient_out(ingredient) for ingredient in sorted(recipe.ingredients, key=lambda ingredient: ingredient.index)],
        steps=[step_out(step) for step in sorted(recipe.steps, key=lambda step: step.index)],
    )


def ingredient_out(ingredient: Ingredient) -> IngredientOut:
    return IngredientOut(
        id=ingredient.id,
        index=ingredient.index,
        amount=ingredient.amount,
        foodstuff=foodstuff_summary_out(ingredient.foodstuff),
        recipeId=ingredient.recipe_id,
    )


def step_out(step: Step) -> StepOut:
    return StepOut(id=step.id, index=step.index, description=step.description, recipeId=step.recipe_id)


def list_ingredients(session: Session) -> Sequence[Ingredient]:
    statement = select(Ingredient).options(selectinload(Ingredient.foodstuff)).order_by(Ingredient.id)
    return session.scalars(statement).all()


def list_steps(session: Session) -> Sequence[Step]:
    statement = select(Step).order_by(Step.id)
    return session.scalars(statement).all()


def _recipe_statement() -> Select[tuple[Recipe]]:
    return (
        select(Recipe)
        .options(selectinload(Recipe.ingredients).selectinload(Ingredient.foodstuff), selectinload(Recipe.steps))
        .order_by(Recipe.id)
    )


def _foodstuffs_for_ingredients(session: Session, ingredients: list[IngredientWrite]) -> dict[int, Foodstuff]:
    foodstuff_ids = [ingredient.foodstuffId for ingredient in ingredients]
    if len(foodstuff_ids) != len(set(foodstuff_ids)):
        raise ConflictError("A foodstuff may only occur once per recipe")
    if not foodstuff_ids:
        return {}
    foodstuffs = session.scalars(select(Foodstuff).where(Foodstuff.id.in_(foodstuff_ids))).all()
    by_id = {foodstuff.id: foodstuff for foodstuff in foodstuffs}
    missing_ids = sorted(set(foodstuff_ids).difference(by_id))
    if missing_ids:
        raise NotFoundError(f"Foodstuff with id {missing_ids[0]} not found")
    return by_id


def _new_ingredients(payloads: list[IngredientWrite], foodstuffs: dict[int, Foodstuff]) -> list[Ingredient]:
    return [
        Ingredient(index=payload.index, amount=payload.amount, foodstuff=foodstuffs[payload.foodstuffId])
        for payload in payloads
    ]


def _replace_ingredients(
    recipe: Recipe, payloads: list[IngredientWrite], foodstuffs: dict[int, Foodstuff]
) -> None:
    existing_by_foodstuff_id = {ingredient.foodstuff_id: ingredient for ingredient in recipe.ingredients}
    requested_ids = {payload.foodstuffId for payload in payloads}
    recipe.ingredients[:] = [
        ingredient for ingredient in recipe.ingredients if ingredient.foodstuff_id in requested_ids
    ]
    for payload in payloads:
        existing = existing_by_foodstuff_id.get(payload.foodstuffId)
        if existing is None:
            recipe.ingredients.append(
                Ingredient(index=payload.index, amount=payload.amount, foodstuff=foodstuffs[payload.foodstuffId])
            )
        else:
            existing.index = payload.index
            existing.amount = payload.amount


def _new_steps(payloads: list[StepWrite]) -> list[Step]:
    return [Step(index=payload.index, description=payload.description) for payload in payloads]


def _total_nutrition(recipe: Recipe, attribute: NutritionField) -> Decimal | None:
    if not recipe.ingredients:
        return None
    total = Decimal("0")
    for ingredient in recipe.ingredients:
        value = _nutrition_value(ingredient.foodstuff, attribute)
        if value is None:
            return None
        if ingredient.foodstuff.unit.value in ("G", "ML"):
            total += ingredient.amount * value / Decimal("100")
        else:
            total += ingredient.amount * value
    return total


def _per_serving(total: Decimal | None, servings: int) -> Decimal | None:
    return None if total is None else total / Decimal(servings)


def _nutrition_value(foodstuff: Foodstuff, attribute: NutritionField) -> Decimal | None:
    if attribute == "kcal":
        return foodstuff.kcal
    if attribute == "carbs":
        return foodstuff.carbs
    if attribute == "protein":
        return foodstuff.protein
    return foodstuff.fat


def _flush_for_integrity(session: Session, message: str) -> None:
    try:
        session.flush()
    except IntegrityError as error:
        session.rollback()
        raise ConflictError(message) from error
