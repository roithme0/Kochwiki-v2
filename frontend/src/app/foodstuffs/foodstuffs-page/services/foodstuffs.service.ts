import {
  Injectable,
  Signal,
  WritableSignal,
  signal,
  inject,
} from '@angular/core';
import { Foodstuff } from '../../interfaces/foodstuff';
import {
  FoodstuffUnitChoices,
  FoodstuffVerboseNames,
} from '../../interfaces/foodstuff-meta-data';
import { FoodstuffBackendService } from '../../services/foodstuff-backend.service';
import { SnackBarService } from '../../../services/snack-bar.service';
import { forkJoin, take, takeUntil } from 'rxjs';
import { Unsubscribe } from '../../../utils/unsubsribe';
import { RecipeBackendService } from '../../../recipes/services/recipe-backend.service';

@Injectable({
  providedIn: 'root',
})
export class FoodstuffsService extends Unsubscribe {
  private readonly snackBarService = inject(SnackBarService);
  private readonly foodstuffBackendService = inject(FoodstuffBackendService);
  private readonly recipesBackendService = inject(RecipeBackendService);

  private _foodstuffs: WritableSignal<Foodstuff[]> = signal([]);
  private _verboseNames: WritableSignal<FoodstuffVerboseNames | null> =
    signal(null);
  private _unitChoices: WritableSignal<FoodstuffUnitChoices | null> =
    signal(null);

  private _isLoading: WritableSignal<boolean> = signal(true);
  private _hasError: WritableSignal<boolean> = signal(false);

  constructor() {
    super();

    this.keepFoodstuffsUpToDate();
    this.fetchFoodstuffs();
  }

  get isLoading(): Signal<boolean> {
    return this._isLoading;
  }

  get hasError(): Signal<boolean> {
    return this._hasError;
  }

  get foodstuffs(): Signal<Foodstuff[]> {
    return this._foodstuffs;
  }

  get verboseNames(): Signal<FoodstuffVerboseNames | null> {
    return this._verboseNames;
  }

  get unitChoices(): Signal<FoodstuffUnitChoices | null> {
    return this._unitChoices;
  }

  private keepFoodstuffsUpToDate(): void {
    this.foodstuffBackendService.foodstuffsChanged$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.fetchFoodstuffs());

    this.recipesBackendService.recipesChanged$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.fetchFoodstuffs());
  }

  private fetchFoodstuffs(): void {
    this._isLoading.set(true);
    this._hasError.set(false);

    const requests = forkJoin({
      foodstuffs: this.foodstuffBackendService.getAllFoodstuffs(),
      verboseNames: this.foodstuffBackendService.fetchFoodstuffVerboseNames(),
      unitChoices: this.foodstuffBackendService.fetchFoodstuffUnitChoices(),
    });

    requests.pipe(take(1)).subscribe({
      next: ({ foodstuffs, verboseNames, unitChoices }) => {
        this._foodstuffs.set(foodstuffs);
        this._verboseNames.set(verboseNames);
        this._unitChoices.set(unitChoices);
        this._isLoading.set(false);
      },
      error: (error) => {
        console.error(
          'failed to fetch foodstuffs, verbose names or unit choices: ',
          error
        );
        this.snackBarService.open('Zutaten konnten nicht geladen werden');
        this._hasError.set(true);
        this._isLoading.set(false);
      },
    });
  }
}
