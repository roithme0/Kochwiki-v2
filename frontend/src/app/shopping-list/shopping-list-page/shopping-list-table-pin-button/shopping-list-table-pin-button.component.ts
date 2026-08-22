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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs';

@Component({
  selector: 'app-shopping-list-table-pin-button',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './shopping-list-table-pin-button.component.html',
  styleUrl: './shopping-list-table-pin-button.component.css',
})
export class ShoppingListTablePinButtonComponent {
  itemIngredient = input.required<ShoppingListItemIngredient>();

  readonly shoppingListBackendService = inject(ShoppingListBackendService);
  readonly snackBarService = inject(SnackBarService);

  isPinned: WritableSignal<boolean> = signal(false);

  isLoading: WritableSignal<boolean> = signal(false);
  hasError: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    this.isPinned.set(this.itemIngredient().isPinned);
  }

  OnClick(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.shoppingListBackendService
      .setIsPinned(this.itemIngredient(), !this.isPinned())
      .pipe(take(1))
      .subscribe({
        next: (itemIngredient: ShoppingListItemIngredient) => {
          this.isPinned.set(itemIngredient.isPinned);
          this.isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error setting isPinned: ', error);
          this.snackBarService.open('Pin konnte nicht gesetzt/entfernt werden');
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }
}
