import { TestBed } from '@angular/core/testing';

import { FoodstuffTableDisplayedFieldsService } from './foodstuff-table-displayed-fields.service';

describe('FoodstuffTableDisplayedFieldsService', () => {
  let service: FoodstuffTableDisplayedFieldsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodstuffTableDisplayedFieldsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
