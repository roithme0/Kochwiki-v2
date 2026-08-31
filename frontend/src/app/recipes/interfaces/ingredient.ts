import { FoodstuffSummary } from '../../foodstuffs/interfaces/foodstuff-summary';
import { ShoppingListItemIngredient } from '../../shopping-list/interfaces/shopping-list-item-ingredient';

export interface Ingredient {
  id: number;
  index: number;
  amount: number;
  foodstuff: FoodstuffSummary;
  recipeId: number;
  shoppingListItemIngredients?: ShoppingListItemIngredient[];
}
