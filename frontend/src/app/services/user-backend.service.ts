import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { User } from '../interfaces/user';
import { environment } from '../../environments/environment';

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

  getAllUsers = (): Observable<User[]> =>
    this.httpClient.get<User[]>(backendUrl + '/users');

  getUserByUsername = (username: string): Observable<User> =>
    this.httpClient.get<User>(backendUrl + '/users/' + username);

  postUser = (user: Partial<User>): Observable<User> =>
    this.httpClient.post<User>(backendUrl + '/users', user);
}
