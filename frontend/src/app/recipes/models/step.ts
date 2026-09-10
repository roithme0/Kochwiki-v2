export interface Step {
  id: number;
  index: number;
  description: string;
  recipeVersionId: string;
}

export interface RecipeStepWrite {
  index: number;
  description: string;
}
