import { TestBed } from '@angular/core/testing';

import { BackendMetaService } from './backend-meta.service';

describe('BackendMetaService', () => {
  let service: BackendMetaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackendMetaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
