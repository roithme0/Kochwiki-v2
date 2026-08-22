import {
  Component,
  WritableSignal,
  inject,
  input,
  signal,
} from '@angular/core';

import { ShoppingListBackendService } from '../../services/shopping-list-backend.service';
import { SnackBarService } from '../../../services/snack-bar.service';
import { ShoppingListItemIngredient } from '../../interfaces/shopping-list-item-ingredient';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs';

@Component({
  selector: 'app-shopping-list-table-checkbox',
  imports: [MatCheckboxModule, MatButtonModule, MatIconModule],
  templateUrl: './shopping-list-table-checkbox.component.html',
  styleUrl: './shopping-list-table-checkbox.component.css',
})
export class ShoppingListTableCheckboxComponent {
  itemIngredient = input.required<ShoppingListItemIngredient>();

  readonly shoppingListBackendService = inject(ShoppingListBackendService);
  readonly snackBarService = inject(SnackBarService);

  isChecked: WritableSignal<boolean> = signal(false);

  isLoading: WritableSignal<boolean> = signal(false);
  hasError: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    this.isChecked.set(this.itemIngredient().isChecked);
  }

  OnClick(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.shoppingListBackendService
      .setIsChecked(this.itemIngredient(), !this.isChecked())
      .pipe(take(1))
      .subscribe({
        next: (itemIngredient: ShoppingListItemIngredient) => {
          this.isChecked.set(itemIngredient.isChecked);
          this.isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error setting isChecked: ', error);
          this.snackBarService.open(
            'Haken konnte nicht gesetzt/entfernt werden'
          );
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }
}
