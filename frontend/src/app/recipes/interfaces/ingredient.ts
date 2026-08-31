import { FoodstuffSummary } from '../../foodstuffs/interfaces/foodstuff-summary';

export interface Ingredient {
  id: number;
  index: number;
  amount: number;
  foodstuff: FoodstuffSummary;
  recipeId: number;
}
