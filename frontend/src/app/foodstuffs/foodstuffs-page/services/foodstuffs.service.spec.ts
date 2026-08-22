import { TestBed } from '@angular/core/testing';

import { FoodstuffsService } from './foodstuffs.service';

describe('FoodstuffsService', () => {
  let service: FoodstuffsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodstuffsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
