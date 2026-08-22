import { Foodstuff } from '../../foodstuffs/interfaces/foodstuff';
import { ShoppingListItemIngredient } from '../../shopping-list/interfaces/shopping-list-item-ingredient';

export interface Ingredient {
  [key: string]: any;
  id: number;
  index: number;
  amount: number;
  foodstuff: Foodstuff;
  shoppingListItemIngredients: ShoppingListItemIngredient[];
  name: string;
  brand: string | null;
  recipeId: number;
  unitVerbose: string;
  carbs: number | null;
  protein: number | null;
  unit: string;
  kcal: number | null;
  fat: number | null;
}
