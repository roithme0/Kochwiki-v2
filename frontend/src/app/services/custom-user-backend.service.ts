import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { CustomUser } from '../interfaces/custom-user';
import { environment } from '../../environments/environment';

const backendUrl: string = environment.backendUrl;

@Injectable({
  providedIn: 'root',
})
export class CustomUserBackendService {
  private readonly httpClient = inject(HttpClient);

  private customUsersSubject = new Subject<void>();
  customUsersChanged$ = this.customUsersSubject.asObservable();

  notifyCustomUsersChanged() {
    this.customUsersSubject.next();
  }

  getAllCustomUsers = (): Observable<CustomUser[]> =>
    this.httpClient.get<CustomUser[]>(backendUrl + '/users');

  getCustomUserByUsername = (username: string): Observable<CustomUser> =>
    this.httpClient.get<CustomUser>(backendUrl + '/users/' + username);

  postCustomUser = (customUser: Partial<CustomUser>): Observable<CustomUser> =>
    this.httpClient.post<CustomUser>(backendUrl + '/users', customUser);
}
