import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Step } from '../../interfaces/step';
import { RecipeVersion } from '../../interfaces/recipe';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-steps-grid',
  imports: [CommonModule, MatCardModule],
  templateUrl: './steps-grid.component.html',
  styleUrl: './steps-grid.component.scss',
})
export class StepsGridComponent {
  recipeVersion = input.required<RecipeVersion>();

  stepsSorted = computed((): Step[] =>
    [...this.recipeVersion().steps].sort((a: Step, b: Step) => a.index - b.index)
  );
}
