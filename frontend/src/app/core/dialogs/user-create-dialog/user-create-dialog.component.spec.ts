import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user';
import { SnackBarService } from '../../services/snack-bar.service';
import { UserBackendService } from '../../services/user-backend.service';
import { UserCreateDialogComponent } from './user-create-dialog.component';

describe('UserCreateDialogComponent', () => {
  it('closes with the created user after a successful submission', async () => {
    const createdUser: User = { id: 7, username: 'Daniel' };
    const dialogRef = jasmine.createSpyObj<
      MatDialogRef<UserCreateDialogComponent, User>
    >('MatDialogRef', ['close']);
    const userBackendService = jasmine.createSpyObj<UserBackendService>(
      'UserBackendService',
      ['postUser', 'notifyUsersChanged']
    );
    const snackBarService = jasmine.createSpyObj<SnackBarService>(
      'SnackBarService',
      ['open']
    );
    userBackendService.postUser.and.resolveTo(createdUser);

    TestBed.configureTestingModule({
      imports: [UserCreateDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: UserBackendService, useValue: userBackendService },
        { provide: SnackBarService, useValue: snackBarService },
      ],
    });
    const component: UserCreateDialogComponent = TestBed.createComponent(
      UserCreateDialogComponent
    ).componentInstance;
    component.userForm.setValue({ username: createdUser.username });

    await component.onSubmit();

    expect(userBackendService.postUser).toHaveBeenCalledWith({
      username: createdUser.username,
    });
    expect(dialogRef.close).toHaveBeenCalledOnceWith(createdUser);
  });
});
