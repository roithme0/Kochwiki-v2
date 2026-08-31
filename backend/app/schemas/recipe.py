from decimal import Decimal
from typing import Self
from urllib.parse import urlparse

from pydantic import BaseModel, Field, field_validator, model_validator

from app.schemas.common import JsonDecimal
from app.schemas.foodstuff import FoodstuffSummaryOut


class IngredientWrite(BaseModel):
    index: int = Field(ge=1, le=99)
    amount: Decimal = Field(gt=0, le=9999)
    foodstuffId: int = Field(gt=0)


class StepWrite(BaseModel):
    index: int = Field(ge=1, le=99)
    description: str = Field(min_length=1, max_length=200)


class RecipeFields(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    servings: int = Field(ge=1, le=99)
    preptime: int | None = Field(default=None, ge=1, le=999)
    originName: str | None = Field(default=None, max_length=200)
    originUrl: str | None = Field(default=None, max_length=200)

    @field_validator("originUrl")
    @classmethod
    def validate_origin_url(cls, value: str | None) -> str | None:
        if value in (None, ""):
            return None
        parsed = urlparse(value)
        if not parsed.scheme or not parsed.netloc:
            raise ValueError("originUrl must be a valid absolute URL")
        return value


class RecipeCreate(RecipeFields):
    ingredients: list[IngredientWrite] = Field(default_factory=list)
    steps: list[StepWrite] = Field(default_factory=list)

    @field_validator("ingredients")
    @classmethod
    def validate_unique_ingredient_indexes(cls, value: list[IngredientWrite]) -> list[IngredientWrite]:
        _validate_unique_indexes([ingredient.index for ingredient in value], "ingredient")
        return value

    @field_validator("steps")
    @classmethod
    def validate_unique_step_indexes(cls, value: list[StepWrite]) -> list[StepWrite]:
        _validate_unique_indexes([step.index for step in value], "step")
        return value


class RecipeUpdate(RecipeFields):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    servings: int | None = Field(default=None, ge=1, le=99)
    preptime: int | None = Field(default=None, ge=1, le=999)
    originName: str | None = Field(default=None, max_length=200)
    originUrl: str | None = Field(default=None, max_length=200)
    ingredients: list[IngredientWrite] | None = None
    steps: list[StepWrite] | None = None

    @field_validator("ingredients")
    @classmethod
    def validate_unique_ingredient_indexes(cls, value: list[IngredientWrite] | None) -> list[IngredientWrite] | None:
        if value is not None:
            _validate_unique_indexes([ingredient.index for ingredient in value], "ingredient")
        return value

    @field_validator("steps")
    @classmethod
    def validate_unique_step_indexes(cls, value: list[StepWrite] | None) -> list[StepWrite] | None:
        if value is not None:
            _validate_unique_indexes([step.index for step in value], "step")
        return value

    @model_validator(mode="after")
    def validate_required_fields(self) -> Self:
        if "name" in self.model_fields_set and self.name is None:
            raise ValueError("name cannot be null")
        if "servings" in self.model_fields_set and self.servings is None:
            raise ValueError("servings cannot be null")
        return self


class IngredientOut(BaseModel):
    id: int
    index: int
    amount: JsonDecimal
    foodstuff: FoodstuffSummaryOut
    recipeId: int


class StepOut(BaseModel):
    id: int
    index: int
    description: str
    recipeId: int


class RecipeOut(BaseModel):
    id: int
    name: str
    servings: int
    preptime: int | None
    originName: str | None
    originUrl: str | None
    kcal: JsonDecimal | None
    carbs: JsonDecimal | None
    protein: JsonDecimal | None
    fat: JsonDecimal | None
    ingredients: list[IngredientOut]
    steps: list[StepOut]


def _validate_unique_indexes(indexes: list[int], item_name: str) -> None:
    if len(indexes) != len(set(indexes)):
        raise ValueError(f"{item_name} indexes must be unique per recipe")
