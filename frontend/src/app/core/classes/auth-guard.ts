import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ActiveUserService } from '../../services/active-user.service';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  readonly activeUserService = inject(ActiveUserService);
  readonly router = inject(Router);

  canActivate(): boolean {
    const user: User | null = this.activeUserService.activeUser();
    if (user != null) {
      return true;
    } else {
      this.router.navigate(['/userSelection']);
      return false;
    }
  }
}
