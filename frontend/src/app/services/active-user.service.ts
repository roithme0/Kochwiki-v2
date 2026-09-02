import {
  Injectable,
  Signal,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { User } from '../interfaces/user';
import { CookieService } from 'ngx-cookie-service';
import { SnackBarService } from './snack-bar.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ActiveUserService {
  private readonly cookieService = inject(CookieService);
  private readonly snackBarService = inject(SnackBarService);
  private readonly router = inject(Router);

  private _activeUser: WritableSignal<User | null> = signal(null);

  constructor() {
    this.restoreLogin();
  }

  set activeUser(value: User) {
    this._activeUser.set(value);
    this.cookieService.set('activeUser', JSON.stringify(value));
    this.snackBarService.open('Als ' + value.username + ' angemeldet');
  }

  get activeUser(): Signal<User | null> {
    return this._activeUser;
  }

  //#region Public Methods

  logout(): void {
    this._activeUser.set(null);
    this.cookieService.delete('activeUser');
    this.snackBarService.open('Abgemeldet');
    this.router.navigate(['/userSelection']);
  }

  //#endregion

  //#endregion Utilities

  private restoreLogin(): boolean {
    const user = this.cookieService.get('activeUser');
    if (user) {
      try {
        this.activeUser = JSON.parse(user);
        return true;
      } catch (e) {
        console.error(e);
      }
    }
    return false;
  }

  //#endregion
}
