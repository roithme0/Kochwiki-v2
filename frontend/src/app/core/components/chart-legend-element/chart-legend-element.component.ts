import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ChartLegendElement } from '../../../interfaces/chart-legend-element';

@Component({
  selector: 'app-chart-legend-element',
  imports: [CommonModule, MatCardModule],
  templateUrl: './chart-legend-element.component.html',
  styleUrl: './chart-legend-element.component.scss',
})
export class ChartLegendElementComponent {
  legendElement = input.required<ChartLegendElement>();

  displayedValueAbsolute = computed((): number | null => {
    const valueAbsolute: number | null | undefined =
      this.legendElement().valueAbsolute;
    return valueAbsolute == null ? null : this.round(valueAbsolute, 1);
  });
  displayedValuePercentage = computed((): number | null => {
    const valuePercentage: number | null | undefined =
      this.legendElement().valuePercentage;
    return valuePercentage == null ? null : this.round(valuePercentage, 1);
  });

  private round(value: number, precision: number) {
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
  }
}
