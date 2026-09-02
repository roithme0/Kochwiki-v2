import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { take } from 'rxjs';
import { SnackBarService } from '../../../services/snack-bar.service';
import { Foodstuff } from '../../interfaces/foodstuff';
import {
  FoodstuffUnitChoices,
  FoodstuffVerboseNames,
} from '../../interfaces/foodstuff-meta-data';
import { FoodstuffMetadataService } from '../../services/foodstuff-metadata.service';

@Component({
  selector: 'app-foodstuff-form',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './foodstuff-form.component.html',
  styleUrl: './foodstuff-form.component.scss',
})
export class FoodstuffFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly foodstuffMetadataService = inject(FoodstuffMetadataService);
  private readonly snackBarService = inject(SnackBarService);

  readonly foodstuff = input<Partial<Foodstuff> | null>(null);
  readonly submitLabel = input.required<string>();
  readonly submitted = output<Partial<Foodstuff>>();

  verboseNames: FoodstuffVerboseNames | null = null;
  unitChoices: FoodstuffUnitChoices | null = null;

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

  ngOnInit(): void {
    this.foodstuffMetadataService.load().pipe(take(1)).subscribe({
      next: ({ verboseNames, unitChoices }) => {
        this.verboseNames = verboseNames;
        this.unitChoices = unitChoices;
      },
      error: (error: unknown) => {
        console.error('failed to fetch foodstuff metadata: ', error);
        this.snackBarService.open('Metadaten für Lebensmittel konnten nicht geladen werden');
      },
    });
  }

  onSubmit(): void {
    const { name, brand, unit, kcal, carbs, protein, fat } = this.form.getRawValue();
    this.submitted.emit({ name, brand, unit, kcal, carbs, protein, fat });
  }

  getKeys(obj: Readonly<Record<string, string>>): string[] {
    return Object.keys(obj);
  }
}
