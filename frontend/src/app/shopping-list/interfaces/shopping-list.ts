import { ShoppingListItemIngredient } from './shopping-list-item-ingredient';

export interface ShoppingList {
  id: number;
  shoppingListItemIngredients: ShoppingListItemIngredient[];
}
