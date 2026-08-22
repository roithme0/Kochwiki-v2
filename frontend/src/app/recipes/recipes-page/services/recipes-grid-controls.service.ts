import { Injectable, Signal, WritableSignal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RecipesGridControlsService {
  private _searchBy: WritableSignal<string> = signal('');

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
