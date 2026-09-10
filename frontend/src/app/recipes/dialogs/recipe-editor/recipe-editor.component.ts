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
import { Foodstuff } from '../../../foodstuffs/interfaces/foodstuff';
import { FoodstuffBackendService } from '../../../foodstuffs/services/foodstuff-backend.service';
import { RecipeVersion, RecipeVersionWrite } from '../../interfaces/recipe';
import { RecipeBackendService } from '../../services/recipe-backend.service';
import { SnackBarService } from '../../../services/snack-bar.service';
import { RecipeIngredientsFormComponent } from '../forms/recipe-ingredients-form/recipe-ingredients-form.component';
import { RecipeMetaFormComponent } from '../forms/recipe-meta-form/recipe-meta-form.component';
import { RecipePreparationFormComponent } from '../forms/recipe-preparation-form/recipe-preparation-form.component';

type RecipeEditorState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; source: 'foodstuffs' | 'recipeVersion' };

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

export type RecipeEditorMode = 'create' | 'active' | 'draft';

export interface RecipeEditorSubmission {
  recipeVersion: RecipeVersionWrite;
  action: 'publish' | 'draft';
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

  readonly recipeLineageId = input<string | null>(null);
  readonly recipeVersionId = input<string | null>(null);
  readonly mode = input<RecipeEditorMode>('create');
  readonly submitting = input(false);
  readonly submitted = output<RecipeEditorSubmission>();
  readonly state = signal<RecipeEditorState>({ status: 'loading' });
  readonly foodstuffs = signal<Foodstuff[]>([]);
  readonly recipeVersion = signal<RecipeVersion | null>(null);

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
    void this.loadInitialData();
    this.foodstuffBackendService.foodstuffsChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.refreshFoodstuffs());
  }

  onSubmit(action: 'publish' | 'draft'): void {
    if (this.submitting()) return;
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
      action,
      recipeVersion: {
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
      },
    });
  }

  errorMessage(): string {
    const state = this.state();
    return state.status === 'error' && state.source === 'recipeVersion'
      ? 'Rezept konnte nicht geladen werden.'
      : 'Zutaten konnten nicht geladen werden.';
  }

  private async loadInitialData(): Promise<void> {
    this.state.set({ status: 'loading' });
    const recipeLineageId = this.recipeLineageId();

    if (recipeLineageId === null) {
      this.applyInitialResults(await this.loadFoodstuffs());
      return;
    }

    const [foodstuffResult, recipeVersionResult] = await Promise.all([
      this.loadFoodstuffs(),
      this.loadRecipeVersion(recipeLineageId, this.recipeVersionId()),
    ]);
    this.applyInitialResults(foodstuffResult, recipeVersionResult);
  }

  private async loadFoodstuffs(): Promise<LoadResult<Foodstuff[]>> {
    try {
      return {
        status: 'success',
        value: this.sortFoodstuffs(
          await this.foodstuffBackendService.getAllFoodstuffs()
        ),
      };
    } catch (error: unknown) {
      console.error('failed to fetch foodstuffs: ', error);
      return { status: 'error' };
    }
  }

  private async loadRecipeVersion(recipeLineageId: string, recipeVersionId: string | null): Promise<LoadResult<RecipeVersion>> {
    try {
      return {
        status: 'success',
        value: recipeVersionId === null
          ? await this.recipeBackendService.getActiveRecipeVersion(recipeLineageId)
          : await this.recipeBackendService.getRecipeVersion(recipeLineageId, recipeVersionId),
      };
    } catch (error: unknown) {
      console.error('failed to fetch recipe version: ', error);
      return { status: 'error' };
    }
  }

  private applyInitialResults(
    foodstuffResult: LoadResult<Foodstuff[]>,
    recipeVersionResult?: LoadResult<RecipeVersion>
  ): void {
    if (foodstuffResult.status === 'error') {
      this.state.set({ status: 'error', source: 'foodstuffs' });
      this.snackBarService.open('Zutaten konnten nicht geladen werden');
      return;
    }

    if (recipeVersionResult?.status === 'error') {
      this.state.set({ status: 'error', source: 'recipeVersion' });
      this.snackBarService.open('Rezept konnte nicht geladen werden');
      return;
    }

    this.foodstuffs.set(foodstuffResult.value);
    if (recipeVersionResult?.status === 'success') this.recipeVersion.set(recipeVersionResult.value);
    this.state.set({ status: 'ready' });
  }

  private async refreshFoodstuffs(): Promise<void> {
    try {
      this.foodstuffs.set(
        this.sortFoodstuffs(
          await this.foodstuffBackendService.getAllFoodstuffs()
        )
      );
    } catch (error: unknown) {
      console.error('failed to refresh foodstuffs: ', error);
      this.snackBarService.open('Zutaten konnten nicht aktualisiert werden');
    }
  }

  private sortFoodstuffs(foodstuffs: Foodstuff[]): Foodstuff[] {
    return [...foodstuffs].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  }
}
