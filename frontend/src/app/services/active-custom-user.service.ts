import {
  Injectable,
  Signal,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { CustomUser } from '../interfaces/custom-user';
import { CookieService } from 'ngx-cookie-service';
import { SnackBarService } from './snack-bar.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ActiveCustomUserService {
  private readonly cookieService = inject(CookieService);
  private readonly snackBarService = inject(SnackBarService);
  private readonly router = inject(Router);

  private _activeCustomUser: WritableSignal<CustomUser | null> = signal(null);

  constructor() {
    this.restoreLogin();
  }

  set activeCustomUser(value: CustomUser) {
    this._activeCustomUser.set(value);
    this.cookieService.set('activeCustomUser', JSON.stringify(value));
    this.snackBarService.open('Als ' + value.username + ' angemeldet');
  }

  get activeCustomUser(): Signal<CustomUser | null> {
    return this._activeCustomUser;
  }

  //#region Public Methods

  logout(): void {
    this._activeCustomUser.set(null);
    this.cookieService.delete('activeCustomUser');
    this.snackBarService.open('Abgemeldet');
    this.router.navigate(['/userSelection']);
  }

  //#endregion

  //#endregion Utilities

  private restoreLogin(): boolean {
    const user = this.cookieService.get('activeCustomUser');
    if (user) {
      try {
        this.activeCustomUser = JSON.parse(user);
        return true;
      } catch (e) {
        console.error(e);
      }
    }
    return false;
  }

  //#endregion
}
