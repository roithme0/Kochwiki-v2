import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject, throwError } from 'rxjs';
import { PageHeaderService } from '../../services/page-header.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { RecipeBackendService } from '../services/recipe-backend.service';
import { RecipesPageComponent } from './recipes-page.component';

const recipe = (id: number, name: string) => ({
  id,
  name,
  servings: 1,
  preptime: null,
  originName: null,
  originUrl: null,
  kcal: null,
  carbs: null,
  protein: null,
  fat: null,
  ingredients: [],
  steps: [],
});

describe('RecipesPageComponent', () => {
  let recipesChanged$: Subject<void>;
  const getAllRecipes = jasmine.createSpy('getAllRecipes');
  const snackBarOpen = jasmine.createSpy('open');

  beforeEach(() => {
    recipesChanged$ = new Subject<void>();
    getAllRecipes.calls.reset();
    snackBarOpen.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: RecipeBackendService,
          useValue: { recipesChanged$, getAllRecipes },
        },
        { provide: PageHeaderService, useValue: { updateHeader: () => {} } },
        { provide: SnackBarService, useValue: { open: snackBarOpen } },
        { provide: MatDialog, useValue: { open: () => {} } },
      ],
    });
  });

  it('loads recipes initially and after recipe changes', () => {
    getAllRecipes.and.returnValues(
      of([recipe(1, 'Suppe')]),
      of([recipe(2, 'Salat')])
    );
    const component = TestBed.runInInjectionContext(
      () => new RecipesPageComponent()
    );

    component.ngOnInit();
    recipesChanged$.next();

    expect(getAllRecipes).toHaveBeenCalledTimes(2);
    expect(component.recipesState()).toEqual({
      status: 'success',
      data: [recipe(2, 'Salat')],
    });
  });

  it('retains loaded recipes and reports a refresh error', () => {
    const loadedRecipes = [recipe(1, 'Suppe')];
    getAllRecipes.and.returnValues(
      of(loadedRecipes),
      throwError(() => new Error('request failed'))
    );
    const component = TestBed.runInInjectionContext(
      () => new RecipesPageComponent()
    );

    component.ngOnInit();
    recipesChanged$.next();

    expect(component.recipesState()).toEqual({
      status: 'error',
      data: loadedRecipes,
    });
    expect(snackBarOpen).toHaveBeenCalledOnceWith(
      'Rezepte konnten nicht geladen werden'
    );
  });
});
