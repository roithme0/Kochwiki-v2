import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderService } from '../../services/page-header.service';
import { RecipesGridComponent } from './recipes-grid/recipes-grid.component';
import { RecipesSearchComponent } from './recipes-search/recipes-search.component';
import { MatDialog } from '@angular/material/dialog';
import { RecipeCreateDialogComponent } from '../dialogs/recipe-create-dialog/recipe-create-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-recipes-page',
  imports: [
    CommonModule,
    RecipesGridComponent,
    RecipesSearchComponent,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './recipes-page.component.html',
  styleUrl: './recipes-page.component.scss',
})
export class RecipesPageComponent {
  readonly dialog = inject(MatDialog);
  readonly pageHeaderService = inject(PageHeaderService);

  showSearch: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    this.pageHeaderService.updateHeader(true, 'Rezepte', '', true);
  }

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
