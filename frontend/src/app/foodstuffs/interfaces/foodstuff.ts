import { FoodstuffSummary } from './foodstuff-summary';

export interface Foodstuff extends FoodstuffSummary {
  recipeVersionIds: string[];
}
