import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../interfaces/recipe';
import { MatCardModule } from '@angular/material/card';
import { MacroChartComponent } from '../../../core/components/macro-chart/macro-chart.component';

@Component({
  selector: 'app-ingredients-grid',
  imports: [
    CommonModule,
    MatCardModule,
    MacroChartComponent,
  ],
  templateUrl: './ingredients-grid.component.html',
  styleUrl: './ingredients-grid.component.scss',
})
export class IngredientsGridComponent {
  recipe = input.required<Recipe>();
}
