import {
  Injectable,
  Signal,
  WritableSignal,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ShoppingListBackendService } from '../../services/shopping-list-backend.service';
import { ActiveCustomUserService } from '../../../services/active-custom-user.service';
import { SnackBarService } from '../../../services/snack-bar.service';
import { CustomUser } from '../../../interfaces/custom-user';
import { ShoppingList } from '../../interfaces/shopping-list';
import { forkJoin, take } from 'rxjs';
import { ShoppingListItemVerboseNames } from '../../interfaces/shopping-list-meta-data';

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  //#region service

  private readonly shoppingListBackendService = inject(
    ShoppingListBackendService
  );
  private readonly activeCustomUserService = inject(ActiveCustomUserService);
  private readonly snackBarService = inject(SnackBarService);

  //#endregion

  //#region fields

  private _shoppingList: WritableSignal<ShoppingList | null> = signal(null);
  private _shoppingListItemVerboseNames: WritableSignal<ShoppingListItemVerboseNames | null> =
    signal(null);

  private _isLoading: WritableSignal<boolean> = signal(false);
  private _hasError: WritableSignal<boolean> = signal(false);

  //#endregion

  constructor() {
    effect(() => {
      const activeCustomUser: CustomUser | null =
        this.activeCustomUserService.activeCustomUser();
      if (activeCustomUser == null) {
        this._shoppingList.set(null);
        return;
      }
      this.fetchShoppingList(activeCustomUser.id);
    });
  }

  //#region setters

  set shoppingList(shoppingList: ShoppingList) {
    this._shoppingList.set(shoppingList);
  }

  //#endregion

  //#region getters

  get shoppingList(): Signal<ShoppingList | null> {
    return this._shoppingList;
  }

  get shoppingListItemVerboseNames(): Signal<ShoppingListItemVerboseNames | null> {
    return this._shoppingListItemVerboseNames;
  }

  get isLoading(): Signal<boolean> {
    return this._isLoading;
  }

  get hasError(): Signal<boolean> {
    return this._hasError;
  }

  //#endregion

  //#region utilities

  private fetchShoppingList(customUserId: number): void {
    this._isLoading.set(true);
    this._hasError.set(false);

    forkJoin({
      shoppingList:
        this.shoppingListBackendService.getShoppingListByCustomUserId(
          customUserId
        ),
      shoppingListItemVerboseNames:
        this.shoppingListBackendService.fetchShoppingItemVerboseNames(),
    })
      .pipe(take(1))
      .subscribe({
        next: ({ shoppingList, shoppingListItemVerboseNames }) => {
          this._shoppingList.set(shoppingList);
          this._shoppingListItemVerboseNames.set(shoppingListItemVerboseNames);
          this._isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error fetching shopping list:', error);
          this.snackBarService.open(
            'Einkaufsliste konnte nicht geladen werden'
          );
          this._hasError.set(true);
          this._isLoading.set(false);
        },
      });
  }

  //#endregion
}
