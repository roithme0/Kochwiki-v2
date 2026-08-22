import { Ingredient } from '../../recipes/interfaces/ingredient';

export interface Foodstuff {
  [key: string]: any;
  id: number;
  name: string;
  brand: string | null;
  unit: string;
  unitVerbose: string;
  kcal: number | null;
  carbs: number | null;
  protein: number | null;
  fat: number | null;
  recipeIds: number[];
}
