from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import Unit
from app.schemas.common import JsonDecimal


class FoodstuffFields(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    brand: str | None = Field(default=None, max_length=100)
    unit: Unit
    kcal: Decimal | None = Field(default=None, ge=0)
    carbs: Decimal | None = Field(default=None, ge=0)
    protein: Decimal | None = Field(default=None, ge=0)
    fat: Decimal | None = Field(default=None, ge=0)

    @field_validator("brand", mode="before")
    @classmethod
    def empty_brand_is_none(cls, value: object) -> object:
        return None if value == "" else value


class FoodstuffCreate(FoodstuffFields):
    pass


class FoodstuffUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=50)
    brand: str | None = Field(default=None, max_length=100)
    unit: Unit | None = None
    kcal: Decimal | None = Field(default=None, ge=0)
    carbs: Decimal | None = Field(default=None, ge=0)
    protein: Decimal | None = Field(default=None, ge=0)
    fat: Decimal | None = Field(default=None, ge=0)

    @field_validator("brand", mode="before")
    @classmethod
    def empty_brand_is_none(cls, value: object) -> object:
        return None if value == "" else value


class FoodstuffOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    brand: str | None
    unit: Unit
    unitVerbose: str
    kcal: JsonDecimal | None
    carbs: JsonDecimal | None
    protein: JsonDecimal | None
    fat: JsonDecimal | None
    recipeIds: list[int]
