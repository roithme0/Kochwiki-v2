export interface ShoppingListItemIngredient {
  id: number;
  isChecked: boolean;
  isPinned: boolean;
  amount: number;
  shoppingListId: number;
  name: string;
  brand: string | null;
  unitVerbose: string;
  unit: string;
  recipeName: string;
}
