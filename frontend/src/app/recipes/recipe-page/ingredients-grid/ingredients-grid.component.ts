import {
  Component,
  WritableSignal,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../interfaces/recipe';
import { IngredientsGridShoppingListButtonComponent } from '../ingredients-grid-shopping-list-button/ingredients-grid-shopping-list-button.component';
import { FoodstuffBackendService } from '../../../foodstuffs/services/foodstuff-backend.service';
import { SnackBarService } from '../../../services/snack-bar.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { forkJoin, take } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MacroChartComponent } from '../../../core/components/macro-chart/macro-chart.component';

@Component({
  selector: 'app-ingredients-grid',
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    IngredientsGridShoppingListButtonComponent,
    MacroChartComponent,
  ],
  templateUrl: './ingredients-grid.component.html',
  styleUrl: './ingredients-grid.component.scss',
})
export class IngredientsGridComponent {
  recipe = input.required<Recipe>();

  readonly foodstuffBackendService = inject(FoodstuffBackendService);
  readonly snackBarService = inject(SnackBarService);

  isLoading: WritableSignal<boolean> = signal(false);
  hasError: WritableSignal<boolean> = signal(false);

  readonly environmentName: string = environment.name;

  ngOnChanges(): void {
    this.fetchAssociatedFoodstuffs();
  }

  fetchAssociatedFoodstuffs() {
    this.hasError.set(false);
    this.isLoading.set(true);

    const requests = this.recipe().ingredients.map((ingredient) =>
      this.foodstuffBackendService.getFoodstuffById(ingredient.foodstuff.id)
    );

    if (requests.length === 0) {
      this.isLoading.set(false);
      return;
    }

    forkJoin(requests)
      .pipe(take(1))
      .subscribe({
        next: (foodstuffs) => {
          for (let i = 0; i < foodstuffs.length; i++) {
            this.recipe().ingredients[i].foodstuff = foodstuffs[i];
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('failed to fetch foodstuffs: ', error);
          this.snackBarService.open('Zutaten konnten nicht geladen werden');
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }
}
