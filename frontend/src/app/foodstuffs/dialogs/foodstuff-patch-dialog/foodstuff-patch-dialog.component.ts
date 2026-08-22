import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogHeaderComponent } from '../../../core/components/dialog-header/dialog-header.component';
import { SnackBarService } from '../../../services/snack-bar.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FoodstuffBackendService } from '../../services/foodstuff-backend.service';
import {
  FoodstuffUnitChoices,
  FoodstuffVerboseNames,
} from '../../interfaces/foodstuff-meta-data';
import { forkJoin, Observable, take } from 'rxjs';
import { Foodstuff } from '../../interfaces/foodstuff';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-foodstuff-patch-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogHeaderComponent,
    MatDialogModule,
    MatExpansionModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './foodstuff-patch-dialog.component.html',
  styleUrl: './foodstuff-patch-dialog.component.scss',
})
export class FoodstuffPatchDialogComponent {
  readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef);
  readonly foodstuffBackendService = inject(FoodstuffBackendService);
  readonly snackBarService = inject(SnackBarService);
  readonly data = inject<{ id: number }>(MAT_DIALOG_DATA);

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
    this.fetchFoodstuffById(this.data.id);
  }

  //#region Events

  onSubmit(formData: any): void {
    const updates: Partial<Foodstuff> = formData as Foodstuff;

    this.foodstuffBackendService
      .patchFoodstuff(this.data.id, updates)
      .pipe(take(1))
      .subscribe({
        next: (foodstuff) => {
          this.foodstuffBackendService.notifyFoodstuffsChanged();
          this.dialogRef.close();
          this.snackBarService.open('Zutat aktualisiert');
        },
        error: (error) => {
          console.error('failed to patch foodstuff: ', error);
          this.snackBarService.open('Zutat konnte nicht aktualisiert werden');
        },
      });
  }

  //#endregion

  //#region Utilities

  fetchFoodstuffById(id: number): void {
    this.foodstuffBackendService
      .getFoodstuffById(id)
      .pipe(take(1))
      .subscribe({
        next: (foodstuff) => {
          this.foodstuffForm.patchValue(foodstuff);
        },
        error: (error) => {
          console.error('failed to fetch foodstuff: ', error);
          this.snackBarService.open('Zutat konnte nicht geladen werden');
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

  //#endregion
}
