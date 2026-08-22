import { TestBed } from '@angular/core/testing';

import { ShoppingListBackendService } from './shopping-list-backend.service';

describe('ShoppingListBackendService', () => {
  let service: ShoppingListBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShoppingListBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
