import { FoodstuffUnit } from './foodstuff-unit';

export interface FoodstuffSummary {
  id: number;
  name: string;
  brand: string | null;
  unit: FoodstuffUnit;
  unitVerbose: string;
  kcal: number | null;
  carbs: number | null;
  protein: number | null;
  fat: number | null;
}
