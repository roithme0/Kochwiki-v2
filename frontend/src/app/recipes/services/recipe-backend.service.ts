import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RecipeVersion, RecipeVersionWrite } from '../models/recipe';
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

  getAllRecipeVersions = (): Promise<RecipeVersion[]> =>
    firstValueFrom(this.httpClient.get<RecipeVersion[]>(backendUrl + '/recipes'));

  getActiveRecipeVersion = (recipeLineageId: string): Promise<RecipeVersion> =>
    firstValueFrom(this.httpClient.get<RecipeVersion>(backendUrl + '/recipes/' + recipeLineageId));

  getRecipeVersion = (recipeLineageId: string, recipeVersionId: string): Promise<RecipeVersion> =>
    firstValueFrom(
      this.httpClient.get<RecipeVersion>(backendUrl + '/recipes/' + recipeLineageId + '/versions/' + recipeVersionId)
    );

  createRecipe = (recipeVersion: RecipeVersionWrite): Promise<RecipeVersion> =>
    firstValueFrom(this.httpClient.post<RecipeVersion>(backendUrl + '/recipes', recipeVersion));

  publishActiveRecipeEdit = (recipeLineageId: string, recipeVersion: RecipeVersionWrite): Promise<RecipeVersion> =>
    firstValueFrom(this.httpClient.post<RecipeVersion>(backendUrl + '/recipes/' + recipeLineageId + '/publish', recipeVersion));

  createRecipeDraft = (recipeLineageId: string, recipeVersion: RecipeVersionWrite): Promise<RecipeVersion> =>
    firstValueFrom(this.httpClient.post<RecipeVersion>(backendUrl + '/recipes/' + recipeLineageId + '/drafts', recipeVersion));

  updateRecipeDraft = (recipeLineageId: string, recipeVersionId: string, recipeVersion: RecipeVersionWrite): Promise<RecipeVersion> =>
    firstValueFrom(this.httpClient.put<RecipeVersion>(backendUrl + '/recipes/' + recipeLineageId + '/drafts/' + recipeVersionId, recipeVersion));

  publishRecipeDraft = (recipeLineageId: string, recipeVersionId: string): Promise<RecipeVersion> =>
    firstValueFrom(this.httpClient.post<RecipeVersion>(backendUrl + '/recipes/' + recipeLineageId + '/drafts/' + recipeVersionId + '/publish', {}));

  discardRecipeDraft = (recipeLineageId: string, recipeVersionId: string): Promise<void> =>
    firstValueFrom(this.httpClient.delete<void>(backendUrl + '/recipes/' + recipeLineageId + '/drafts/' + recipeVersionId));

  deleteRecipeLineage = (recipeLineageId: string): Promise<void> =>
    firstValueFrom(this.httpClient.delete<void>(backendUrl + '/recipes/' + recipeLineageId));
}
