import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  private readonly snackBarService = inject(MatSnackBar);

  open(text: string): void {
    setTimeout(() => {
      this.snackBarService.open(text, '', {
        duration: 2000,
      });
    }, 0);
  }
}
