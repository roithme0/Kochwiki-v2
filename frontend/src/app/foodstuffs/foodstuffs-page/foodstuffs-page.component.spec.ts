import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { RecipeBackendService } from '../../recipes/services/recipe-backend.service';
import { PageHeaderService } from '../../services/page-header.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { FoodstuffBackendService } from '../services/foodstuff-backend.service';
import { FoodstuffsPageComponent } from './foodstuffs-page.component';

const foodstuff = (id: number, name: string) => ({
  id,
  name,
  brand: null,
  unit: 'g',
  unitVerbose: 'Gramm',
  kcal: null,
  carbs: null,
  protein: null,
  fat: null,
  recipeIds: [],
});

describe('FoodstuffsPageComponent', () => {
  let foodstuffsChanged$: Subject<void>;
  let recipesChanged$: Subject<void>;
  const getAllFoodstuffs = jasmine.createSpy('getAllFoodstuffs');
  const snackBarOpen = jasmine.createSpy('open');

  beforeEach(() => {
    foodstuffsChanged$ = new Subject<void>();
    recipesChanged$ = new Subject<void>();
    getAllFoodstuffs.calls.reset();
    snackBarOpen.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FoodstuffBackendService,
          useValue: { foodstuffsChanged$, getAllFoodstuffs },
        },
        { provide: RecipeBackendService, useValue: { recipesChanged$ } },
        { provide: PageHeaderService, useValue: { updateHeader: () => {} } },
        { provide: SnackBarService, useValue: { open: snackBarOpen } },
      ],
    });
  });

  it('loads foodstuffs initially and after foodstuff or recipe changes', () => {
    getAllFoodstuffs.and.returnValues(
      of([foodstuff(1, 'Linsen')]),
      of([foodstuff(2, 'Bohnen')]),
      of([foodstuff(3, 'Hafer')])
    );
    const component = TestBed.runInInjectionContext(
      () => new FoodstuffsPageComponent()
    );

    component.ngOnInit();
    foodstuffsChanged$.next();
    recipesChanged$.next();

    expect(getAllFoodstuffs).toHaveBeenCalledTimes(3);
    expect(component.foodstuffsState()).toEqual({
      status: 'success',
      data: [foodstuff(3, 'Hafer')],
    });
  });

  it('retains loaded foodstuffs and reports a refresh error', () => {
    const loadedFoodstuffs = [foodstuff(1, 'Linsen')];
    getAllFoodstuffs.and.returnValues(
      of(loadedFoodstuffs),
      throwError(() => new Error('request failed'))
    );
    const component = TestBed.runInInjectionContext(
      () => new FoodstuffsPageComponent()
    );

    component.ngOnInit();
    foodstuffsChanged$.next();

    expect(component.foodstuffsState()).toEqual({
      status: 'error',
      data: loadedFoodstuffs,
    });
    expect(snackBarOpen).toHaveBeenCalledOnceWith(
      'Zutaten konnten nicht geladen werden'
    );
  });
});
