import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogData } from '../../core/dialogs/confirmation-dialog/confirmation-dialog.component';
import { SnackBarService } from '../../services/snack-bar.service';
import { RecipeBackendService } from '../services/recipe-backend.service';
import { RecipePageComponent } from './recipe-page.component';

describe('RecipePageComponent', () => {
  let component: RecipePageComponent;
  let openDialog: jasmine.Spy;
  let deleteRecipe: jasmine.Spy;
  let notifyRecipesChanged: jasmine.Spy;
  let navigate: jasmine.Spy;
  let openSnackBar: jasmine.Spy;

  beforeEach(() => {
    openDialog = jasmine.createSpy('open');
    deleteRecipe = jasmine.createSpy('deleteRecipe').and.resolveTo(7);
    notifyRecipesChanged = jasmine.createSpy('notifyRecipesChanged');
    navigate = jasmine.createSpy('navigate').and.resolveTo(true);
    openSnackBar = jasmine.createSpy('open');

    component = Object.create(RecipePageComponent.prototype) as RecipePageComponent;
    Object.assign(component, {
      id: 7,
      dialog: { open: openDialog } as unknown as MatDialog,
      recipeBackendService: {
        deleteRecipe,
        notifyRecipesChanged,
      } as unknown as RecipeBackendService,
      router: { navigate } as unknown as Router,
      snackBarService: { open: openSnackBar } as unknown as SnackBarService,
    });
  });

  it('navigates and notifies after the recipe deletion succeeds', async () => {
    component.openDeleteRecipeDialog();
    const config = openDialog.calls.mostRecent().args[1] as {
      data: ConfirmationDialogData;
    };

    await config.data.action();

    expect(deleteRecipe).toHaveBeenCalledWith(7);
    expect(navigate).toHaveBeenCalledWith(['recipes']);
    expect(notifyRecipesChanged).toHaveBeenCalledTimes(1);
    expect(openSnackBar).toHaveBeenCalledWith('Rezept gelöscht');
  });

  it('shows the existing error snackbar and rejects without navigating after deletion fails', async () => {
    const error = new Error('failed');
    deleteRecipe.and.rejectWith(error);
    const logError = spyOn(console, 'error');
    component.openDeleteRecipeDialog();
    const config = openDialog.calls.mostRecent().args[1] as {
      data: ConfirmationDialogData;
    };

    await expectAsync(config.data.action()).toBeRejectedWith(error);

    expect(navigate).not.toHaveBeenCalled();
    expect(notifyRecipesChanged).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith('failed to delete recipe: ', error);
    expect(openSnackBar).toHaveBeenCalledWith(
      'Rezept konnte nicht gelöscht werden'
    );
  });

  it('keeps deletion successful when navigation fails after the delete', async () => {
    const error = new Error('navigation failed');
    navigate.and.rejectWith(error);
    const logError = spyOn(console, 'error');
    component.openDeleteRecipeDialog();
    const config = openDialog.calls.mostRecent().args[1] as {
      data: ConfirmationDialogData;
    };

    await expectAsync(config.data.action()).toBeResolved();

    expect(deleteRecipe).toHaveBeenCalledWith(7);
    expect(notifyRecipesChanged).toHaveBeenCalledTimes(1);
    expect(openSnackBar).toHaveBeenCalledOnceWith('Rezept gelöscht');
    expect(logError).toHaveBeenCalledWith(
      'failed to navigate after deleting recipe: ',
      error
    );
  });
});
