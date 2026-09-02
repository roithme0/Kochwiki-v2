import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RecipesGridControlsService } from '../services/recipes-grid-controls.service';
import { Router } from '@angular/router';
import { Recipe } from '../../interfaces/recipe';

@Component({
  selector: 'app-recipes-search',
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
  templateUrl: './recipes-search.component.html',
  styleUrl: './recipes-search.component.scss',
})
export class RecipesSearchComponent {
  readonly recipesGridControlsService = inject(RecipesGridControlsService);
  readonly router = inject(Router);
  readonly recipes = input<Recipe[]>([]);

  readonly nameOptionsGroupLabel: string = 'Namen';
  readonly originOptionsGroupLabel: string = 'Ersteller*innen';

  namesMap = computed(
    (): Map<string, string> =>
      this.recipes().reduce((acc, recipe) => {
        acc.set(recipe.id.toString(), recipe.name);
        return acc;
      }, new Map<string, string>())
  );
  origins = computed((): string[] =>
    this.recipes()
      .map((recipe) => recipe.originName || '')
      .filter((origin) => origin != '')
  );
  filteredNamesMap = computed(
    (): Map<string, string> =>
      new Map(
        [...this.namesMap()].filter(([id, name]) =>
          name
            .toLowerCase()
            .includes(this.recipesGridControlsService.searchBy().toLowerCase())
        )
      )
  );
  filteredOrigins = computed(
    (): Set<string> =>
      new Set(
        this.origins().filter((origin) =>
          origin
            .toLowerCase()
            .includes(this.recipesGridControlsService.searchBy().toLowerCase())
        )
      )
  );

  //#region Event Handlers

  onSeachValueChanged(newSearchValue: string): void {
    this.recipesGridControlsService.searchBy = newSearchValue;
  }

  onSearchOptionSelected(event: MatAutocompleteSelectedEvent): void {
    if (event.option.group?.label === this.nameOptionsGroupLabel) {
      this.router.navigate(['/recipes/', event.option.value]);
    }
  }

  //#endregion
}
