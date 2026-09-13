import {
  Injectable,
  Signal,
  WritableSignal,
  inject,
  isDevMode,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../models/user';
import { SnackBarService } from './snack-bar.service';
import { Router } from '@angular/router';
import { UserBackendService } from './user-backend.service';

export const ACTIVE_USER_STORAGE_KEY: string = 'activeUser';

interface StoredUserSelection {
  id: number;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class ActiveUserService {
  private readonly snackBarService = inject(SnackBarService);
  private readonly router = inject(Router);
  private readonly userBackendService = inject(UserBackendService);

  private _activeUser: WritableSignal<User | null> = signal(null);

  constructor() {
    const restoredUser: User | null = this.readStoredUser();
    if (restoredUser !== null) {
      this._activeUser.set(restoredUser);
      void this.reconcileActiveUser(restoredUser.id);
    }
  }

  get activeUser(): Signal<User | null> {
    return this._activeUser;
  }

  selectUser(value: User): void {
    if (!this.isUser(value)) {
      return;
    }

    this._activeUser.set(value);
    this.storeUser(value);
    this.snackBarService.open('Als ' + value.username + ' angemeldet');
  }

  //#region Public Methods

  switchUser(): void {
    this._activeUser.set(null);
    this.clearStoredUser();
    this.router.navigate(['/userSelection']);
  }

  //#endregion

  //#endregion Utilities

  private async reconcileActiveUser(userId: number): Promise<void> {
    try {
      const user: User = await this.userBackendService.getUserById(userId);
      if (this._activeUser()?.id !== userId) {
        return;
      }

      this._activeUser.set(user);
      this.storeUser(user);
    } catch (error: unknown) {
      if (this._activeUser()?.id !== userId) {
        return;
      }

      if (error instanceof HttpErrorResponse && error.status === 404) {
        this._activeUser.set(null);
        this.clearStoredUser();
        void this.router.navigate(['/userSelection']);
        return;
      }

      if (isDevMode()) {
        console.warn('failed to reconcile selected user: ', error);
      }
    }
  }

  private readStoredUser(): User | null {
    const storage: Storage | null = this.getStorage();
    if (storage === null) {
      return null;
    }

    try {
      const user: User | null = this.parseUser(storage.getItem(ACTIVE_USER_STORAGE_KEY));
      if (user === null) {
        storage.removeItem(ACTIVE_USER_STORAGE_KEY);
      }
      return user;
    } catch {
      return null;
    }
  }

  private storeUser(user: User): void {
    const storage: Storage | null = this.getStorage();
    if (storage === null) {
      return;
    }

    try {
      const selection: StoredUserSelection = { id: user.id, username: user.username };
      storage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(selection));
    } catch {
      return;
    }
  }

  private clearStoredUser(): void {
    const storage: Storage | null = this.getStorage();
    if (storage === null) {
      return;
    }

    try {
      storage.removeItem(ACTIVE_USER_STORAGE_KEY);
    } catch {
      return;
    }
  }

  private getStorage(): Storage | null {
    try {
      return localStorage;
    } catch {
      return null;
    }
  }

  private parseUser(rawUser: string | null): User | null {
    if (rawUser === null || rawUser === '') {
      return null;
    }

    try {
      const parsedUser: unknown = JSON.parse(rawUser);
      if (!this.isUser(parsedUser)) {
        return null;
      }
      return parsedUser;
    } catch {
      return null;
    }
  }

  private isUser(value: unknown): value is User {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate: Record<string, unknown> = value as Record<string, unknown>;
    return (
      typeof candidate['id'] === 'number' &&
      Number.isInteger(candidate['id']) &&
      candidate['id'] > 0 &&
      typeof candidate['username'] === 'string'
    );
  }

  //#endregion
}
