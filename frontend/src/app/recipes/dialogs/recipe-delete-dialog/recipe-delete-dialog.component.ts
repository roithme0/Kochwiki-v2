import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecipeBackendService } from '../../services/recipe-backend.service';
import { SnackBarService } from '../../../services/snack-bar.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DialogHeaderComponent } from '../../../core/components/dialog-header/dialog-header.component';
import { take } from 'rxjs';

@Component({
  selector: 'app-recipe-delete-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    DialogHeaderComponent,
  ],
  templateUrl: './recipe-delete-dialog.component.html',
  styleUrl: './recipe-delete-dialog.component.scss',
})
export class RecipeDeleteDialogComponent {
  readonly dialogRef = inject(MatDialogRef);
  readonly recipeBackendService = inject(RecipeBackendService);
  readonly router = inject(Router);
  readonly snackBarService = inject(SnackBarService);
  readonly data = inject<{ id: number }>(MAT_DIALOG_DATA);

  deleteRecipe(): void {
    this.recipeBackendService
      .deleteRecipe(this.data.id)
      .pipe(take(1))
      .subscribe({
        next: (id) => {
          this.router.navigate(['recipes']).then(() => {
            this.dialogRef.close();
            this.recipeBackendService.notifyRecipesChanged();
            this.snackBarService.open('Rezept gelöscht');
          });
        },
        error: (error) => {
          console.error('failed to delete recipe: ', error);
          this.snackBarService.open('Rezept konnte nicht gelöscht werden');
        },
      });
  }
}
