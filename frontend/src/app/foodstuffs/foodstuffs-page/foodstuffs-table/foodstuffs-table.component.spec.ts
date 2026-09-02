import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { FoodstuffsTableComponent } from './foodstuffs-table.component';
import { FoodstuffTableDisplayedFieldsService } from '../services/foodstuff-table-displayed-fields.service';
import { FoodstuffMetadataService } from '../../services/foodstuff-metadata.service';
import { FoodstuffTableControlService } from '../services/foodstuff-table-control.service';

describe('FoodstuffsTableComponent', () => {
  let component: FoodstuffsTableComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FoodstuffMetadataService,
          useValue: { verboseNames: signal(null) },
        },
        { provide: FoodstuffTableDisplayedFieldsService, useValue: {} },
        { provide: FoodstuffTableControlService, useValue: { searchBy: signal('') } },
        { provide: MatDialog, useValue: {} },
      ],
    });
    component = TestBed.runInInjectionContext(
      () => new FoodstuffsTableComponent()
    );
  });

  it('disconnects the resize observer when destroyed', () => {
    const resizeObserver = jasmine.createSpyObj<ResizeObserver>(
      'ResizeObserver',
      ['disconnect']
    );
    component.tableWrapperResizeObserver = resizeObserver;

    component.ngOnDestroy();

    expect(resizeObserver.disconnect).toHaveBeenCalledOnceWith();
  });
});
