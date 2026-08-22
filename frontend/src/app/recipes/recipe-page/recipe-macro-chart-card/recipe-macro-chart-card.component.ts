import { Component, WritableSignal, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../interfaces/recipe';
import { ChartLegendElement } from '../../../interfaces/chart-legend-element';
import { MatCardModule } from '@angular/material/card';
import { ChartLegendElementComponent } from '../../../core/components/chart-legend-element/chart-legend-element.component';
import { MacroChartComponent } from '../../../core/components/macro-chart/macro-chart.component';

@Component({
  selector: 'app-recipe-macro-chart-card',
  imports: [
    CommonModule,
    MatCardModule,
    ChartLegendElementComponent,
    MacroChartComponent,
  ],
  templateUrl: './recipe-macro-chart-card.component.html',
  styleUrl: './recipe-macro-chart-card.component.scss',
})
export class RecipeMacroChartCardComponent {
  recipe = input.required<Recipe>();
  showHeader = input<boolean>(true);
  showLegend = input<boolean>(true);

  legend: WritableSignal<Record<string, ChartLegendElement>> = signal({});
}
