import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FoodstuffTableControlService } from '../services/foodstuff-table-control.service';
import { FoodstuffsService } from '../services/foodstuffs.service';

@Component({
  selector: 'app-foodstuffs-search',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './foodstuffs-search.component.html',
  styleUrl: './foodstuffs-search.component.scss',
})
export class FoodstuffsSearchComponent {
  readonly foodstuffTableControlsService = inject(FoodstuffTableControlService);
  readonly foodstuffsService = inject(FoodstuffsService);

  names = computed((): string[] =>
    this.foodstuffTableControlsService
      .foodstuffs()
      .map((foodstuff) => foodstuff.name)
  );
  brands = computed((): string[] =>
    this.foodstuffTableControlsService
      .foodstuffs()
      .map((foodstuff) => foodstuff.brand || '')
      .filter((brand) => brand !== '')
  );
  filteredNames = computed(
    (): Set<string> =>
      new Set(
        this.names().filter((name) =>
          name
            .toLowerCase()
            .includes(
              this.foodstuffTableControlsService.searchBy().toLowerCase()
            )
        )
      )
  );
  filteredBrands = computed(
    (): Set<string> =>
      new Set(
        this.brands().filter((brand) =>
          brand
            .toLowerCase()
            .includes(
              this.foodstuffTableControlsService.searchBy().toLowerCase()
            )
        )
      )
  );

  onSeachValueChanged(newSearchValue: string): void {
    this.foodstuffTableControlsService.searchBy = newSearchValue;
  }
}
