import { MatDialogRef } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { SnackBarService } from '../../../services/snack-bar.service';
import { RecipeVersionWrite } from '../../interfaces/recipe';
import { RecipeBackendService } from '../../services/recipe-backend.service';
import { RecipeCreateDialogComponent } from './recipe-create-dialog.component';

describe('RecipeCreateDialogComponent', () => {
  const recipeVersion: RecipeVersionWrite = {
    name: 'Linsensuppe',
    servings: 2,
    originName: null,
    originUrl: null,
    preptime: null,
    ingredients: [],
    steps: [],
  };

  let component: RecipeCreateDialogComponent;
  let createRecipe: jasmine.Spy;
  let notifyRecipesChanged: jasmine.Spy;
  let navigate: jasmine.Spy;
  let close: jasmine.Spy;
  let openSnackBar: jasmine.Spy;

  beforeEach(() => {
    createRecipe = jasmine.createSpy('createRecipe').and.resolveTo({ recipeLineageId: '00000000-0000-4000-8000-000000000007' });
    notifyRecipesChanged = jasmine.createSpy('notifyRecipesChanged');
    navigate = jasmine.createSpy('navigate').and.resolveTo(true);
    close = jasmine.createSpy('close');
    openSnackBar = jasmine.createSpy('open');
    component = Object.create(
      RecipeCreateDialogComponent.prototype
    ) as RecipeCreateDialogComponent;
    Object.assign(component, {
      recipeBackendService: {
        createRecipe,
        notifyRecipesChanged,
      } as unknown as RecipeBackendService,
      router: { navigate } as unknown as Router,
      dialogRef: { close } as unknown as MatDialogRef<RecipeCreateDialogComponent>,
      snackBarService: { open: openSnackBar } as unknown as SnackBarService,
      isSubmitting: signal(false),
    });
  });

  it('keeps creation successful when post-success navigation fails', async () => {
    const error = new Error('navigation failed');
    navigate.and.rejectWith(error);
    const logError = spyOn(console, 'error');

    await component.onSubmit({ recipeVersion, action: 'publish' });
    await Promise.resolve();

    expect(createRecipe).toHaveBeenCalledWith(recipeVersion);
    expect(notifyRecipesChanged).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['recipes/', '00000000-0000-4000-8000-000000000007']);
    expect(openSnackBar).toHaveBeenCalledOnceWith('Rezept erstellt');
    expect(logError).toHaveBeenCalledWith(
      'failed to navigate to created recipe: ',
      error
    );
  });
});
