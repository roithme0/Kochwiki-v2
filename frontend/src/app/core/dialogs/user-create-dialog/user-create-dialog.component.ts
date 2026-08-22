import { Component, inject } from '@angular/core';
import { DialogHeaderComponent } from '../../components/dialog-header/dialog-header.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { take } from 'rxjs';
import { CustomUser } from '../../../interfaces/custom-user';
import { CustomUserBackendService } from '../../../services/custom-user-backend.service';
import { SnackBarService } from '../../../services/snack-bar.service';

@Component({
  selector: 'app-user-create-dialog',
  imports: [
    DialogHeaderComponent,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './user-create-dialog.component.html',
  styleUrl: './user-create-dialog.component.scss',
})
export class UserCreateDialogComponent {
  readonly dialogRef = inject(MatDialogRef);
  readonly customUserBackendService = inject(CustomUserBackendService);
  readonly snackBarService = inject(SnackBarService);
  readonly fb = inject(FormBuilder);

  customUserForm = this.fb.group({
    username: ['', Validators.required],
  });

  onSubmit(): void {
    const customUser: Partial<CustomUser> = this.customUserForm
      .value as CustomUser;

    this.customUserBackendService
      .postCustomUser(customUser)
      .pipe(take(1))
      .subscribe({
        next: (customUser: CustomUser) => {
          this.snackBarService.open('Benutzer erstellt');
          this.customUserBackendService.notifyCustomUsersChanged();
          this.dialogRef.close();
        },
        error: (error: any) => {
          console.error('failed to create customUser: ', error);
          this.snackBarService.open('Benutzer konnte nicht erstellt werden');
        },
      });
  }
}
