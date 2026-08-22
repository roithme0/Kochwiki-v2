import { TestBed } from '@angular/core/testing';

import { FoodstuffBackendService } from './foodstuff-backend.service';

describe('FoodstuffBackendService', () => {
  let service: FoodstuffBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodstuffBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
