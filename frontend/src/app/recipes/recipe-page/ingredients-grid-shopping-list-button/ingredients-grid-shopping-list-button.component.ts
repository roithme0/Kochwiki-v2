import {
  Component,
  WritableSignal,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActiveCustomUserService } from '../../../services/active-custom-user.service';
import { ShoppingListBackendService } from '../../../shopping-list/services/shopping-list-backend.service';
import { SnackBarService } from '../../../services/snack-bar.service';
import { Ingredient } from '../../interfaces/ingredient';
import { CustomUser } from '../../../interfaces/custom-user';
import { ShoppingListItemIngredient } from '../../../shopping-list/interfaces/shopping-list-item-ingredient';
import { ShoppingList } from '../../../shopping-list/interfaces/shopping-list';
import { take } from 'rxjs';

@Component({
  selector: 'app-ingredients-grid-shopping-list-button',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './ingredients-grid-shopping-list-button.component.html',
  styleUrl: './ingredients-grid-shopping-list-button.component.scss',
})
export class IngredientsGridShoppingListButtonComponent {
  ingredient = input.required<Ingredient>();
  servings = input.required<number>();

  readonly activeCustomUserService = inject(ActiveCustomUserService);
  readonly shoppingListBackendService = inject(ShoppingListBackendService);
  readonly snackBarService = inject(SnackBarService);

  isAddedToShoppingList: WritableSignal<boolean> = signal(false);
  isLoading: WritableSignal<boolean> = signal(false);
  hasError: WritableSignal<boolean> = signal(false);

  ngOnInit() {
    this.setIsAddedToShoppingList();
  }

  //#region methods

  OnAddToShoppingList() {
    this.hasError.set(false);
    this.isLoading.set(true);

    this.shoppingListBackendService
      .addIngredient(this.ingredient(), this.servings())
      .pipe(take(1))
      .subscribe({
        next: (shoppingList: ShoppingList) => {
          this.isAddedToShoppingList.set(true);
          this.isLoading.set(false);
          this.snackBarService.open(
            this.ingredient().name + ' wurde der Einkaufsliste hinzugefügt.'
          );
        },
        error: (error: any) => {
          console.error('Error adding ingredient to shopping list:', error);
          this.hasError.set(true);
          this.isLoading.set(false);
          this.snackBarService.open(
            'Fehler beim Hinzufügen von ' +
              this.ingredient().name +
              ' zur Einkaufsliste.'
          );
        },
      });
  }

  OnRemoveFromShoppingList() {
    this.hasError.set(false);
    this.isLoading.set(true);

    this.shoppingListBackendService
      .removeIngredient(this.ingredient())
      .pipe(take(1))
      .subscribe({
        next: (shoppingList: ShoppingList) => {
          this.isAddedToShoppingList.set(false);
          this.isLoading.set(false);
          this.snackBarService.open(
            this.ingredient().name + ' wurde von der Einkaufsliste entfernt.'
          );
        },
        error: (error: any) => {
          console.error('Error removing ingredient from shopping list:', error);
          this.hasError.set(true);
          this.isLoading.set(false);
          this.snackBarService.open(
            'Fehler beim Entfernen von ' +
              this.ingredient().name +
              ' von der Einkaufsliste.'
          );
        },
      });
  }

  //#endregion

  //#region utilities

  setIsAddedToShoppingList(): void {
    const activeCustomUser: CustomUser | null =
      this.activeCustomUserService.activeCustomUser();

    // should never be null
    if (activeCustomUser === null) {
      return;
    }

    let shoppingListItemIngredient: ShoppingListItemIngredient | undefined;
    this.ingredient().shoppingListItemIngredients.forEach((item) => {
      if (item.shoppingListId === activeCustomUser.id) {
        shoppingListItemIngredient = item;
      }
    });

    if (shoppingListItemIngredient === undefined) {
      this.isAddedToShoppingList.set(false);
      return;
    }
    this.isAddedToShoppingList.set(true);
  }

  //#endregion
}
