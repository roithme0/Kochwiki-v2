from enum import StrEnum


class Unit(StrEnum):
    G = "G"
    ML = "ML"
    PIECE = "PIECE"

    @property
    def verbose_name(self) -> str:
        return {self.G: "g", self.ML: "ml", self.PIECE: "Stk."}[self]


class RecipeVersionState(StrEnum):
    ACTIVE = "active"
    DRAFT = "draft"
    HISTORICAL = "historical"
