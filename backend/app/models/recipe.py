from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.foodstuff import Foodstuff


class Recipe(Base):
    __tablename__ = "recipe"
    __table_args__ = (
        UniqueConstraint("name", name="uq_recipe_name"),
        CheckConstraint("servings >= 1", name="ck_recipe_servings_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    servings: Mapped[int] = mapped_column(nullable=False)
    preptime: Mapped[int | None] = mapped_column(nullable=True)
    origin_name: Mapped[str | None] = mapped_column("origin_name", String(200), nullable=True)
    origin_url: Mapped[str | None] = mapped_column("origin_url", String(200), nullable=True)
    ingredients: Mapped[list[Ingredient]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan", order_by="Ingredient.index"
    )
    steps: Mapped[list[Step]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan", order_by="Step.index"
    )


class Ingredient(Base):
    __tablename__ = "ingredient"
    __table_args__ = (
        UniqueConstraint("foodstuff_id", "recipe_id", name="uq_ingredient_foodstuff_recipe"),
        UniqueConstraint("recipe_id", "index", name="uq_ingredient_recipe_index"),
        CheckConstraint('"index" >= 1', name="ck_ingredient_index_positive"),
        CheckConstraint("amount > 0", name="ck_ingredient_amount_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    index: Mapped[int] = mapped_column(nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False)
    foodstuff_id: Mapped[int] = mapped_column(ForeignKey("foodstuff.id", ondelete="RESTRICT"), nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipe.id", ondelete="CASCADE"), nullable=False)
    foodstuff: Mapped[Foodstuff] = relationship(back_populates="ingredients")
    recipe: Mapped[Recipe] = relationship(back_populates="ingredients")


class Step(Base):
    __tablename__ = "step"
    __table_args__ = (
        UniqueConstraint("recipe_id", "index", name="uq_step_recipe_index"),
        CheckConstraint('"index" >= 1', name="ck_step_index_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    index: Mapped[int] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(String(200), nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipe.id", ondelete="CASCADE"), nullable=False)
    recipe: Mapped[Recipe] = relationship(back_populates="steps")
