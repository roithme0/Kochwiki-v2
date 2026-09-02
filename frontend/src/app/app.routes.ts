import { Routes } from '@angular/router';
import { HomePageComponent } from './core/home-page/home-page.component';
import { FoodstuffsPageComponent } from './foodstuffs/foodstuffs-page/foodstuffs-page.component';
import { RecipesPageComponent } from './recipes/recipes-page/recipes-page.component';
import { RecipePageComponent } from './recipes/recipe-page/recipe-page.component';
import { SelectUserPageComponent } from './core/select-user-page/select-user-page.component';
import { AuthGuard } from './core/classes/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'Home',
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
    component: SelectUserPageComponent,
    title: 'Benutzer auswählen',
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
