import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { User } from '../interfaces/user';
import { UserBackendService } from './user-backend.service';

describe('UserBackendService', () => {
  let service: UserBackendService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserBackendService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('fetches one user by stable id', async () => {
    const user: User = { id: 7, username: 'Roi' };

    const responsePromise: Promise<User> = service.getUserById(user.id);

    const request = httpTesting.expectOne(
      `${environment.backendUrl}/users/${user.id}`
    );
    expect(request.request.method).toBe('GET');
    request.flush(user);

    await expectAsync(responsePromise).toBeResolvedTo(user);
  });
});
