import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogData } from '../../core/dialogs/confirmation-dialog/confirmation-dialog.component';
import { SnackBarService } from '../../services/snack-bar.service';
import { RecipeBackendService } from '../services/recipe-backend.service';
import { RecipeVersion } from '../interfaces/recipe';
import { RecipePageComponent } from './recipe-page.component';

describe('RecipePageComponent', () => {
  let component: RecipePageComponent;
  let openDialog: jasmine.Spy;
  let deleteRecipeLineage: jasmine.Spy;
  let publishRecipeDraft: jasmine.Spy;
  let discardRecipeDraft: jasmine.Spy;
  let notifyRecipesChanged: jasmine.Spy;
  let navigate: jasmine.Spy;
  let openSnackBar: jasmine.Spy;

  beforeEach(() => {
    openDialog = jasmine.createSpy('open');
    deleteRecipeLineage = jasmine.createSpy('deleteRecipeLineage').and.resolveTo();
    publishRecipeDraft = jasmine.createSpy('publishRecipeDraft').and.resolveTo({});
    discardRecipeDraft = jasmine.createSpy('discardRecipeDraft').and.resolveTo();
    notifyRecipesChanged = jasmine.createSpy('notifyRecipesChanged');
    navigate = jasmine.createSpy('navigate').and.resolveTo(true);
    openSnackBar = jasmine.createSpy('open');

    component = Object.create(RecipePageComponent.prototype) as RecipePageComponent;
    Object.assign(component, {
      recipeLineageId: '00000000-0000-4000-8000-000000000007',
      recipeVersion: draftRecipeVersion,
      dialog: { open: openDialog } as unknown as MatDialog,
      recipeBackendService: {
        deleteRecipeLineage,
        publishRecipeDraft,
        discardRecipeDraft,
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

    expect(deleteRecipeLineage).toHaveBeenCalledWith(draftRecipeVersion.recipeLineageId);
    expect(navigate).toHaveBeenCalledWith(['recipes']);
    expect(notifyRecipesChanged).toHaveBeenCalledTimes(1);
    expect(openSnackBar).toHaveBeenCalledWith('Rezeptlinie gelöscht');
  });

  it('shows the existing error snackbar and rejects without navigating after deletion fails', async () => {
    const error = new Error('failed');
    deleteRecipeLineage.and.rejectWith(error);
    const logError = spyOn(console, 'error');
    component.openDeleteRecipeDialog();
    const config = openDialog.calls.mostRecent().args[1] as {
      data: ConfirmationDialogData;
    };

    await expectAsync(config.data.action()).toBeRejectedWith(error);

    expect(navigate).not.toHaveBeenCalled();
    expect(notifyRecipesChanged).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith('failed to delete recipe lineage: ', error);
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

    expect(deleteRecipeLineage).toHaveBeenCalledWith(draftRecipeVersion.recipeLineageId);
    expect(notifyRecipesChanged).toHaveBeenCalledTimes(1);
    expect(openSnackBar).toHaveBeenCalledOnceWith('Rezeptlinie gelöscht');
    expect(logError).toHaveBeenCalledWith(
      'failed to navigate after deleting recipe lineage: ',
      error
    );
  });

  it('keeps draft publication successful when navigation fails after publication', async () => {
    const error = new Error('navigation failed');
    navigate.and.rejectWith(error);
    const logError = spyOn(console, 'error');
    component.openPublishDraftDialog();
    const config = openDialog.calls.mostRecent().args[1] as {
      data: ConfirmationDialogData;
    };

    await expectAsync(config.data.action()).toBeResolved();

    expect(publishRecipeDraft).toHaveBeenCalledWith(draftRecipeVersion.recipeLineageId, draftRecipeVersion.recipeVersionId);
    expect(notifyRecipesChanged).toHaveBeenCalledTimes(1);
    expect(openSnackBar).toHaveBeenCalledOnceWith('Entwurf als aktive Version übernommen');
    expect(logError).toHaveBeenCalledWith('failed to navigate after publishing draft: ', error);
  });

  it('keeps draft discard successful when navigation fails after deletion', async () => {
    const error = new Error('navigation failed');
    navigate.and.rejectWith(error);
    const logError = spyOn(console, 'error');
    component.openDiscardDraftDialog();
    const config = openDialog.calls.mostRecent().args[1] as {
      data: ConfirmationDialogData;
    };

    await expectAsync(config.data.action()).toBeResolved();

    expect(discardRecipeDraft).toHaveBeenCalledWith(draftRecipeVersion.recipeLineageId, draftRecipeVersion.recipeVersionId);
    expect(notifyRecipesChanged).toHaveBeenCalledTimes(1);
    expect(openSnackBar).toHaveBeenCalledOnceWith('Entwurf verworfen');
    expect(logError).toHaveBeenCalledWith('failed to navigate after discarding draft: ', error);
  });
});

const draftRecipeVersion: RecipeVersion = {
  recipeLineageId: '00000000-0000-4000-8000-000000000007',
  recipeVersionId: '00000000-0000-0000-0000-000000000007',
  state: 'draft',
  createdAt: '2026-09-10T10:00:00Z',
  lastModified: '2026-09-10T10:00:00Z',
  name: 'Draft',
  servings: 1,
  preptime: null,
  originName: null,
  originUrl: null,
  kcal: null,
  carbs: null,
  protein: null,
  fat: null,
  ingredients: [],
  steps: [],
};
