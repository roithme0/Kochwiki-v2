import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from './confirmation-dialog.component';

interface DeferredAction {
  promise: Promise<void>;
  resolve: () => void;
  reject: (reason: unknown) => void;
}

function createDeferredAction(): DeferredAction {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise: Promise<void> = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

describe('ConfirmationDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let component: ConfirmationDialogComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;
  let data: ConfirmationDialogData;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj<MatDialogRef<ConfirmationDialogComponent>>(
      'MatDialogRef',
      ['close']
    );
    data = {
      title: 'Eintrag löschen?',
      confirmLabel: 'Ja',
      cancelLabel: 'Nein',
      action: (): Promise<void> => Promise.resolve(),
    };

    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useFactory: (): ConfirmationDialogData => data },
        { provide: MatDialogRef, useFactory: () => dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('closes after the action succeeds', async () => {
    const action = jasmine.createSpy('action').and.resolveTo();
    data.action = action;

    await component.confirm();

    expect(action).toHaveBeenCalledTimes(1);
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('closes without executing the action when canceled', () => {
    const action = jasmine.createSpy('action');
    data.action = action;

    component.cancel();

    expect(action).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('re-enables confirmation after the action fails', async () => {
    data.action = (): Promise<void> => Promise.reject(new Error('failed'));

    await component.confirm();
    fixture.detectChanges();

    expect(component.isExecuting()).toBeFalse();
    expect(dialogRef.disableClose).toBeFalse();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
  });

  it('prevents duplicate submissions and closing while the action runs', async () => {
    const deferredAction: DeferredAction = createDeferredAction();
    const action = jasmine
      .createSpy('action')
      .and.returnValue(deferredAction.promise);
    data.action = action;

    const firstConfirmation: Promise<void> = component.confirm();
    const secondConfirmation: Promise<void> = component.confirm();
    fixture.detectChanges();

    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button');
    expect(action).toHaveBeenCalledTimes(1);
    expect(component.isExecuting()).toBeTrue();
    expect(dialogRef.disableClose).toBeTrue();
    expect(buttons[0].disabled).toBeTrue();
    expect(buttons[1].disabled).toBeTrue();

    component.cancel();
    expect(dialogRef.close).not.toHaveBeenCalled();

    deferredAction.resolve();
    await Promise.all([firstConfirmation, secondConfirmation]);

    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });
});
