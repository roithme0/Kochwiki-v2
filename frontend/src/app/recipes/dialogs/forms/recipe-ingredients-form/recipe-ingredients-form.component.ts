import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Foodstuff } from '../../../../foodstuffs/interfaces/foodstuff';
import { Ingredient } from '../../../interfaces/ingredient';
import { Recipe } from '../../../interfaces/recipe';
import { FoodstuffCreateDialogComponent } from '../../../../foodstuffs/dialogs/foodstuff-create-dialog/foodstuff-create-dialog.component';
import { IngredientFieldComponent } from './ingredient-field/ingredient-field.component';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-recipe-ingredients-form',
  imports: [
    CommonModule,
    IngredientFieldComponent,
    MatButtonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatExpansionModule,
    MatSelectModule,
  ],
  templateUrl: './recipe-ingredients-form.component.html',
  styleUrl: './recipe-ingredients-form.component.scss',
})
export class RecipeIngredientsFormComponent {
  foodstuffs = input.required<Foodstuff[]>();
  recipe = input<Recipe>();

  readonly recipeFormDirective = inject(FormGroupDirective);
  readonly fb: FormBuilder = inject(FormBuilder);
  readonly dialog: MatDialog = inject(MatDialog);

  recipeForm!: FormGroup;
  ingredientsFormGroup!: FormGroup;

  ngOnInit() {
    this.recipeForm = this.recipeFormDirective.control;
    this.ingredientsFormGroup = this.recipeForm.get(
      'ingredientsFormGroup'
    ) as FormGroup;

    const recipe: Recipe | undefined = this.recipe();
    if (recipe != undefined) {
      this.recipeForm.get('ingredientsFormGroup')?.patchValue({
        servings: recipe.servings,
      });
      recipe.ingredients.forEach((ingredient: Ingredient) =>
        this.addIngredient(ingredient)
      );
    }
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredientsFormGroup.ingredients') as FormArray;
  }

  addIngredient(ingredient?: Ingredient): void {
    this.ingredients.push(
      this.fb.group({
        index: [1, Validators.required],
        // index: [ingredient?.index ?? null, Validators.required],
        foodstuffId: [ingredient?.foodstuff.id ?? null, Validators.required],
        amount: [ingredient?.amount ?? null, Validators.required],
      })
    );
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  openCreateFoodstuffDialog(): void {
    this.dialog.open(FoodstuffCreateDialogComponent, {
      minWidth: 'calc(100vw - 1rem)',
      maxWidth: 'calc(100vw - 1rem)',
      maxHeight: 'calc(100vh - 1rem)',
      position: { top: '0.5rem', left: '0.5rem' },
      autoFocus: false,
      disableClose: true,
    });
  }
}
