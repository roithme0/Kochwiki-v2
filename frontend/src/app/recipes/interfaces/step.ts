export interface Step {
  id: number;
  index: number;
  description: string;
  recipeId: number;
}

export interface RecipeStepWrite {
  index: number;
  description: string;
}
