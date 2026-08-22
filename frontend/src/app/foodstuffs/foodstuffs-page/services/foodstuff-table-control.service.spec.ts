import { TestBed } from '@angular/core/testing';

import { FoodstuffTableControlService } from './foodstuff-table-control.service';

describe('FoodstuffTableControlService', () => {
  let service: FoodstuffTableControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodstuffTableControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
