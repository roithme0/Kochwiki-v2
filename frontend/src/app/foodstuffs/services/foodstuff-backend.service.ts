import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Foodstuff } from '../interfaces/foodstuff';
import {
  FoodstuffVerboseNames,
  FoodstuffUnitChoices,
} from '../interfaces/foodstuff-meta-data';
import { environment } from '../../../environments/environment';

const backendUrl: string = environment.backendUrl;

@Injectable({
  providedIn: 'root',
})
export class FoodstuffBackendService {
  private readonly httpClient = inject(HttpClient);

  private _foodstuffsChanged$ = new Subject<void>();
  foodstuffsChanged$ = this._foodstuffsChanged$.asObservable();

  notifyFoodstuffsChanged() {
    this._foodstuffsChanged$.next();
  }

  getAllFoodstuffs = (): Observable<Foodstuff[]> =>
    this.httpClient.get<Foodstuff[]>(backendUrl + '/foodstuffs');

  getFoodstuffById = (id: number): Observable<Foodstuff> =>
    this.httpClient.get<Foodstuff>(backendUrl + '/foodstuffs/' + id);

  patchFoodstuff = (
    id: number,
    updates: Partial<Foodstuff>
  ): Observable<Foodstuff> =>
    this.httpClient.patch<Foodstuff>(backendUrl + '/foodstuffs/' + id, updates);

  postFoodstuff = (foodstuff: Partial<Foodstuff>): Observable<Foodstuff> =>
    this.httpClient.post<Foodstuff>(backendUrl + '/foodstuffs', foodstuff);

  deleteFoodstuff = (id: number): Observable<number> =>
    this.httpClient.delete<number>(backendUrl + '/foodstuffs/' + id);

  fetchFoodstuffVerboseNames = (): Observable<FoodstuffVerboseNames> =>
    this.httpClient.get<FoodstuffVerboseNames>(
      backendUrl + '/foodstuffs-meta-data/verbose-names'
    );

  fetchFoodstuffUnitChoices = (): Observable<FoodstuffUnitChoices> =>
    this.httpClient.get<FoodstuffUnitChoices>(
      backendUrl + '/foodstuffs-meta-data/unit-choices'
    );
}
