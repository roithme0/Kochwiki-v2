import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodstuffsTableComponent } from './foodstuffs-table/foodstuffs-table.component';
import { FoodstuffsTableCreateFoodstuffComponent } from './foodstuffs-table-create-foodstuff/foodstuffs-table-create-foodstuff.component';
import { PageHeaderService } from '../../services/page-header.service';
import { FoodstuffsService } from './services/foodstuffs.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { FoodstuffsSearchComponent } from './foodstuffs-search/foodstuffs-search.component';

@Component({
  selector: 'app-foodstuffs-page',
  imports: [
    CommonModule,
    FoodstuffsTableComponent,
    FoodstuffsTableCreateFoodstuffComponent,
    MatProgressSpinnerModule,
    MatIconModule,
    FoodstuffsSearchComponent,
  ],
  templateUrl: './foodstuffs-page.component.html',
  styleUrl: './foodstuffs-page.component.scss',
})
export class FoodstuffsPageComponent {
  readonly pageHeaderService = inject(PageHeaderService);
  readonly foodstuffsService = inject(FoodstuffsService);

  ngOnInit() {
    this.pageHeaderService.updateHeader(true, 'Lebensmittel', '', true);
  }
}
