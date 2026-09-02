import {
  createEnvironmentInjector,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
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

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

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

  it('loads recipes initially and after recipe changes', async () => {
    getAllRecipes.and.returnValues(
      Promise.resolve([recipe(1, 'Suppe')]),
      Promise.resolve([recipe(2, 'Salat')])
    );
    const component = TestBed.runInInjectionContext(
      () => new RecipesPageComponent()
    );

    component.ngOnInit();
    recipesChanged$.next();
    await Promise.resolve();

    expect(getAllRecipes).toHaveBeenCalledTimes(2);
    expect(component.recipesState()).toEqual({
      status: 'success',
      data: [recipe(2, 'Salat')],
    });
  });

  it('retains loaded recipes and reports a refresh error', async () => {
    const loadedRecipes = [recipe(1, 'Suppe')];
    getAllRecipes.and.returnValues(
      Promise.resolve(loadedRecipes),
      Promise.reject(new Error('request failed'))
    );
    const component = TestBed.runInInjectionContext(
      () => new RecipesPageComponent()
    );

    component.ngOnInit();
    await Promise.resolve();
    recipesChanged$.next();
    await Promise.resolve();

    expect(component.recipesState()).toEqual({
      status: 'error',
      data: loadedRecipes,
    });
    expect(snackBarOpen).toHaveBeenCalledOnceWith(
      'Rezepte konnten nicht geladen werden'
    );
  });

  it('ignores a late request success after destruction', async () => {
    const deferred = createDeferred<ReturnType<typeof recipe>[]>();
    getAllRecipes.and.returnValue(deferred.promise);
    const injector = createEnvironmentInjector(
      [],
      TestBed.inject(EnvironmentInjector)
    );
    const component = runInInjectionContext(
      injector,
      () => new RecipesPageComponent()
    );

    component.ngOnInit();
    injector.destroy();
    deferred.resolve([recipe(1, 'Suppe')]);
    await Promise.resolve();

    expect(component.recipesState()).toEqual({ status: 'loading', data: [] });
    expect(snackBarOpen).not.toHaveBeenCalled();
  });
});
