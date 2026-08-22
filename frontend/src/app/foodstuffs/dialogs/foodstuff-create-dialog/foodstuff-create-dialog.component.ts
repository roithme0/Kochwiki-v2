import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DialogHeaderComponent } from '../../../core/components/dialog-header/dialog-header.component';
import { SnackBarService } from '../../../services/snack-bar.service';
import {
  FoodstuffUnitChoices,
  FoodstuffVerboseNames,
} from '../../interfaces/foodstuff-meta-data';
import { FoodstuffBackendService } from '../../services/foodstuff-backend.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Foodstuff } from '../../interfaces/foodstuff';
import { forkJoin, Observable, take } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-foodstuff-create-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogHeaderComponent,
    MatDialogModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './foodstuff-create-dialog.component.html',
  styleUrl: './foodstuff-create-dialog.component.scss',
})
export class FoodstuffCreateDialogComponent {
  readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef);
  readonly foodstuffBackendService = inject(FoodstuffBackendService);
  readonly snackBarService = inject(SnackBarService);

  verboseNames: FoodstuffVerboseNames | null = null;
  unitChoices: FoodstuffUnitChoices | null = null;

  foodstuffForm = this.fb.group({
    name: ['', Validators.required],
    brand: [''],
    unit: ['', Validators.required],
    kcal: [<number | null>null],
    carbs: [<number | null>null],
    protein: [<number | null>null],
    fat: [<number | null>null],
  });

  ngOnInit(): void {
    this.fetchMetaData();
  }

  onSubmit(): void {
    const foodstuff: Partial<Foodstuff> = this.foodstuffForm.value as Foodstuff;

    this.foodstuffBackendService
      .postFoodstuff(foodstuff)
      .pipe(take(1))
      .subscribe({
        next: (foodstuff) => {
          this.foodstuffBackendService.notifyFoodstuffsChanged();
          this.dialogRef.close();
          this.snackBarService.open('Lebensmittel erstellt');
        },
        error: (error) => {
          console.error('failed to create foodstuff: ', error);
          this.snackBarService.open(
            'Lebensmittel konnte nicht erstellt werden'
          );
        },
      });
  }

  fetchMetaData(): void {
    const requests: Observable<any> = forkJoin({
      verboseNames: this.foodstuffBackendService.fetchFoodstuffVerboseNames(),
      unitChoices: this.foodstuffBackendService.fetchFoodstuffUnitChoices(),
    });

    requests.pipe(take(1)).subscribe({
      next: ({ verboseNames, unitChoices }) => {
        this.verboseNames = verboseNames;
        this.unitChoices = unitChoices;
      },
      error: (error) => {
        console.error('failed to fetch foodstuff meta data: ', error);
        this.snackBarService.open(
          'Metadaten für Lebensmittel konnten nicht geladen werden'
        );
      },
    });
  }

  getKeys = (obj: Object): string[] => Object.keys(obj);
}
