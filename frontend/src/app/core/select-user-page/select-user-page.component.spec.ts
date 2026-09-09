import { NEVER, Subject } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { ActiveUserService } from '../../services/active-user.service';
import { PageHeaderService } from '../../services/page-header.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { UserBackendService } from '../../services/user-backend.service';
import { UserCreateDialogComponent } from '../dialogs/user-create-dialog/user-create-dialog.component';
import { SelectUserPageComponent } from './select-user-page.component';

describe('SelectUserPageComponent', () => {
  it('focuses the username input and selects a newly created user', () => {
    const createdUser: User = { id: 7, username: 'Daniel' };
    const afterClosed = new Subject<User | undefined>();
    const dialogRef = {
      afterClosed: () => afterClosed.asObservable(),
    } as MatDialogRef<UserCreateDialogComponent, User>;
    const dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    const activeUserService = jasmine.createSpyObj<ActiveUserService>(
      'ActiveUserService',
      ['selectUser']
    );
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    dialog.open.and.returnValue(dialogRef);
    router.navigate.and.resolveTo(true);

    TestBed.configureTestingModule({
      imports: [SelectUserPageComponent],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: ActiveUserService, useValue: activeUserService },
        { provide: Router, useValue: router },
        { provide: PageHeaderService, useValue: {} },
        {
          provide: UserBackendService,
          useValue: { usersChanged$: NEVER },
        },
        { provide: SnackBarService, useValue: {} },
      ],
    });
    const component: SelectUserPageComponent = TestBed.createComponent(
      SelectUserPageComponent
    ).componentInstance;

    component.openUserCreateDialog();

    const dialogConfig = dialog.open.calls.mostRecent().args[1];
    expect(dialogConfig?.autoFocus).toBe(
      'input[formControlName="username"]'
    );

    afterClosed.next(createdUser);

    expect(activeUserService.selectUser).toHaveBeenCalledOnceWith(createdUser);
    expect(router.navigate).toHaveBeenCalledOnceWith(['']);
  });
});
