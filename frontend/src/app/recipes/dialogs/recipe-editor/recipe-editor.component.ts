import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { catchError, forkJoin, map, of, take } from 'rxjs';
import { Foodstuff } from '../../../foodstuffs/interfaces/foodstuff';
import { FoodstuffBackendService } from '../../../foodstuffs/services/foodstuff-backend.service';
import { Recipe, RecipeWrite } from '../../interfaces/recipe';
import { RecipeBackendService } from '../../services/recipe-backend.service';
import { SnackBarService } from '../../../services/snack-bar.service';
import { RecipeIngredientsFormComponent } from '../forms/recipe-ingredients-form/recipe-ingredients-form.component';
import { RecipeMetaFormComponent } from '../forms/recipe-meta-form/recipe-meta-form.component';
import { RecipePreparationFormComponent } from '../forms/recipe-preparation-form/recipe-preparation-form.component';

type RecipeEditorState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; source: 'foodstuffs' | 'recipe' };

type LoadResult<T> =
  | { status: 'success'; value: T }
  | { status: 'error' };

interface RecipeFormControls {
  metaFormGroup: FormGroup<{
    name: FormControl<string | null>;
    originName: FormControl<string | null>;
    originUrl: FormControl<string | null>;
  }>;
  ingredientsFormGroup: FormGroup<{
    servings: FormControl<number | null>;
    ingredients: FormArray<FormGroup<IngredientFormControls>>;
  }>;
  preparationFormGroup: FormGroup<{
    preptime: FormControl<number | null>;
    steps: FormArray<FormGroup<StepFormControls>>;
  }>;
}

interface IngredientFormControls {
  index: FormControl<number | null>;
  foodstuffId: FormControl<number | null>;
  amount: FormControl<number | null>;
}

interface StepFormControls {
  index: FormControl<number | null>;
  description: FormControl<string | null>;
}

@Component({
  selector: 'app-recipe-editor',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    RecipeIngredientsFormComponent,
    RecipeMetaFormComponent,
    RecipePreparationFormComponent,
  ],
  templateUrl: './recipe-editor.component.html',
  styleUrl: './recipe-editor.component.scss',
})
export class RecipeEditorComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly foodstuffBackendService = inject(FoodstuffBackendService);
  private readonly recipeBackendService = inject(RecipeBackendService);
  private readonly snackBarService = inject(SnackBarService);

  readonly recipeId = input<number | null>(null);
  readonly submitted = output<RecipeWrite>();
  readonly state = signal<RecipeEditorState>({ status: 'loading' });
  readonly foodstuffs = signal<Foodstuff[]>([]);
  readonly recipe = signal<Recipe | null>(null);

  readonly recipeForm = this.fb.group<RecipeFormControls>({
    metaFormGroup: this.fb.group({
      name: this.fb.control('', Validators.required),
      originName: this.fb.control(''),
      originUrl: this.fb.control(''),
    }),
    ingredientsFormGroup: this.fb.group({
      servings: this.fb.control(2, Validators.required),
      ingredients: this.fb.array<FormGroup<IngredientFormControls>>([]),
    }),
    preparationFormGroup: this.fb.group({
      preptime: this.fb.control<number | null>(null),
      steps: this.fb.array<FormGroup<StepFormControls>>([]),
    }),
  });

  ngOnInit(): void {
    this.loadInitialData();
    this.foodstuffBackendService.foodstuffsChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshFoodstuffs());
  }

  onSubmit(): void {
    const value = this.recipeForm.getRawValue();
    const { metaFormGroup, ingredientsFormGroup, preparationFormGroup } = value;

    if (
      metaFormGroup.name === null ||
      ingredientsFormGroup.servings === null ||
      ingredientsFormGroup.ingredients.some(
        (ingredient) =>
          ingredient.index === null ||
          ingredient.amount === null ||
          ingredient.foodstuffId === null
      ) ||
      preparationFormGroup.steps.some(
        (step) => step.index === null || step.description === null
      )
    ) {
      return;
    }

    this.submitted.emit({
      name: metaFormGroup.name,
      originName: metaFormGroup.originName || null,
      originUrl: metaFormGroup.originUrl || null,
      servings: ingredientsFormGroup.servings,
      ingredients: ingredientsFormGroup.ingredients.map((ingredient) => ({
        index: ingredient.index!,
        amount: ingredient.amount!,
        foodstuffId: ingredient.foodstuffId!,
      })),
      preptime: preparationFormGroup.preptime,
      steps: preparationFormGroup.steps.map((step) => ({
        index: step.index!,
        description: step.description!,
      })),
    });
  }

  errorMessage(): string {
    const state = this.state();
    return state.status === 'error' && state.source === 'recipe'
      ? 'Rezept konnte nicht geladen werden.'
      : 'Zutaten konnten nicht geladen werden.';
  }

  private loadInitialData(): void {
    this.state.set({ status: 'loading' });
    const foodstuffs = this.loadFoodstuffs();
    const recipeId = this.recipeId();

    if (recipeId === null) {
      foodstuffs.subscribe((foodstuffResult) => this.applyInitialResults(foodstuffResult));
      return;
    }

    forkJoin({ foodstuffs, recipe: this.loadRecipe(recipeId) }).subscribe(
      ({ foodstuffs: foodstuffResult, recipe: recipeResult }) =>
        this.applyInitialResults(foodstuffResult, recipeResult)
    );
  }

  private loadFoodstuffs() {
    return this.foodstuffBackendService.getAllFoodstuffs().pipe(
      take(1),
      map((foodstuffs): LoadResult<Foodstuff[]> => ({
        status: 'success',
        value: this.sortFoodstuffs(foodstuffs),
      })),
      catchError((error: unknown) => {
        console.error('failed to fetch foodstuffs: ', error);
        return of<LoadResult<Foodstuff[]>>({ status: 'error' });
      })
    );
  }

  private loadRecipe(id: number) {
    return this.recipeBackendService.getRecipeById(id).pipe(
      take(1),
      map((recipe): LoadResult<Recipe> => ({ status: 'success', value: recipe })),
      catchError((error: unknown) => {
        console.error('failed to fetch recipe: ', error);
        return of<LoadResult<Recipe>>({ status: 'error' });
      })
    );
  }

  private applyInitialResults(
    foodstuffResult: LoadResult<Foodstuff[]>,
    recipeResult?: LoadResult<Recipe>
  ): void {
    if (foodstuffResult.status === 'error') {
      this.state.set({ status: 'error', source: 'foodstuffs' });
      this.snackBarService.open('Zutaten konnten nicht geladen werden');
      return;
    }

    if (recipeResult?.status === 'error') {
      this.state.set({ status: 'error', source: 'recipe' });
      this.snackBarService.open('Rezept konnte nicht geladen werden');
      return;
    }

    this.foodstuffs.set(foodstuffResult.value);
    if (recipeResult?.status === 'success') this.recipe.set(recipeResult.value);
    this.state.set({ status: 'ready' });
  }

  private refreshFoodstuffs(): void {
    this.foodstuffBackendService.getAllFoodstuffs().pipe(take(1)).subscribe({
      next: (foodstuffs) => this.foodstuffs.set(this.sortFoodstuffs(foodstuffs)),
      error: (error: unknown) => {
        console.error('failed to refresh foodstuffs: ', error);
        this.snackBarService.open('Zutaten konnten nicht aktualisiert werden');
      },
    });
  }

  private sortFoodstuffs(foodstuffs: Foodstuff[]): Foodstuff[] {
    return [...foodstuffs].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  }
}
