import { Injectable, inject, computed } from '@angular/core';
import { WindowWidthService } from '../../../services/window-width.service';

@Injectable({
  providedIn: 'root',
})
export class FoodstuffTableDisplayedFieldsService {
  private readonly windowWidthService = inject(WindowWidthService);

  displayedFields = computed((): string[] => {
    const windowInnerWidth = this.windowWidthService.getWindowInnerWidth()();
    const displayedFields: string[] = ['chart', 'name'];
    if (windowInnerWidth > 500) {
      displayedFields.push('brand');
    }
    if (windowInnerWidth > 700) {
      displayedFields.push('kcal');
    }
    if (windowInnerWidth > 1100) {
      displayedFields.push('carbs', 'protein', 'fat');
    }
    if (windowInnerWidth > 1200) {
      displayedFields.push('unitVerbose');
    }
    displayedFields.push('edit', 'delete');
    return displayedFields;
  });
}
