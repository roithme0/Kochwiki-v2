import { Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Recipe } from '../interfaces/recipe';
import { RecipeBackendService } from '../services/recipe-backend.service';
import { PageHeaderService } from '../../services/page-header.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { IngredientsGridComponent } from './ingredients-grid/ingredients-grid.component';
import { StepsGridComponent } from './steps-grid/steps-grid.component';
import { RecipeMacroChartCardComponent } from './recipe-macro-chart-card/recipe-macro-chart-card.component';
import { RecipePatchDialogComponent } from '../dialogs/recipe-patch-dialog/recipe-patch-dialog.component';
import { RecipeDeleteDialogComponent } from '../dialogs/recipe-delete-dialog/recipe-delete-dialog.component';
import { take } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-recipe-page',
  imports: [
    CommonModule,
    IngredientsGridComponent,
    StepsGridComponent,
    RecipeMacroChartCardComponent,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinner,
  ],
  templateUrl: './recipe-page.component.html',
  styleUrl: './recipe-page.component.scss',
})
export class RecipePageComponent {
  private readonly destroyRef = inject(DestroyRef);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly pageHeaderService = inject(PageHeaderService);
  readonly recipeBackendService = inject(RecipeBackendService);
  readonly snackBarService = inject(SnackBarService);
  readonly dialog = inject(MatDialog);

  id: number | undefined;
  recipe: Recipe | undefined;
  recipeIsLoading: WritableSignal<boolean> = signal(true);

  constructor() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.keepRecipeUpToDate(this.id);
    this.fetchRecipe(this.id);
  }

  ngOnInit(): void {
    this.pageHeaderService.updateHeader(true, '', 'recipes', true);
  }

  keepRecipeUpToDate(id: number | undefined): void {
    this.recipeBackendService.recipesChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.fetchRecipe(id));
  }

  fetchRecipe(id: number | undefined): void {
    if (id === undefined) {
      console.error('no recipe id provided');
      return;
    }

    this.recipeIsLoading.set(true);
    this.recipeBackendService
      .getRecipeById(id)
      .pipe(take(1))
      .subscribe({
        next: (recipe: Recipe) => {
          this.recipe = recipe;
          this.pageHeaderService.headline = this.recipe.name;
          this.recipeIsLoading.set(false);
        },
        error: (error: unknown) => {
          console.error('failed to fetch recipe: ', error);
          this.snackBarService.open('Rezept konnte nicht geladen werden');
          this.pageHeaderService.headline = 'Fehler';
          this.recipeIsLoading.set(false);
        },
      });
  }

  openPatchRecipeDialog(): void {
    this.dialog.open(RecipePatchDialogComponent, {
      data: { id: this.id },
      minWidth: 'calc(100vw - 1rem)',
      maxWidth: 'calc(100vw - 1rem)',
      maxHeight: 'calc(100vh - 1rem)',
      position: { top: '0.5rem', left: '0.5rem' },
      autoFocus: false,
      disableClose: true,
    });
  }

  openDeleteRecipeDialog(): void {
    this.dialog.open(RecipeDeleteDialogComponent, {
      data: { id: this.id },
      maxWidth: '95vw',
      maxHeight: '95vh',
      autoFocus: false,
    });
  }
}
