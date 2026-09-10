import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subject } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../../environments/environment';

const backendUrl: string = environment.backendUrl;

@Injectable({
  providedIn: 'root',
})
export class UserBackendService {
  private readonly httpClient = inject(HttpClient);

  private usersSubject = new Subject<void>();
  usersChanged$ = this.usersSubject.asObservable();

  notifyUsersChanged(): void {
    this.usersSubject.next();
  }

  getAllUsers = (): Promise<User[]> =>
    firstValueFrom(this.httpClient.get<User[]>(backendUrl + '/users'));

  getUserById = (userId: number): Promise<User> =>
    firstValueFrom(this.httpClient.get<User>(backendUrl + '/users/' + userId));

  postUser = (user: Partial<User>): Promise<User> =>
    firstValueFrom(
      this.httpClient.post<User>(backendUrl + '/users', user)
    );
}
