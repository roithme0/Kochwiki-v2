import { Ingredient } from './ingredient';
import { Step } from './step';

export interface Recipe {
  id: number;
  name: string;
  servings: number;
  preptime: number | null;
  originName: string | null;
  originUrl: string | null;
  kcal: number | null;
  carbs: number | null;
  protein: number | null;
  fat: number | null;
  ingredients: Ingredient[];
  steps: Step[];
}
