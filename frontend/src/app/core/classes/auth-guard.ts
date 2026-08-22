import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ActiveCustomUserService } from '../../services/active-custom-user.service';
import { CustomUser } from '../../interfaces/custom-user';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  readonly activeCustomUserService = inject(ActiveCustomUserService);
  readonly router = inject(Router);

  canActivate(): boolean {
    const user: CustomUser | null =
      this.activeCustomUserService.activeCustomUser();
    if (user != null) {
      return true;
    } else {
      this.router.navigate(['/userSelection']);
      return false;
    }
  }
}
