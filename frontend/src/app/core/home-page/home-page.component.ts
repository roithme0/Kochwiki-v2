import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PageHeaderService } from '../../services/page-header.service';
import { VERSION } from '../../../version';
import { BackendMetaService } from '../services/backend-meta.service';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  readonly pageHeaderService = inject(PageHeaderService);
  readonly backendMetaService = inject(BackendMetaService);

  readonly frontendVersion: string = VERSION;
  ngOnInit(): void {
    this.pageHeaderService.updateHeader(true, 'Home', '', false);
  }
}
