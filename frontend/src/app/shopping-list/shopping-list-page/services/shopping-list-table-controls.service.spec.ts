import { TestBed } from '@angular/core/testing';

import { ShoppingListTableControlsService } from './shopping-list-table-controls.service';

describe('ShoppingListTableControlsService', () => {
  let service: ShoppingListTableControlsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShoppingListTableControlsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
