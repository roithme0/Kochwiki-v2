import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Recipe, RecipeWrite } from '../interfaces/recipe';
import { firstValueFrom, Subject } from 'rxjs';
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

  getAllRecipes = (): Promise<Recipe[]> =>
    firstValueFrom(this.httpClient.get<Recipe[]>(backendUrl + '/recipes'));

  getRecipeById = (id: number): Promise<Recipe> =>
    firstValueFrom(this.httpClient.get<Recipe>(backendUrl + '/recipes/' + id));

  patchRecipe = (id: number, updates: Partial<RecipeWrite>): Promise<Recipe> =>
    firstValueFrom(
      this.httpClient.patch<Recipe>(backendUrl + '/recipes/' + id, updates)
    );

  postRecipe = (recipe: RecipeWrite): Promise<Recipe> =>
    firstValueFrom(this.httpClient.post<Recipe>(backendUrl + '/recipes', recipe));

  deleteRecipe = (id: number): Promise<number> =>
    firstValueFrom(this.httpClient.delete<number>(backendUrl + '/recipes/' + id));
}
