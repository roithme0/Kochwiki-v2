import { FoodstuffSummary } from '../../foodstuffs/models/foodstuff-summary';

export interface Ingredient {
  id: number;
  index: number;
  amount: number;
  foodstuff: FoodstuffSummary;
  recipeVersionId: string;
}

export interface RecipeIngredientWrite {
  index: number;
  amount: number;
  foodstuffId: number;
}
