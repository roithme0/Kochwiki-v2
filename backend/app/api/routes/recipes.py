from collections.abc import Sequence

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.recipe import IngredientOut, RecipeCreate, RecipeOut, RecipeUpdate, StepOut
from app.services import recipes

router = APIRouter()


@router.get("/recipes", response_model=list[RecipeOut])
def get_recipes(session: Session = Depends(get_db)) -> Sequence[RecipeOut]:
    return [recipes.recipe_out(recipe) for recipe in recipes.list_recipes(session)]


@router.get("/recipes/{recipe_id}", response_model=RecipeOut)
def get_recipe(recipe_id: int, session: Session = Depends(get_db)) -> RecipeOut:
    return recipes.recipe_out(recipes.get_recipe(session, recipe_id))


@router.post("/recipes", response_model=RecipeOut, status_code=status.HTTP_201_CREATED)
def post_recipe(payload: RecipeCreate, session: Session = Depends(get_db)) -> RecipeOut:
    recipe = recipes.create_recipe(session, payload)
    session.commit()
    return recipes.recipe_out(recipe)


@router.patch("/recipes/{recipe_id}", response_model=RecipeOut)
def patch_recipe(recipe_id: int, payload: RecipeUpdate, session: Session = Depends(get_db)) -> RecipeOut:
    recipe = recipes.update_recipe(session, recipe_id, payload)
    session.commit()
    return recipes.recipe_out(recipe)


@router.delete("/recipes/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(recipe_id: int, session: Session = Depends(get_db)) -> Response:
    recipes.delete_recipe(session, recipe_id)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/ingredients", response_model=list[IngredientOut])
def get_ingredients(session: Session = Depends(get_db)) -> Sequence[IngredientOut]:
    return [recipes.ingredient_out(ingredient) for ingredient in recipes.list_ingredients(session)]


@router.get("/steps", response_model=list[StepOut])
def get_steps(session: Session = Depends(get_db)) -> Sequence[StepOut]:
    return [recipes.step_out(step) for step in recipes.list_steps(session)]
