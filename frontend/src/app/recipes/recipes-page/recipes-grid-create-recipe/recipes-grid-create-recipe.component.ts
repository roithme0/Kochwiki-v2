import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { RecipeCreateDialogComponent } from '../../dialogs/recipe-create-dialog/recipe-create-dialog.component';

@Component({
  selector: 'app-recipes-grid-create-recipe',
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './recipes-grid-create-recipe.component.html',
  styleUrl: './recipes-grid-create-recipe.component.scss',
})
export class RecipesGridCreateRecipeComponent {
  readonly dialog = inject(MatDialog);

  openCreateRecipeDialog(): void {
    this.dialog.open(RecipeCreateDialogComponent, {
      minWidth: 'calc(100vw - 1rem)',
      maxWidth: 'calc(100vw - 1rem)',
      maxHeight: 'calc(100vh - 1rem)',
      position: { top: '0.5rem', left: '0.5rem' },
      autoFocus: false,
      disableClose: true,
    });
  }
}
