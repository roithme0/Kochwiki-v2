import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../interfaces/recipe';
import { IngredientsGridShoppingListButtonComponent } from '../ingredients-grid-shopping-list-button/ingredients-grid-shopping-list-button.component';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../../environments/environment';
import { MacroChartComponent } from '../../../core/components/macro-chart/macro-chart.component';

@Component({
  selector: 'app-ingredients-grid',
  imports: [
    CommonModule,
    MatCardModule,
    IngredientsGridShoppingListButtonComponent,
    MacroChartComponent,
  ],
  templateUrl: './ingredients-grid.component.html',
  styleUrl: './ingredients-grid.component.scss',
})
export class IngredientsGridComponent {
  recipe = input.required<Recipe>();

  readonly environmentName: string = environment.name;
}
