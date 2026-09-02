import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SnackBarService } from '../../../services/snack-bar.service';
import { RecipeWrite } from '../../interfaces/recipe';
import { RecipeBackendService } from '../../services/recipe-backend.service';
import { RecipeCreateDialogComponent } from './recipe-create-dialog.component';

describe('RecipeCreateDialogComponent', () => {
  const recipe: RecipeWrite = {
    name: 'Linsensuppe',
    servings: 2,
    originName: null,
    originUrl: null,
    preptime: null,
    ingredients: [],
    steps: [],
  };

  let component: RecipeCreateDialogComponent;
  let postRecipe: jasmine.Spy;
  let notifyRecipesChanged: jasmine.Spy;
  let navigate: jasmine.Spy;
  let close: jasmine.Spy;
  let openSnackBar: jasmine.Spy;

  beforeEach(() => {
    postRecipe = jasmine.createSpy('postRecipe').and.resolveTo({ id: 7 });
    notifyRecipesChanged = jasmine.createSpy('notifyRecipesChanged');
    navigate = jasmine.createSpy('navigate').and.resolveTo(true);
    close = jasmine.createSpy('close');
    openSnackBar = jasmine.createSpy('open');
    component = Object.create(
      RecipeCreateDialogComponent.prototype
    ) as RecipeCreateDialogComponent;
    Object.assign(component, {
      recipeBackendService: {
        postRecipe,
        notifyRecipesChanged,
      } as unknown as RecipeBackendService,
      router: { navigate } as unknown as Router,
      dialogRef: { close } as unknown as MatDialogRef<RecipeCreateDialogComponent>,
      snackBarService: { open: openSnackBar } as unknown as SnackBarService,
    });
  });

  it('keeps creation successful when post-success navigation fails', async () => {
    const error = new Error('navigation failed');
    navigate.and.rejectWith(error);
    const logError = spyOn(console, 'error');

    await component.onSubmit(recipe);
    await Promise.resolve();

    expect(postRecipe).toHaveBeenCalledWith(recipe);
    expect(notifyRecipesChanged).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['recipes/', 7]);
    expect(openSnackBar).toHaveBeenCalledOnceWith('Rezept erstellt');
    expect(logError).toHaveBeenCalledWith(
      'failed to navigate to created recipe: ',
      error
    );
  });
});
