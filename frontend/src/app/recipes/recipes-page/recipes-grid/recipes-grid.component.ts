import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RecipesGridElementComponent } from '../recipes-grid-element/recipes-grid-element.component';
import { WindowWidthService } from '../../../services/window-width.service';
import { RecipesGridControlsService } from '../services/recipes-grid-controls.service';
import { Recipe } from '../../interfaces/recipe';

@Component({
  selector: 'app-recipes-grid',
  imports: [
    CommonModule,
    RecipesGridElementComponent,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './recipes-grid.component.html',
  styleUrl: './recipes-grid.component.scss',
})
export class RecipesGridComponent {
  readonly windowWidthService = inject(WindowWidthService);
  readonly router = inject(Router);
  readonly recipesGridControlsService = inject(RecipesGridControlsService);
  readonly recipes = input<Recipe[]>([]);

  displayedRecipes = computed((): Recipe[] => {
    let displayedRecipes = this.recipes();
    displayedRecipes = this.filterRecipesByNameOrOrigin(displayedRecipes);
    displayedRecipes = this.sortRecipes('name', displayedRecipes);
    return displayedRecipes;
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

  filterRecipesByNameOrOrigin(recipes: Recipe[]): Recipe[] {
    const searchBy = this.recipesGridControlsService.searchBy();
    return searchBy === ''
      ? recipes
      : recipes.filter(
          (recipe) =>
            recipe.name.toLowerCase().includes(searchBy.toLowerCase()) ||
            recipe.originName?.toLowerCase().includes(searchBy.toLowerCase())
        );
  }

  sortRecipes = (sortBy: string, recipes: Recipe[]): Recipe[] =>
    [...recipes].sort((a, b) =>
      sortBy === 'name' ? a.name.localeCompare(b.name) : 0
    );
}
