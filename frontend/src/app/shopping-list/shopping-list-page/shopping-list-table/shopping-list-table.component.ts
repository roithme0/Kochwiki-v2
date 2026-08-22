import { Component, Signal, computed, inject, input } from '@angular/core';
import { ShoppingList } from '../../interfaces/shopping-list';
import { ShoppingListItemIngredient } from '../../interfaces/shopping-list-item-ingredient';
import { ShoppingListItemVerboseNames } from '../../interfaces/shopping-list-meta-data';
import { ShoppingListTableDisplayedFieldsService } from '../services/shopping-list-table-displayed-fields.service';
import { ShoppingListBackendService } from '../../services/shopping-list-backend.service';
import { ShoppingListTableCheckboxComponent } from '../shopping-list-table-checkbox/shopping-list-table-checkbox.component';
import { ShoppingListTablePinButtonComponent } from '../shopping-list-table-pin-button/shopping-list-table-pin-button.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-shopping-list-table',
  imports: [
    ShoppingListTableCheckboxComponent,
    ShoppingListTablePinButtonComponent,
    MatTableModule,
    MatCheckboxModule,
  ],
  templateUrl: './shopping-list-table.component.html',
  styleUrl: './shopping-list-table.component.css',
})
export class ShoppingListTableComponent {
  shoppingList = input.required<ShoppingList | null>();
  shoppingListItemVerboseNames =
    input.required<ShoppingListItemVerboseNames | null>();

  readonly shoppingListBackendService = inject(ShoppingListBackendService);
  readonly displayedFieldsService = inject(
    ShoppingListTableDisplayedFieldsService
  );

  displayedItemIngredients: Signal<ShoppingListItemIngredient[]> = computed(
    () => {
      const shoppingList: ShoppingList | null = this.shoppingList();
      return shoppingList == null
        ? []
        : shoppingList.shoppingListItemIngredients;
    }
  );
  displayedVerboseNames = computed((): ShoppingListItemVerboseNames => {
    const shoppingListItemVerboseNames: ShoppingListItemVerboseNames | null =
      this.shoppingListItemVerboseNames();
    return shoppingListItemVerboseNames == null
      ? {
          name: 'Name',
          amount: 'Menge',
          unitVerbose: 'Einheit',
          brand: 'Marke',
          recipeName: 'Rezept',
        }
      : shoppingListItemVerboseNames;
  });

  allItemIngredientsIsChecked = computed((): boolean =>
    this.displayedItemIngredients().every(
      (itemIngredient) => itemIngredient.isChecked
    )
  );
}
