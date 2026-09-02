import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Foodstuff } from '../../interfaces/foodstuff';
import { FoodstuffMetadataService } from '../../services/foodstuff-metadata.service';

@Component({
  selector: 'app-foodstuff-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './foodstuff-form.component.html',
  styleUrl: './foodstuff-form.component.scss',
})
export class FoodstuffFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly foodstuffMetadataService = inject(FoodstuffMetadataService);

  readonly foodstuff = input<Partial<Foodstuff> | null>(null);
  readonly submitLabel = input.required<string>();
  readonly submitted = output<Partial<Foodstuff>>();

  readonly verboseNames = this.foodstuffMetadataService.verboseNames;
  readonly unitChoices = this.foodstuffMetadataService.unitChoices;

  readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    brand: this.fb.control<string | null>(''),
    unit: this.fb.nonNullable.control('', Validators.required),
    kcal: this.fb.control<number | null>(null),
    carbs: this.fb.control<number | null>(null),
    protein: this.fb.control<number | null>(null),
    fat: this.fb.control<number | null>(null),
  });

  constructor() {
    effect(() => {
      const foodstuff = this.foodstuff();
      if (foodstuff) this.form.patchValue(foodstuff);
    });
  }

  onSubmit(): void {
    const { name, brand, unit, kcal, carbs, protein, fat } =
      this.form.getRawValue();
    this.submitted.emit({ name, brand, unit, kcal, carbs, protein, fat });
  }

  getKeys(obj: Readonly<Record<string, string>>): string[] {
    return Object.keys(obj);
  }
}
