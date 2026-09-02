import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';
import { DialogHeaderComponent } from '../../../core/components/dialog-header/dialog-header.component';
import { SnackBarService } from '../../../services/snack-bar.service';
import { FoodstuffFormComponent } from '../../components/foodstuff-form/foodstuff-form.component';
import { Foodstuff } from '../../interfaces/foodstuff';
import { FoodstuffBackendService } from '../../services/foodstuff-backend.service';

interface FoodstuffPatchDialogData { id: number; }

@Component({
  selector: 'app-foodstuff-patch-dialog',
  imports: [DialogHeaderComponent, FoodstuffFormComponent, MatDialogModule],
  templateUrl: './foodstuff-patch-dialog.component.html',
  styleUrl: './foodstuff-patch-dialog.component.scss',
})
export class FoodstuffPatchDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<FoodstuffPatchDialogComponent>);
  private readonly foodstuffBackendService = inject(FoodstuffBackendService);
  private readonly snackBarService = inject(SnackBarService);
  private readonly data = inject<FoodstuffPatchDialogData>(MAT_DIALOG_DATA);

  readonly foodstuff = signal<Foodstuff | null>(null);

  ngOnInit(): void {
    this.foodstuffBackendService.getFoodstuffById(this.data.id).pipe(take(1)).subscribe({
      next: (foodstuff) => this.foodstuff.set(foodstuff),
      error: (error: unknown) => {
        console.error('failed to fetch foodstuff: ', error);
        this.snackBarService.open('Zutat konnte nicht geladen werden');
      },
    });
  }

  onSubmit(updates: Partial<Foodstuff>): void {
    this.foodstuffBackendService.patchFoodstuff(this.data.id, updates).pipe(take(1)).subscribe({
      next: () => {
        this.foodstuffBackendService.notifyFoodstuffsChanged();
        this.dialogRef.close();
        this.snackBarService.open('Zutat aktualisiert');
      },
      error: (error: unknown) => {
        console.error('failed to patch foodstuff: ', error);
        this.snackBarService.open('Zutat konnte nicht aktualisiert werden');
      },
    });
  }
}
