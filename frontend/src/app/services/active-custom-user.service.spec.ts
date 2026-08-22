import { TestBed } from '@angular/core/testing';

import { ActiveCustomUserService } from './active-custom-user.service';

describe('ActiveCustomUserService', () => {
  let service: ActiveCustomUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveCustomUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
