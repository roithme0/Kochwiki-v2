import { Component, inject } from '@angular/core';
import { PageHeaderService } from '../../services/page-header.service';
import { ShoppingListService } from './services/shopping-list.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ShoppingListTableComponent } from './shopping-list-table/shopping-list-table.component';
import { ShoppingListTableControlsComponent } from './shopping-list-table-controls/shopping-list-table-controls.component';
import { ShoppingListTableButtonsComponent } from './shopping-list-table-buttons/shopping-list-table-buttons.component';

@Component({
  selector: 'app-shopping-list-page',
  imports: [
    MatProgressSpinnerModule,
    MatIconModule,
    ShoppingListTableComponent,
    ShoppingListTableControlsComponent,
    ShoppingListTableButtonsComponent,
  ],
  templateUrl: './shopping-list-page.component.html',
  styleUrl: './shopping-list-page.component.scss',
})
export class ShoppingListPageComponent {
  pageHeaderService = inject(PageHeaderService);
  shoppingListService = inject(ShoppingListService);

  ngOnInit(): void {
    this.pageHeaderService.updateHeader(true, 'Einkaufsliste', '', true);
  }
}
