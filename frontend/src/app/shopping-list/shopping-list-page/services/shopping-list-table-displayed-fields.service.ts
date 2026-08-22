import { Injectable, inject, computed } from '@angular/core';
import { WindowWidthService } from '../../../services/window-width.service';

@Injectable({
  providedIn: 'root',
})
export class ShoppingListTableDisplayedFieldsService {
  private readonly windowWidthService = inject(WindowWidthService);

  displayedFields = computed((): string[] => {
    const windowInnerWidth: number =
      this.windowWidthService.getWindowInnerWidth()();
    const displayedFields: string[] = ['isChecked', 'name', 'amount'];
    if (windowInnerWidth > 600) {
      displayedFields.push('brand');
    }
    if (windowInnerWidth > 800) {
      displayedFields.push('recipeName');
    }
    displayedFields.push('isPinned');
    return displayedFields;
  });
}
