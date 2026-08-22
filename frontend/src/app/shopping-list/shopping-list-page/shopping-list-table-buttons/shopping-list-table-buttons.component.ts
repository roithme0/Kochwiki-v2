import { Component, WritableSignal, inject, signal } from '@angular/core';
import { ShoppingListBackendService } from '../../services/shopping-list-backend.service';
import { ShoppingListService } from '../services/shopping-list.service';
import { ActiveCustomUserService } from '../../../services/active-custom-user.service';
import { SnackBarService } from '../../../services/snack-bar.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomUser } from '../../../interfaces/custom-user';
import { take } from 'rxjs';

@Component({
  selector: 'app-shopping-list-table-buttons',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './shopping-list-table-buttons.component.html',
  styleUrl: './shopping-list-table-buttons.component.css',
})
export class ShoppingListTableButtonsComponent {
  readonly shoppingListBackendService = inject(ShoppingListBackendService);
  readonly shoppingListService = inject(ShoppingListService);
  readonly activeCustomUserService = inject(ActiveCustomUserService);
  readonly snackBarService = inject(SnackBarService);

  isLoading: WritableSignal<boolean> = signal(false);
  hasError: WritableSignal<boolean> = signal(false);

  OnClearCheckedClicked() {
    this.isLoading.set(true);
    this.hasError.set(false);

    const activeCustomUser: CustomUser | null =
      this.activeCustomUserService.activeCustomUser();
    if (activeCustomUser === null) {
      console.error('No active custom user found.');
      return;
    }

    this.shoppingListBackendService
      .clearChecked()
      .pipe(take(1))
      .subscribe({
        next: (shoppingList) => {
          this.shoppingListService.shoppingList = shoppingList;
          this.snackBarService.open('Abgehakte Artikel gelöscht');
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error clearing shopping list:', error);
          this.snackBarService.open('Artikel konnten nicht gelöscht werden');
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }
}
