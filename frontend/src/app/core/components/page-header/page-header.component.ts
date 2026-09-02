import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { environment } from '../../../../environments/environment';
import { ActiveUserService } from '../../../services/active-user.service';
import { PageHeaderService } from '../../../services/page-header.service';
import { BackendMetaService } from '../../services/backend-meta.service';

@Component({
  selector: 'app-page-header',
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  readonly pageHeaderService = inject(PageHeaderService);
  readonly activeUserService = inject(ActiveUserService);
  readonly backendMetaService = inject(BackendMetaService);

  readonly environmentName: string = environment.name;
}
