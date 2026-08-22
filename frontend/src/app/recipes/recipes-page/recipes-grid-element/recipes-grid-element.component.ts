import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../interfaces/recipe';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MacroChartComponent } from '../../../core/components/macro-chart/macro-chart.component';

@Component({
  selector: 'app-recipes-grid-element',
  imports: [CommonModule, MatIconModule, MatCardModule, MacroChartComponent],
  templateUrl: './recipes-grid-element.component.html',
  styleUrl: './recipes-grid-element.component.scss',
})
export class RecipesGridElementComponent {
  recipe = input.required<Recipe>();
}
