import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import {
  FoodstuffUnitChoices,
  FoodstuffVerboseNames,
} from '../interfaces/foodstuff-meta-data';
import { FoodstuffBackendService } from './foodstuff-backend.service';

export interface FoodstuffMetadata {
  verboseNames: FoodstuffVerboseNames;
  unitChoices: FoodstuffUnitChoices;
}

@Injectable({ providedIn: 'root' })
export class FoodstuffMetadataService {
  private readonly foodstuffBackendService = inject(FoodstuffBackendService);

  load(): Observable<FoodstuffMetadata> {
    return forkJoin({
      verboseNames: this.foodstuffBackendService.fetchFoodstuffVerboseNames(),
      unitChoices: this.foodstuffBackendService.fetchFoodstuffUnitChoices(),
    });
  }
}
