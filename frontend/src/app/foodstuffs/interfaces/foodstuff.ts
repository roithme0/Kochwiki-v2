import { Ingredient } from '../../recipes/interfaces/ingredient';
import { FoodstuffSummary } from './foodstuff-summary';

export interface Foodstuff extends FoodstuffSummary {
  [key: string]: any;
  recipeIds: number[];
}
