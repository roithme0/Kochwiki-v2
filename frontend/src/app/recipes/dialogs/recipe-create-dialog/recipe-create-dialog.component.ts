import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackBarService } from '../../../services/snack-bar.service';
import { DialogHeaderComponent } from '../../../core/components/dialog-header/dialog-header.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { RecipeIngredientsFormComponent } from '../forms/recipe-ingredients-form/recipe-ingredients-form.component';
import { RecipeMetaFormComponent } from '../forms/recipe-meta-form/recipe-meta-form.component';
import { RecipePreparationFormComponent } from '../forms/recipe-preparation-form/recipe-preparation-form.component';
import { takeUntil, take } from 'rxjs';
import { Foodstuff } from '../../../foodstuffs/interfaces/foodstuff';
import { FoodstuffBackendService } from '../../../foodstuffs/services/foodstuff-backend.service';
import { Recipe } from '../../interfaces/recipe';
import { RecipeBackendService } from '../../services/recipe-backend.service';
import { Unsubscribe } from '../../../utils/unsubsribe';
import { Router } from '@angular/router';
@Component({
  selector: 'app-recipe-create-dialog',
  imports: [
    CommonModule,
    DialogHeaderComponent,
    MatDialogModule,
    RecipeMetaFormComponent,
    RecipeIngredientsFormComponent,
    RecipePreparationFormComponent,
    ReactiveFormsModule,
    MatExpansionModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatStepperModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './recipe-create-dialog.component.html',
  styleUrl: './recipe-create-dialog.component.scss',
})
export class RecipeCreateDialogComponent extends Unsubscribe {
  readonly router = inject(Router);
  readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef);
  readonly foodstuffBackendService = inject(FoodstuffBackendService);
  readonly recipeBackendService = inject(RecipeBackendService);
  readonly snackBarService = inject(SnackBarService);

  foodstuffs: Foodstuff[] = [];

  isLoading: WritableSignal<boolean> = signal(true);
  hasError: WritableSignal<boolean> = signal(false);

  recipeForm = this.fb.group({
    metaFormGroup: this.fb.group({
      name: ['', Validators.required],
      originName: [''],
      originUrl: [''],
    }),
    ingredientsFormGroup: this.fb.group({
      servings: [2, Validators.required],
      ingredients: this.fb.array([]),
    }),
    preparationFormGroup: this.fb.group({
      preptime: [<number | null>null],
      steps: this.fb.array([]),
    }),
  });

  constructor() {
    super();

    this.keepFoodstuffsUpToDate();
    this.fetchFoodstuffs();
  }

  private keepFoodstuffsUpToDate(): void {
    this.foodstuffBackendService.foodstuffsChanged$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.fetchFoodstuffs());
  }

  fetchFoodstuffs(): void {
    this.foodstuffBackendService
      .getAllFoodstuffs()
      .pipe(take(1))
      .subscribe({
        next: (foodstuffs) => {
          this.foodstuffs = [...foodstuffs].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
          );
          this.isLoading.set(false);
          this.hasError.set(false);
        },
        error: (error) => {
          console.error('failed to fetch foodstuffs: ', error);
          this.snackBarService.open('Zutaten konnten nicht geladen werden');
          this.isLoading.set(false);
          this.hasError.set(true);
        },
      });
  }

  onSubmit(): void {
    const formValue = this.recipeForm.value;
    const recipe: Partial<Recipe> = {
      ...formValue.metaFormGroup,
      ...formValue.ingredientsFormGroup,
      ...formValue.preparationFormGroup,
    } as Recipe;
    this.recipeBackendService
      .postRecipe(recipe)
      .pipe(take(1))
      .subscribe({
        next: (recipe) => {
          this.recipeBackendService.notifyRecipesChanged();
          this.dialogRef.close();
          this.router.navigate(['recipes/', recipe.id]);
          this.snackBarService.open('Rezept erstellt');
        },
        error: (error) => {
          console.error('failed to create recipe: ', error);
          this.snackBarService.open('Rezept konnte nicht erstellt werden');
        },
      });
  }
}
