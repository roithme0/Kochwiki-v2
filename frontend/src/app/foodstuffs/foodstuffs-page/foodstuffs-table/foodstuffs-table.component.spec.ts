import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogData } from '../../../core/dialogs/confirmation-dialog/confirmation-dialog.component';
import { SnackBarService } from '../../../services/snack-bar.service';
import { FoodstuffBackendService } from '../../services/foodstuff-backend.service';
import { Foodstuff } from '../../interfaces/foodstuff';
import { FoodstuffsTableComponent } from './foodstuffs-table.component';
import { FoodstuffTableDisplayedFieldsService } from '../services/foodstuff-table-displayed-fields.service';
import { FoodstuffMetadataService } from '../../services/foodstuff-metadata.service';
import { FoodstuffTableControlService } from '../services/foodstuff-table-control.service';

describe('FoodstuffsTableComponent', () => {
  const foodstuff: Foodstuff = {
    id: 42,
    name: 'Tomate',
    brand: null,
    unit: 'g',
    unitVerbose: 'Gramm',
    kcal: 18,
    carbs: 3,
    protein: 1,
    fat: 0,
    recipeIds: [],
  };

  let component: FoodstuffsTableComponent;
  let openDialog: jasmine.Spy;
  let deleteFoodstuff: jasmine.Spy;
  let notifyFoodstuffsChanged: jasmine.Spy;
  let openSnackBar: jasmine.Spy;

  beforeEach(() => {
    openDialog = jasmine.createSpy('open');
    deleteFoodstuff = jasmine.createSpy('deleteFoodstuff');
    notifyFoodstuffsChanged = jasmine.createSpy('notifyFoodstuffsChanged');
    openSnackBar = jasmine.createSpy('open');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: FoodstuffMetadataService,
          useValue: { verboseNames: signal(null) },
        },
        { provide: FoodstuffTableDisplayedFieldsService, useValue: {} },
        { provide: FoodstuffTableControlService, useValue: { searchBy: signal('') } },
        { provide: MatDialog, useValue: { open: openDialog } },
        {
          provide: FoodstuffBackendService,
          useValue: { deleteFoodstuff, notifyFoodstuffsChanged },
        },
        { provide: SnackBarService, useValue: { open: openSnackBar } },
      ],
    });
    component = TestBed.runInInjectionContext(
      () => new FoodstuffsTableComponent()
    );
  });

  it('disconnects the resize observer when destroyed', () => {
    const resizeObserver = jasmine.createSpyObj<ResizeObserver>(
      'ResizeObserver',
      ['disconnect']
    );
    component.tableWrapperResizeObserver = resizeObserver;

    component.ngOnDestroy();

    expect(resizeObserver.disconnect).toHaveBeenCalledOnceWith();
  });

  it('executes the foodstuff deletion and success side effects through the dialog action', async () => {
    deleteFoodstuff.and.resolveTo(foodstuff.id);

    const action: () => Promise<void> = openConfirmationAction();
    await action();

    expect(deleteFoodstuff).toHaveBeenCalledWith(foodstuff.id);
    expect(notifyFoodstuffsChanged).toHaveBeenCalledTimes(1);
    expect(openSnackBar).toHaveBeenCalledWith('Zutat gelöscht');
  });

  it('shows the existing error snackbar and rejects so the dialog remains open', async () => {
    const error = new Error('failed');
    deleteFoodstuff.and.rejectWith(error);
    spyOn(console, 'error');

    const action: () => Promise<void> = openConfirmationAction();

    await expectAsync(action()).toBeRejectedWith(error);

    expect(notifyFoodstuffsChanged).not.toHaveBeenCalled();
    expect(openSnackBar).toHaveBeenCalledWith(
      'Zutat konnte nicht gelöscht werden'
    );
  });

  function openConfirmationAction(): () => Promise<void> {
    component.openDeleteFoodstuffDialog(foodstuff);
    const config = openDialog.calls.mostRecent().args[1] as {
      data: ConfirmationDialogData;
    };
    return config.data.action;
  }
});
