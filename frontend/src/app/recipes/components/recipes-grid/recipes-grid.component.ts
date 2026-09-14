import { Component, computed, inject, input } from '@angular/core';

import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RecipesGridElementComponent } from '../recipes-grid-element/recipes-grid-element.component';
import { WindowWidthService } from '../../../core/services/window-width.service';
import { RecipesGridControlsService } from '../../services/recipes-grid-controls.service';
import { RecipeVersion } from '../../models/recipe';

@Component({
  selector: 'app-recipes-grid',
  imports: [
    RecipesGridElementComponent,
    MatIconModule,
    MatButtonModule,
    RouterLink
],
  templateUrl: './recipes-grid.component.html',
  styleUrl: './recipes-grid.component.scss',
})
export class RecipesGridComponent {
  readonly windowWidthService = inject(WindowWidthService);
  readonly recipesGridControlsService = inject(RecipesGridControlsService);
  readonly recipeVersions = input<RecipeVersion[]>([]);

  displayedRecipeVersions = computed((): RecipeVersion[] => {
    let recipeVersions = this.recipeVersions();
    recipeVersions = this.filterRecipeVersionsByNameOrOrigin(recipeVersions);
    recipeVersions = this.sortRecipeVersions(recipeVersions);
    return recipeVersions;
  });

  displayedColumns = computed((): number => {
    const windowInnerWidth: number =
      this.windowWidthService.getWindowInnerWidth()();
    if (windowInnerWidth < 600) {
      return 2;
    } else if (windowInnerWidth < 900) {
      return 3;
    } else {
      return 4;
    }
  });

  filterRecipeVersionsByNameOrOrigin(recipeVersions: RecipeVersion[]): RecipeVersion[] {
    const searchBy = this.recipesGridControlsService.searchBy();
    return searchBy === ''
      ? recipeVersions
      : recipeVersions.filter(
          (recipeVersion) =>
            recipeVersion.name.toLowerCase().includes(searchBy.toLowerCase()) ||
            recipeVersion.originName?.toLowerCase().includes(searchBy.toLowerCase())
        );
  }

  sortRecipeVersions(recipeVersions: RecipeVersion[]): RecipeVersion[] {
    return [...recipeVersions].sort((a, b) => {
      const modifiedOrder = Date.parse(b.lastModified) - Date.parse(a.lastModified);
      return modifiedOrder !== 0 ? modifiedOrder : b.recipeVersionId.localeCompare(a.recipeVersionId);
    });
  }

  recipeVersionLink(recipeVersion: RecipeVersion): string[] {
    return recipeVersion.state === 'active'
      ? ['/recipes', recipeVersion.recipeLineageId]
      : ['/recipes', recipeVersion.recipeLineageId, 'versions', recipeVersion.recipeVersionId];
  }
}
