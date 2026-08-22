import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { Chart, DoughnutController, ArcElement } from 'chart.js';
import { Foodstuff } from '../../../foodstuffs/interfaces/foodstuff';
import { ChartLegendElement } from '../../../interfaces/chart-legend-element';
import { Recipe } from '../../../recipes/interfaces/recipe';

const PLACEHOLDER_VALUE: number = 1;
const PLACEHOLDER_LEGEND: Record<string, ChartLegendElement> = {
  placeholder: {
    displayName: 'Placeholder',
    color: 'rgb(200,200,200)',
    valueAbsolute: PLACEHOLDER_VALUE,
    valuePercentage: 100,
  },
};

@Component({
  selector: 'app-macro-chart',
  templateUrl: './macro-chart.component.html',
  styleUrl: './macro-chart.component.scss',
})
export class MacroChartComponent {
  recipeOrFoodstuff = input.required<Recipe | Foodstuff>();
  showKcal = input<boolean>(true);

  legendUpdated = output<Record<string, ChartLegendElement>>();

  @ViewChild('canvas')
  readonly canvas: ElementRef<HTMLCanvasElement> | undefined;

  chart: Chart | null = null;

  dataIncompleteOrInvalid = computed(
    (): boolean =>
      this.recipeOrFoodstuff().carbs == null ||
      this.recipeOrFoodstuff().protein == null ||
      this.recipeOrFoodstuff().fat == null ||
      (this.recipeOrFoodstuff().carbs == 0 &&
        this.recipeOrFoodstuff().protein == 0 &&
        this.recipeOrFoodstuff().fat == 0)
  );

  legend = computed(
    (): Record<string, ChartLegendElement> =>
      this.buildLegend(this.recipeOrFoodstuff())
  );

  constructor() {
    effect(() => this.legendUpdated.emit(this.legend()));
  }

  ngAfterViewInit(): void {
    Chart.register(DoughnutController, ArcElement);
    const canvasElement = this.canvas?.nativeElement;
    if (canvasElement != undefined) {
      this.createChart(
        canvasElement,
        this.recipeOrFoodstuff(),
        this.legend(),
        this.dataIncompleteOrInvalid()
      );
    }
  }

  private buildLegend = (
    recipeOrFoodstuff: Recipe | Foodstuff
  ): Record<string, ChartLegendElement> =>
    this.dataIncompleteOrInvalid()
      ? PLACEHOLDER_LEGEND
      : {
          carbs: {
            displayName: 'Kohlenhydrate',
            color: 'rgb(19,154,155)',
            valueAbsolute: recipeOrFoodstuff.carbs,
            valuePercentage: this.calculateValuePercentage(
              recipeOrFoodstuff,
              recipeOrFoodstuff.carbs
            ),
          },
          protein: {
            displayName: 'Protein',
            color: 'rgb(155, 255, 117)',
            valueAbsolute: recipeOrFoodstuff.protein,
            valuePercentage: this.calculateValuePercentage(
              recipeOrFoodstuff,
              recipeOrFoodstuff.protein
            ),
          },
          fat: {
            displayName: 'Fett',
            color: 'rgb(255,97,97)',
            valueAbsolute: recipeOrFoodstuff.fat,
            valuePercentage: this.calculateValuePercentage(
              recipeOrFoodstuff,
              recipeOrFoodstuff.fat
            ),
          },
        };

  private createChart(
    canvas: HTMLCanvasElement,
    recipeOrFoodstuff: Recipe | Foodstuff,
    legend: Record<string, ChartLegendElement>,
    dataIncompleteOrInvalid: boolean
  ): void {
    this.chart = new Chart(canvas, {
      type: 'doughnut',
      options: {
        cutout: '70%',
        animation: false,
      },
      data: {
        datasets: [
          {
            data: dataIncompleteOrInvalid
              ? [PLACEHOLDER_VALUE]
              : [
                  recipeOrFoodstuff.carbs,
                  recipeOrFoodstuff.protein,
                  recipeOrFoodstuff.fat,
                ],
            backgroundColor: dataIncompleteOrInvalid
              ? [legend['placeholder'].color]
              : [
                  legend['carbs'].color,
                  legend['protein'].color,
                  legend['fat'].color,
                ],
            borderWidth: 0,
          },
        ],
      },
    });
  }

  private calculateValuePercentage(
    recipeOrFoodstuff: Recipe | Foodstuff,
    macroValue: number | null | undefined
  ): number | null {
    if (
      recipeOrFoodstuff.carbs == null ||
      recipeOrFoodstuff.protein == null ||
      recipeOrFoodstuff.fat == null ||
      macroValue == null
    ) {
      return null;
    }

    const macroSum: number =
      recipeOrFoodstuff.carbs +
      recipeOrFoodstuff.protein +
      recipeOrFoodstuff.fat;
    return (macroValue / macroSum) * 100;
  }
}
