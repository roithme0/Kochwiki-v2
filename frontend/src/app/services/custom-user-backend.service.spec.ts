import { TestBed } from '@angular/core/testing';

import { CustomUserBackendService } from './custom-user-backend.service';

describe('CustomUserBackendService', () => {
  let service: CustomUserBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomUserBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
