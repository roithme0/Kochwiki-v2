import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Foodstuff } from '../../interfaces/foodstuff';
import { FoodstuffBackendService } from '../../services/foodstuff-backend.service';
import { SnackBarService } from '../../../services/snack-bar.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DialogHeaderComponent } from '../../../core/components/dialog-header/dialog-header.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-foodstuff-delete-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    DialogHeaderComponent,
  ],
  templateUrl: './foodstuff-delete-dialog.component.html',
  styleUrl: './foodstuff-delete-dialog.component.scss',
})
export class FoodstuffDeleteDialogComponent {
  readonly dialogRef = inject(MatDialogRef);
  readonly foodstuffBackendService = inject(FoodstuffBackendService);
  readonly snackBarService = inject(SnackBarService);
  readonly data = inject<{ id: number }>(MAT_DIALOG_DATA);

  foodstuff: Foodstuff | undefined;

  deleteFoodstuff(): void {
    this.foodstuffBackendService
      .deleteFoodstuff(this.data.id)
      .pipe(take(1))
      .subscribe({
        next: (id) => {
          this.snackBarService.open('Zutat gelöscht');
          this.foodstuffBackendService.notifyFoodstuffsChanged();
          this.dialogRef.close();
        },
        error: (error) => {
          console.error('failed to delete foodstuff: ', error);
          this.snackBarService.open('Zutat konnte nicht gelöscht werden');
        },
      });
  }
}
