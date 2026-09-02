import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';
import { DialogHeaderComponent } from '../../../core/components/dialog-header/dialog-header.component';
import { SnackBarService } from '../../../services/snack-bar.service';
import { FoodstuffFormComponent } from '../../components/foodstuff-form/foodstuff-form.component';
import { Foodstuff } from '../../interfaces/foodstuff';
import { FoodstuffBackendService } from '../../services/foodstuff-backend.service';

@Component({
  selector: 'app-foodstuff-create-dialog',
  imports: [DialogHeaderComponent, FoodstuffFormComponent, MatDialogModule],
  templateUrl: './foodstuff-create-dialog.component.html',
  styleUrl: './foodstuff-create-dialog.component.scss',
})
export class FoodstuffCreateDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<FoodstuffCreateDialogComponent>);
  private readonly foodstuffBackendService = inject(FoodstuffBackendService);
  private readonly snackBarService = inject(SnackBarService);

  onSubmit(foodstuff: Partial<Foodstuff>): void {
    this.foodstuffBackendService.postFoodstuff(foodstuff).pipe(take(1)).subscribe({
      next: () => {
        this.foodstuffBackendService.notifyFoodstuffsChanged();
        this.dialogRef.close();
        this.snackBarService.open('Lebensmittel erstellt');
      },
      error: (error: unknown) => {
        console.error('failed to create foodstuff: ', error);
        this.snackBarService.open('Lebensmittel konnte nicht erstellt werden');
      },
    });
  }
}
