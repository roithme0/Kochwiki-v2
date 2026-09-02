import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogHeaderComponent } from '../../../core/components/dialog-header/dialog-header.component';
import { SnackBarService } from '../../../services/snack-bar.service';
import { RecipeWrite } from '../../interfaces/recipe';
import { RecipeBackendService } from '../../services/recipe-backend.service';
import { RecipeEditorComponent } from '../recipe-editor/recipe-editor.component';

@Component({
  selector: 'app-recipe-create-dialog',
  imports: [DialogHeaderComponent, MatDialogModule, RecipeEditorComponent],
  templateUrl: './recipe-create-dialog.component.html',
  styleUrl: './recipe-create-dialog.component.scss',
})
export class RecipeCreateDialogComponent {
  private readonly router = inject(Router);
  private readonly dialogRef = inject(MatDialogRef<RecipeCreateDialogComponent>);
  private readonly recipeBackendService = inject(RecipeBackendService);
  private readonly snackBarService = inject(SnackBarService);

  async onSubmit(recipe: RecipeWrite): Promise<void> {
    let createdRecipeId: number;
    try {
      createdRecipeId = (await this.recipeBackendService.postRecipe(recipe)).id;
    } catch (error: unknown) {
      console.error('failed to create recipe: ', error);
      this.snackBarService.open('Rezept konnte nicht erstellt werden');
      return;
    }

    this.recipeBackendService.notifyRecipesChanged();
    this.dialogRef.close();
    void this.navigateToRecipe(createdRecipeId);
    this.snackBarService.open('Rezept erstellt');
  }

  private async navigateToRecipe(id: number): Promise<void> {
    try {
      await this.router.navigate(['recipes/', id]);
    } catch (error: unknown) {
      console.error('failed to navigate to created recipe: ', error);
    }
  }
}
