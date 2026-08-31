import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  OnDestroy,
  output,
  ViewChild,
} from '@angular/core';
import { Chart, DoughnutController, ArcElement } from 'chart.js';
import { FoodstuffSummary } from '../../../foodstuffs/interfaces/foodstuff-summary';
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
export class MacroChartComponent implements OnDestroy {
  recipeOrFoodstuff = input.required<Recipe | FoodstuffSummary>();
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
    effect(() => {
      const recipeOrFoodstuff = this.recipeOrFoodstuff();
      const legend = this.legend();
      const dataIncompleteOrInvalid = this.dataIncompleteOrInvalid();

      this.legendUpdated.emit(legend);
      this.updateChart(recipeOrFoodstuff, legend, dataIncompleteOrInvalid);
    });
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

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  private updateChart(
    recipeOrFoodstuff: Recipe | FoodstuffSummary,
    legend: Record<string, ChartLegendElement>,
    dataIncompleteOrInvalid: boolean
  ): void {
    const chart = this.chart;
    const dataSet = chart?.data.datasets[0];
    if (chart == null || dataSet == null) return;

    dataSet.data = this.getChartData(
      recipeOrFoodstuff,
      dataIncompleteOrInvalid
    );
    dataSet.backgroundColor = this.getChartColors(
      legend,
      dataIncompleteOrInvalid
    );
    chart.update();
  }

  private buildLegend = (
    recipeOrFoodstuff: Recipe | FoodstuffSummary
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
    recipeOrFoodstuff: Recipe | FoodstuffSummary,
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
            data: this.getChartData(
              recipeOrFoodstuff,
              dataIncompleteOrInvalid
            ),
            backgroundColor: this.getChartColors(
              legend,
              dataIncompleteOrInvalid
            ),
            borderWidth: 0,
          },
        ],
      },
    });
  }

  private getChartData(
    recipeOrFoodstuff: Recipe | FoodstuffSummary,
    dataIncompleteOrInvalid: boolean
  ): number[] {
    return dataIncompleteOrInvalid
      ? [PLACEHOLDER_VALUE]
      : [
          recipeOrFoodstuff.carbs ?? 0,
          recipeOrFoodstuff.protein ?? 0,
          recipeOrFoodstuff.fat ?? 0,
        ];
  }

  private getChartColors(
    legend: Record<string, ChartLegendElement>,
    dataIncompleteOrInvalid: boolean
  ): string[] {
    return dataIncompleteOrInvalid
      ? [legend['placeholder'].color]
      : [
          legend['carbs'].color,
          legend['protein'].color,
          legend['fat'].color,
        ];
  }

  private calculateValuePercentage(
    recipeOrFoodstuff: Recipe | FoodstuffSummary,
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
