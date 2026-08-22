import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ShoppingList } from '../interfaces/shopping-list';
import { CustomUser } from '../../interfaces/custom-user';
import { ActiveCustomUserService } from '../../services/active-custom-user.service';
import { environment } from '../../../environments/environment';
import { Ingredient } from '../../recipes/interfaces/ingredient';
import { ShoppingListItemIngredient } from '../interfaces/shopping-list-item-ingredient';
import { ShoppingListItemVerboseNames } from '../interfaces/shopping-list-meta-data';

const backendUrl = environment.backendUrl;

@Injectable({
  providedIn: 'root',
})
export class ShoppingListBackendService {
  private readonly httpClient = inject(HttpClient);
  private readonly activeCustomUserService = inject(ActiveCustomUserService);

  public getShoppingListByCustomUserId(
    customUserId: number
  ): Observable<ShoppingList> {
    return this.httpClient.get<ShoppingList>(
      backendUrl + '/shoppingLists/' + customUserId
    );
  }

  public addIngredient(
    ingredient: Ingredient,
    servings: number
  ): Observable<ShoppingList> {
    const activeCustomUser: CustomUser | null =
      this.activeCustomUserService.activeCustomUser();
    if (activeCustomUser === null) {
      console.error('No active custom user found.');
      return new Observable<ShoppingList>();
    }

    return this.httpClient.patch<ShoppingList>(
      backendUrl + '/shoppingLists/addIngredient',
      {
        customUserId: activeCustomUser.id,
        ingredientId: ingredient.id,
        amount: ingredient.amount * servings,
      }
    );
  }

  public removeIngredient(ingredient: Ingredient): Observable<ShoppingList> {
    const activeCustomUser: CustomUser | null =
      this.activeCustomUserService.activeCustomUser();
    if (activeCustomUser === null) {
      console.error('No active custom user found.');
      return new Observable<ShoppingList>();
    }

    return this.httpClient.patch<ShoppingList>(
      backendUrl + '/shoppingLists/removeIngredient',
      {
        customUserId: activeCustomUser.id,
        ingredientId: ingredient.id,
      }
    );
  }

  public setIsChecked(
    itemIngredient: ShoppingListItemIngredient,
    newIsChecked: boolean
  ): Observable<ShoppingListItemIngredient> {
    const activeCustomUser: CustomUser | null =
      this.activeCustomUserService.activeCustomUser();
    if (activeCustomUser === null) {
      console.error('No active custom user found.');
      return new Observable<ShoppingListItemIngredient>();
    }

    return this.httpClient.patch<ShoppingListItemIngredient>(
      backendUrl + '/shoppingLists/ingredientIsChecked',
      {
        customUserId: activeCustomUser.id,
        itemIngredientId: itemIngredient.id,
        isChecked: newIsChecked,
      }
    );
  }

  public setIsPinned(
    itemIngredient: ShoppingListItemIngredient,
    newIsPinned: boolean
  ): Observable<ShoppingListItemIngredient> {
    const activeCustomUser: CustomUser | null =
      this.activeCustomUserService.activeCustomUser();
    if (activeCustomUser === null) {
      console.error('No active custom user found.');
      return new Observable<ShoppingListItemIngredient>();
    }

    return this.httpClient.patch<ShoppingListItemIngredient>(
      backendUrl + '/shoppingLists/ingredientIsPinned',
      {
        customUserId: activeCustomUser.id,
        itemIngredientId: itemIngredient.id,
        isPinned: newIsPinned,
      }
    );
  }

  public clearChecked(): Observable<ShoppingList> {
    const activeCustomUser: CustomUser | null =
      this.activeCustomUserService.activeCustomUser();
    if (activeCustomUser === null) {
      console.error('No active custom user found.');
      return new Observable<ShoppingList>();
    }

    return this.httpClient.patch<ShoppingList>(
      backendUrl + '/shoppingLists/clearChecked',
      activeCustomUser.id
    );
  }

  fetchShoppingItemVerboseNames(): Observable<ShoppingListItemVerboseNames> {
    return this.httpClient.get<ShoppingListItemVerboseNames>(
      backendUrl + '/shopping-list-item-meta-data/verbose-names'
    );
  }
}
