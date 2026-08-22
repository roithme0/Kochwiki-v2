import { Routes } from '@angular/router';
import { HomePageComponent } from './core/home-page/home-page.component';
import { FoodstuffsPageComponent } from './foodstuffs/foodstuffs-page/foodstuffs-page.component';
import { RecipesPageComponent } from './recipes/recipes-page/recipes-page.component';
import { RecipePageComponent } from './recipes/recipe-page/recipe-page.component';
import { ShoppingListPageComponent } from './shopping-list/shopping-list-page/shopping-list-page.component';
import { SelectCustomUserPageComponent } from './core/select-custom-user-page/select-custom-user-page.component';
import { AuthGuard } from './core/classes/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'Home',
    canActivate: [AuthGuard],
  },
  {
    path: 'shoppingList',
    component: ShoppingListPageComponent,
    title: 'Einkaufsliste',
    canActivate: [AuthGuard],
  },
  {
    path: 'foodstuffs',
    component: FoodstuffsPageComponent,
    title: 'Lebensmittel',
    canActivate: [AuthGuard],
  },
  {
    path: 'recipes',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: RecipesPageComponent,
        title: 'Rezepte',
      },
      {
        path: ':id',
        component: RecipePageComponent,
        title: 'Rezept',
      },
    ],
  },
  {
    path: 'userSelection',
    component: SelectCustomUserPageComponent,
    title: 'Benutzer auswählen',
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
