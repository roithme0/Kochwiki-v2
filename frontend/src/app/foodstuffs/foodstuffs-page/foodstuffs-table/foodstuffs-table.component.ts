import {
  Component,
  ViewChild,
  computed,
  effect,
  inject,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Foodstuff } from '../../interfaces/foodstuff';
import { FoodstuffVerboseNames } from '../../interfaces/foodstuff-meta-data';
import { FoodstuffTableDisplayedFieldsService } from '../services/foodstuff-table-displayed-fields.service';
import { FoodstuffsService } from '../services/foodstuffs.service';
import { FoodstuffPatchDialogComponent } from '../../dialogs/foodstuff-patch-dialog/foodstuff-patch-dialog.component';
import { FoodstuffDeleteDialogComponent } from '../../dialogs/foodstuff-delete-dialog/foodstuff-delete-dialog.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FoodstuffTableControlService } from '../services/foodstuff-table-control.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MacroChartComponent } from '../../../core/components/macro-chart/macro-chart.component';

const DEFAULT_PAGE_SIZE: number = 12;

@Component({
  selector: 'app-foodstuffs-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MacroChartComponent,
    MatPaginatorModule,
  ],
  templateUrl: './foodstuffs-table.component.html',
  styleUrl: './foodstuffs-table.component.scss',
})
export class FoodstuffsTableComponent implements OnDestroy {
  readonly displayedFieldsService = inject(
    FoodstuffTableDisplayedFieldsService
  );
  readonly foodstuffsService = inject(FoodstuffsService);
  readonly dialog = inject(MatDialog);
  readonly foodstuffTableControlService = inject(FoodstuffTableControlService);

  @ViewChild('tableWrapper', { static: true })
  readonly tableWrapper!: ElementRef<HTMLElement>;
  @ViewChild(MatSort) readonly sort!: MatSort;
  @ViewChild(MatPaginator) readonly paginator!: MatPaginator;

  tableWrapperResizeObserver = new ResizeObserver(() =>
    this.updateTablePageSize()
  );

  displayedFoodstuffs = computed((): Foodstuff[] => {
    let displayedFoodstuffs = this.foodstuffsService.foodstuffs();
    displayedFoodstuffs =
      this.searchFoodstuffsByNameOrBrand(displayedFoodstuffs);
    return displayedFoodstuffs;
  });
  tableDataSource = new MatTableDataSource<Foodstuff>(
    this.displayedFoodstuffs()
  );

  displayedVerboseNames = computed((): FoodstuffVerboseNames => {
    const verboseNames: FoodstuffVerboseNames | null =
      this.foodstuffsService.verboseNames();
    return verboseNames == null
      ? {
          name: 'Name',
          brand: 'Marke',
          unit: 'Einheit',
          kcal: 'Kalorien',
          carbs: 'Kohlenhydrate',
          protein: 'Protein',
          fat: 'Fett',
        }
      : verboseNames;
  });

  constructor() {
    effect(() => (this.tableDataSource.data = this.displayedFoodstuffs()));
  }

  ngAfterViewInit(): void {
    this.tableDataSource.sort = this.sort;
    this.tableDataSource.paginator = this.paginator;
    this.tableWrapperResizeObserver.observe(this.tableWrapper.nativeElement);
  }

  ngOnDestroy(): void {
    this.tableWrapperResizeObserver.disconnect();
  }

  contentChanged(): void {
    setTimeout(() => {
      this.updateTablePageSize();
    });
  }

  openEditFoodstuffDialog(foodstuff: Foodstuff): void {
    this.dialog.open(FoodstuffPatchDialogComponent, {
      data: { id: foodstuff.id },
      minWidth: 'calc(100vw - 1rem)',
      maxWidth: 'calc(100vw - 1rem)',
      maxHeight: 'calc(100vh - 1rem)',
      position: { top: '0.5rem', left: '0.5rem' },
      autoFocus: false,
      disableClose: true,
    });
  }

  openDeleteFoodstuffDialog(foodstuff: Foodstuff): void {
    this.dialog.open(FoodstuffDeleteDialogComponent, {
      data: { id: foodstuff.id },
      maxWidth: '95vw',
      maxHeight: '95vh',
      autoFocus: false,
    });
  }

  private searchFoodstuffsByNameOrBrand(foodstuffs: Foodstuff[]): Foodstuff[] {
    const searchBy: string = this.foodstuffTableControlService.searchBy();
    return searchBy === ''
      ? foodstuffs
      : foodstuffs.filter(
          (foodstuff) =>
            foodstuff.name.toLowerCase().includes(searchBy.toLowerCase()) ||
            foodstuff.brand?.toLowerCase().includes(searchBy.toLowerCase())
        );
  }

  private updateTablePageSize(): void {
    if (this.tableWrapper == null || this.paginator == null) return;

    const wrapperHeight: number = this.tableWrapper.nativeElement.offsetHeight;
    const rowHeight: number = 36;
    const headerHeight: number = 26;
    const paginatorHeight: number = 40;
    const availableHeight: number =
      wrapperHeight - headerHeight - paginatorHeight;
    const rowsPerPage: number = Math.floor(availableHeight / rowHeight);
    const newPageSize: number =
      rowsPerPage > 0 ? rowsPerPage : DEFAULT_PAGE_SIZE;
    if (this.paginator.pageSize !== newPageSize) {
      this.paginator.pageSize = newPageSize;
      this.tableDataSource.paginator = this.paginator; // updates the table to reflect the new page size
    }
  }
}
