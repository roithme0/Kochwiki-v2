import { TestBed } from '@angular/core/testing';

import { RecipeBackendService } from './recipe-backend.service';

describe('RecipeBackendService', () => {
  let service: RecipeBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecipeBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
