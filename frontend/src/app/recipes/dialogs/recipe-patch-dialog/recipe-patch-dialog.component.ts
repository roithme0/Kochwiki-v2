import {
  Component,
  Inject,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackBarService } from '../../../services/snack-bar.service';
import { DialogHeaderComponent } from '../../../core/components/dialog-header/dialog-header.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { takeUntil, take } from 'rxjs';
import { Foodstuff } from '../../../foodstuffs/interfaces/foodstuff';
import { FoodstuffBackendService } from '../../../foodstuffs/services/foodstuff-backend.service';
import { Recipe } from '../../interfaces/recipe';
import { RecipeBackendService } from '../../services/recipe-backend.service';
import { RecipeIngredientsFormComponent } from '../forms/recipe-ingredients-form/recipe-ingredients-form.component';
import { RecipeMetaFormComponent } from '../forms/recipe-meta-form/recipe-meta-form.component';
import { RecipePreparationFormComponent } from '../forms/recipe-preparation-form/recipe-preparation-form.component';
import { Unsubscribe } from '../../../utils/unsubsribe';

@Component({
  selector: 'app-recipe-patch-dialog',
  imports: [
    CommonModule,
    DialogHeaderComponent,
    MatDialogModule,
    RecipeMetaFormComponent,
    RecipeIngredientsFormComponent,
    RecipePreparationFormComponent,
    ReactiveFormsModule,
    MatButtonModule,
    FormsModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatIconModule,
  ],
  templateUrl: './recipe-patch-dialog.component.html',
  styleUrl: './recipe-patch-dialog.component.scss',
})
export class RecipePatchDialogComponent extends Unsubscribe {
  readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef);
  readonly snackBarService = inject(SnackBarService);
  readonly foodstuffBackendService = inject(FoodstuffBackendService);
  readonly recipeBackendService = inject(RecipeBackendService);
  readonly data = inject<{ id: number }>(MAT_DIALOG_DATA);

  constructor() {
    super();

    this.keepFoodstuffsUpToDate();
    this.fetchAllFoodstuffs();
    this.fetchRecipe();
  }

  foodstuffs: Foodstuff[] = [];
  recipe!: Recipe;

  isLoadingFoodstuffs: WritableSignal<boolean> = signal(true);
  hasErrorFoodstuffs: WritableSignal<boolean> = signal(false);
  isLoadingRecipe: WritableSignal<boolean> = signal(true);
  hasErrorRecipe: WritableSignal<boolean> = signal(false);

  recipeForm = this.fb.group({
    metaFormGroup: this.fb.group({
      name: ['', Validators.required],
      originName: [''],
      originUrl: [''],
    }),
    ingredientsFormGroup: this.fb.group({
      servings: [<number | null>null, Validators.required],
      ingredients: this.fb.array([]),
    }),
    preparationFormGroup: this.fb.group({
      preptime: [<number | null>null],
      steps: this.fb.array([]),
    }),
  });

  keepFoodstuffsUpToDate(): void {
    this.foodstuffBackendService.foodstuffsChanged$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.fetchAllFoodstuffs());
  }

  fetchAllFoodstuffs(): void {
    this.foodstuffBackendService
      .getAllFoodstuffs()
      .pipe(take(1))
      .subscribe({
        next: (foodstuffs) => {
          this.foodstuffs = foodstuffs.sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
          );
          this.isLoadingFoodstuffs.set(false);
          this.hasErrorFoodstuffs.set(false);
        },
        error: (error) => {
          console.error('failed to fetch foodstuffs: ', error);
          this.snackBarService.open('Zutaten konnten nicht geladen werden');
          this.isLoadingFoodstuffs.set(false);
          this.hasErrorFoodstuffs.set(true);
        },
      });
  }

  fetchRecipe(): void {
    this.recipeBackendService
      .getRecipeById(this.data.id)
      .pipe(take(1))
      .subscribe({
        next: (recipe) => {
          this.recipe = recipe;
          this.isLoadingRecipe.set(false);
          this.hasErrorRecipe.set(false);
        },
        error: (error) => {
          console.error('failed to fetch recipe: ', error);
          this.snackBarService.open('Rezept konnte nicht geladen werden');
          this.isLoadingRecipe.set(false);
          this.hasErrorRecipe.set(true);
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
      .patchRecipe(this.data.id, recipe)
      .pipe(take(1))
      .subscribe({
        next: (recipe) => {
          this.recipeBackendService.notifyRecipesChanged();
          this.dialogRef.close();
          this.snackBarService.open('Rezept aktualisiert');
        },
        error: (error) => {
          console.error('failed to patch recipe: ', error);
          this.snackBarService.open('Rezept konnte nicht aktualisiert werden');
        },
      });
  }
}
