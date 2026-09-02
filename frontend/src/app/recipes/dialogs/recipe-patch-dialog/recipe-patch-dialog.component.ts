import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';
import { DialogHeaderComponent } from '../../../core/components/dialog-header/dialog-header.component';
import { SnackBarService } from '../../../services/snack-bar.service';
import { RecipeWrite } from '../../interfaces/recipe';
import { RecipeBackendService } from '../../services/recipe-backend.service';
import { RecipeEditorComponent } from '../recipe-editor/recipe-editor.component';

interface RecipePatchDialogData { id: number; }

@Component({
  selector: 'app-recipe-patch-dialog',
  imports: [DialogHeaderComponent, MatDialogModule, RecipeEditorComponent],
  templateUrl: './recipe-patch-dialog.component.html',
  styleUrl: './recipe-patch-dialog.component.scss',
})
export class RecipePatchDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RecipePatchDialogComponent>);
  private readonly recipeBackendService = inject(RecipeBackendService);
  private readonly snackBarService = inject(SnackBarService);
  readonly data = inject<RecipePatchDialogData>(MAT_DIALOG_DATA);

  onSubmit(recipe: RecipeWrite): void {
    this.recipeBackendService.patchRecipe(this.data.id, recipe).pipe(take(1)).subscribe({
      next: () => {
        this.recipeBackendService.notifyRecipesChanged();
        this.dialogRef.close();
        this.snackBarService.open('Rezept aktualisiert');
      },
      error: (error: unknown) => {
        console.error('failed to patch recipe: ', error);
        this.snackBarService.open('Rezept konnte nicht aktualisiert werden');
      },
    });
  }
}
