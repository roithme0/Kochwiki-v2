import {
  Injectable,
  Signal,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { forkJoin, take } from 'rxjs';
import { SnackBarService } from '../../services/snack-bar.service';
import {
  FoodstuffUnitChoices,
  FoodstuffVerboseNames,
} from '../interfaces/foodstuff-meta-data';
import { FoodstuffBackendService } from './foodstuff-backend.service';

@Injectable({ providedIn: 'root' })
export class FoodstuffMetadataService {
  private readonly foodstuffBackendService = inject(FoodstuffBackendService);
  private readonly snackBarService = inject(SnackBarService);

  private readonly _verboseNames: WritableSignal<FoodstuffVerboseNames | null> =
    signal(null);
  private readonly _unitChoices: WritableSignal<FoodstuffUnitChoices | null> =
    signal(null);

  constructor() {
    this.fetchMetadata();
  }

  get verboseNames(): Signal<FoodstuffVerboseNames | null> {
    return this._verboseNames;
  }

  get unitChoices(): Signal<FoodstuffUnitChoices | null> {
    return this._unitChoices;
  }

  private fetchMetadata(): void {
    forkJoin({
      verboseNames: this.foodstuffBackendService.fetchFoodstuffVerboseNames(),
      unitChoices: this.foodstuffBackendService.fetchFoodstuffUnitChoices(),
    })
      .pipe(take(1))
      .subscribe({
        next: ({ verboseNames, unitChoices }) => {
          this._verboseNames.set(verboseNames);
          this._unitChoices.set(unitChoices);
        },
        error: (error: unknown) => {
          console.error('failed to fetch foodstuff metadata: ', error);
          this.snackBarService.open(
            'Metadaten für Lebensmittel konnten nicht geladen werden'
          );
        },
      });
  }
}
