import { Component, NgZone, ViewChild, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormGroupDirective,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs';
import { Step } from '../../../interfaces/step';
import { Recipe } from '../../../interfaces/recipe';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recipe-preparation-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: './recipe-preparation-form.component.html',
  styleUrl: './recipe-preparation-form.component.scss',
})
export class RecipePreparationFormComponent {
  recipe = input<Recipe>();

  readonly recipeFormDirective = inject(FormGroupDirective);
  readonly fb = inject(FormBuilder);
  readonly ngZone = inject(NgZone);

  recipeForm!: FormGroup;
  preparationFormGroup!: FormGroup;

  stepsSorted: Step[] = [];

  @ViewChild('autosize') readonly autosize!: CdkTextareaAutosize;

  ngOnInit() {
    this.recipeForm = this.recipeFormDirective.control;
    this.preparationFormGroup = this.recipeForm.get(
      'preparationFormGroup'
    ) as FormGroup;

    const recipe: Recipe | undefined = this.recipe();
    if (recipe !== undefined) {
      this.recipeForm.get('preparationFormGroup')?.patchValue({
        preptime: recipe.preptime,
      });
      this.stepsSorted = recipe.steps.sort((a, b) => a.index - b.index);
      this.stepsSorted.forEach((step) => this.addStep(step));
    }
  }

  get steps(): FormArray {
    return this.recipeForm.get('preparationFormGroup.steps') as FormArray;
  }

  addStep(step?: Step): void {
    this.steps.push(
      this.fb.group({
        // index: [1, Validators.required],
        index: [step?.index ?? null, Validators.required],
        description: [step?.description ?? '', Validators.required],
      })
    );
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
  }

  triggerTextareaResize() {
    this.ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }
}
