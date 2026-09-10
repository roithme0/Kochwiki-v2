import { Routes } from '@angular/router';
import { HomePageComponent } from './core/home-page/home-page.component';
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
    loadComponent: () =>
      import('./foodstuffs/foodstuffs-page/foodstuffs-page.component').then(
        ({ FoodstuffsPageComponent }) => FoodstuffsPageComponent,
      ),
    title: 'Lebensmittel',
    canActivate: [AuthGuard],
  },
  {
    path: 'recipes',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./recipes/recipes-page/recipes-page.component').then(
            ({ RecipesPageComponent }) => RecipesPageComponent,
          ),
        title: 'Rezepte',
      },
      {
        path: ':lineageId/versions/:recipeVersionId',
        loadComponent: () =>
          import('./recipes/recipe-page/recipe-page.component').then(
            ({ RecipePageComponent }) => RecipePageComponent,
          ),
        title: 'Rezeptversion',
      },
      {
        path: ':lineageId',
        loadComponent: () =>
          import('./recipes/recipe-page/recipe-page.component').then(
            ({ RecipePageComponent }) => RecipePageComponent,
          ),
        title: 'Rezept',
      },
    ],
  },
  {
    path: 'userSelection',
    loadComponent: () =>
      import('./core/select-user-page/select-user-page.component').then(
        ({ SelectUserPageComponent }) => SelectUserPageComponent,
      ),
    title: 'Benutzer auswählen',
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
