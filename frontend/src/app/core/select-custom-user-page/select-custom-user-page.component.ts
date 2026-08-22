import { Component, WritableSignal, inject, signal } from '@angular/core';
import { PageHeaderService } from '../../services/page-header.service';
import { CustomUserBackendService } from '../../services/custom-user-backend.service';
import { ActiveCustomUserService } from '../../services/active-custom-user.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { UserCreateDialogComponent } from '../dialogs/user-create-dialog/user-create-dialog.component';
import { CustomUser } from '../../interfaces/custom-user';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { take, takeUntil } from 'rxjs';
import { Unsubscribe } from '../../utils/unsubsribe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-custom-user-page',
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './select-custom-user-page.component.html',
  styleUrl: './select-custom-user-page.component.scss',
})
export class SelectCustomUserPageComponent extends Unsubscribe {
  readonly pageHeaderService = inject(PageHeaderService);
  readonly customUserBackendService = inject(CustomUserBackendService);
  readonly activeCustomUserService = inject(ActiveCustomUserService);
  readonly snackBarService = inject(SnackBarService);
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  isLoading: WritableSignal<boolean> = signal(false);
  hasError: WritableSignal<boolean> = signal(false);

  customUsers: WritableSignal<CustomUser[]> = signal([]);

  ngOnInit(): void {
    this.pageHeaderService.updateHeader(false, 'Benutzer auswählen', '', false);
    this.fetchCustomUsers();
    this.keepCustomUsersUpToDate();
  }

  //#region Event Handlers

  onCustomUserSelected(selectedCustomUser: CustomUser): void {
    this.activeCustomUserService.activeCustomUser = selectedCustomUser;
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

  private keepCustomUsersUpToDate(): void {
    this.customUserBackendService.customUsersChanged$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.fetchCustomUsers());
  }

  private fetchCustomUsers(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.customUserBackendService
      .getAllCustomUsers()
      .pipe(take(1))
      .subscribe({
        next: (customUsers) => {
          this.customUsers.set(structuredClone(customUsers));
          this.isLoading.set(false);
        },
        // error seems to always occur once therefore don't show snackbar (not reproducible locally for some reason)
        error: (error) => {
          console.error('failed to fetch customUsers: ', error);
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  //#endregion
}
