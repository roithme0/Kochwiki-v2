import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { take } from 'rxjs';
import { PageHeaderService } from '../../services/page-header.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { LoadState } from '../../utils/load-state';
import { RecipeCreateDialogComponent } from '../dialogs/recipe-create-dialog/recipe-create-dialog.component';
import { Recipe } from '../interfaces/recipe';
import { RecipeBackendService } from '../services/recipe-backend.service';
import { RecipesGridComponent } from './recipes-grid/recipes-grid.component';
import { RecipesSearchComponent } from './recipes-search/recipes-search.component';

@Component({
  selector: 'app-recipes-page',
  imports: [
    CommonModule,
    RecipesGridComponent,
    RecipesSearchComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './recipes-page.component.html',
  styleUrl: './recipes-page.component.scss',
})
export class RecipesPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly recipeBackendService = inject(RecipeBackendService);
  private readonly snackBarService = inject(SnackBarService);
  readonly dialog = inject(MatDialog);
  readonly pageHeaderService = inject(PageHeaderService);

  readonly showSearch = signal(false);
  readonly recipesState = signal<LoadState<Recipe[]>>({
    status: 'loading',
    data: [],
  });

  ngOnInit(): void {
    this.pageHeaderService.updateHeader(true, 'Rezepte', '', true);
    this.recipeBackendService.recipesChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.fetchRecipes());
    this.fetchRecipes();
  }

  openCreateRecipeDialog(): void {
    this.dialog.open(RecipeCreateDialogComponent, {
      minWidth: 'calc(100vw - 1rem)',
      maxWidth: 'calc(100vw - 1rem)',
      maxHeight: 'calc(100vh - 1rem)',
      position: { top: '0.5rem', left: '0.5rem' },
      autoFocus: false,
      disableClose: true,
    });
  }

  private fetchRecipes(): void {
    this.recipesState.update(({ data }) => ({ status: 'loading', data }));
    this.recipeBackendService
      .getAllRecipes()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (recipes) => {
          this.recipesState.set({ status: 'success', data: recipes });
        },
        error: (error: unknown) => {
          console.error('failed to fetch recipes: ', error);
          this.snackBarService.open('Rezepte konnten nicht geladen werden');
          this.recipesState.update(({ data }) => ({ status: 'error', data }));
        },
      });
  }
}
