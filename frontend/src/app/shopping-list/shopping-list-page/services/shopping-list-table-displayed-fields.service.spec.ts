import { TestBed } from '@angular/core/testing';

import { ShoppingListTableDisplayedFieldsService } from './shopping-list-table-displayed-fields.service';

describe('ShoppingListTableDisplayedFieldsService', () => {
  let service: ShoppingListTableDisplayedFieldsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShoppingListTableDisplayedFieldsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
