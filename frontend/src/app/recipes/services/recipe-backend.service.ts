import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Recipe } from '../interfaces/recipe';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

const backendUrl: string = environment.backendUrl;

@Injectable({
  providedIn: 'root',
})
export class RecipeBackendService {
  private readonly httpClient = inject(HttpClient);

  private _recipesChanged$ = new Subject<void>();
  recipesChanged$ = this._recipesChanged$.asObservable();

  notifyRecipesChanged() {
    this._recipesChanged$.next();
  }

  getAllRecipes = (): Observable<Recipe[]> =>
    this.httpClient.get<Recipe[]>(backendUrl + '/recipes');

  getRecipeById = (id: number): Observable<Recipe> =>
    this.httpClient.get<Recipe>(backendUrl + '/recipes/' + id);

  patchRecipe = (id: number, updates: Partial<Recipe>): Observable<Recipe> =>
    this.httpClient.patch<Recipe>(backendUrl + '/recipes/' + id, updates);

  postRecipe = (recipe: Partial<Recipe>): Observable<Recipe> =>
    this.httpClient.post<Recipe>(backendUrl + '/recipes', recipe);

  deleteRecipe = (id: number): Observable<number> =>
    this.httpClient.delete<number>(backendUrl + '/recipes/' + id);
}
