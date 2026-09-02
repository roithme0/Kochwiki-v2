import { Component, DestroyRef, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageHeaderService } from '../../services/page-header.service';
import { UserBackendService } from '../../services/user-backend.service';
import { ActiveUserService } from '../../services/active-user.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { UserCreateDialogComponent } from '../dialogs/user-create-dialog/user-create-dialog.component';
import { User } from '../../interfaces/user';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-user-page',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './select-user-page.component.html',
  styleUrl: './select-user-page.component.scss',
})
export class SelectUserPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  readonly pageHeaderService = inject(PageHeaderService);
  readonly userBackendService = inject(UserBackendService);
  readonly activeUserService = inject(ActiveUserService);
  readonly snackBarService = inject(SnackBarService);
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  isLoading: WritableSignal<boolean> = signal(false);
  hasError: WritableSignal<boolean> = signal(false);

  users: WritableSignal<User[]> = signal([]);

  ngOnInit(): void {
    this.pageHeaderService.updateHeader(false, 'Benutzer auswählen', '', false);
    this.fetchUsers();
    this.keepUsersUpToDate();
  }

  //#region Event Handlers

  onUserSelected(selectedUser: User): void {
    this.activeUserService.activeUser = selectedUser;
    this.router.navigate(['']);
  }

  //#endregion

  //#region Public Methods

  openUserCreateDialog(): void {
    this.dialog.open(UserCreateDialogComponent, {
      data: {},
      minWidth: 'calc(100vw - 1rem)',
      maxWidth: 'calc(100vw - 1rem)',
      maxHeight: 'calc(100vh - 1rem)',
      position: { top: '0.5rem', left: '0.5rem' },
      autoFocus: false,
      disableClose: true,
    });
  }

  //#endregion

  //#endregion Utilities

  private keepUsersUpToDate(): void {
    this.userBackendService.usersChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.fetchUsers());
  }

  private fetchUsers(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.userBackendService
      .getAllUsers()
      .pipe(take(1))
      .subscribe({
        next: (users) => {
          this.users.set(structuredClone(users));
          this.isLoading.set(false);
        },
        // error seems to always occur once therefore don't show snackbar (not reproducible locally for some reason)
        error: (error) => {
          console.error('failed to fetch users: ', error);
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  //#endregion
}
