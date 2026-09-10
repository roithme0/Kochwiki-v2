import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';
import { RecipeVersion } from '../../../interfaces/recipe';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-recipe-meta-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './recipe-meta-form.component.html',
  styleUrl: './recipe-meta-form.component.scss',
})
export class RecipeMetaFormComponent {
  recipeVersion = input<RecipeVersion>();

  recipeForm!: FormGroup;
  metaFormGroup!: FormGroup;

  readonly recipeFormDirective = inject(FormGroupDirective);

  ngOnInit() {
    this.recipeForm = this.recipeFormDirective.control;
    this.metaFormGroup = this.recipeForm.get('metaFormGroup') as FormGroup;

    const recipeVersion: RecipeVersion | undefined = this.recipeVersion();
    if (recipeVersion !== undefined) {
      this.recipeForm.get('metaFormGroup')?.setValue({
        name: recipeVersion.name,
        originName: recipeVersion.originName,
        originUrl: recipeVersion.originUrl,
      });
    }
  }
}
