import { HttpClient } from '@angular/common/http';
import {
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from '../../../environments/environment';

const backendUrl: string = environment.backendUrl;

@Injectable({
  providedIn: 'root',
})
export class BackendMetaService {
  private readonly httpClient = inject(HttpClient);

  private _backendVersion: WritableSignal<string | undefined> =
    signal(undefined);

  constructor() {
    this.getBackendVersion()
      .pipe(take(1))
      .subscribe({
        next: (version) => this._backendVersion.set(version),
      });
  }

  get backendVersion(): Signal<string | undefined> {
    return this._backendVersion;
  }

  private getBackendVersion = (): Observable<string> =>
    this.httpClient.get(backendUrl + '/meta/version', { responseType: 'text' });
}
