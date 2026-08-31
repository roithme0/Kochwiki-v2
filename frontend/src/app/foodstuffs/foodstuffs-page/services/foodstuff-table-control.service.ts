import {
  Injectable,
  Signal,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Foodstuff } from '../../interfaces/foodstuff';
import { FoodstuffsService } from './foodstuffs.service';

export const DEFAULT_SEARCH_BY: string = '';

@Injectable({
  providedIn: 'root',
})
export class FoodstuffTableControlService {
  private readonly foodstuffsService = inject(FoodstuffsService);

  private _searchBy: WritableSignal<string> = signal(DEFAULT_SEARCH_BY);

  foodstuffs = computed((): Foodstuff[] =>
    [...this.foodstuffsService.foodstuffs()]
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      )
  );

  set searchBy(value: string) {
    this._searchBy.set(value);
  }

  get searchBy(): Signal<string> {
    return this._searchBy;
  }

  clearSearch(): void {
    this.searchBy = '';
  }
}
