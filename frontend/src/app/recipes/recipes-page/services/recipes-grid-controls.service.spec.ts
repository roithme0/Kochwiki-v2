import { TestBed } from '@angular/core/testing';

import { RecipesGridControlsService } from './recipes-grid-controls.service';

describe('RecipesGridControlsService', () => {
  let service: RecipesGridControlsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecipesGridControlsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
