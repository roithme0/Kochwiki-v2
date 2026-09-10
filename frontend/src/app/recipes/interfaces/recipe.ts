import { Ingredient, RecipeIngredientWrite } from './ingredient';
import { RecipeStepWrite, Step } from './step';

export interface RecipeVersion {
  recipeLineageId: string;
  recipeVersionId: string;
  state: RecipeVersionState;
  createdAt: string;
  lastModified: string;
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

export type RecipeVersionState = 'active' | 'draft' | 'historical';

export interface RecipeVersionWrite {
  name: string;
  servings: number;
  preptime: number | null;
  originName: string | null;
  originUrl: string | null;
  ingredients: RecipeIngredientWrite[];
  steps: RecipeStepWrite[];
}
