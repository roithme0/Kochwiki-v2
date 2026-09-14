import { Component, input } from '@angular/core';

import { RecipeVersion } from '../../models/recipe';
import { MatCardModule } from '@angular/material/card';
import { MacroChartComponent } from '../../../core/components/macro-chart/macro-chart.component';

@Component({
  selector: 'app-ingredients-grid',
  imports: [
    MatCardModule,
    MacroChartComponent
],
  templateUrl: './ingredients-grid.component.html',
  styleUrl: './ingredients-grid.component.scss',
})
export class IngredientsGridComponent {
  recipeVersion = input.required<RecipeVersion>();
}
