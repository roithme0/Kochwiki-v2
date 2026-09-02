import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { FoodstuffBackendService } from '../../../foodstuffs/services/foodstuff-backend.service';
import { Recipe } from '../../interfaces/recipe';
import { RecipeBackendService } from '../../services/recipe-backend.service';
import { SnackBarService } from '../../../services/snack-bar.service';
import { RecipeEditorComponent } from './recipe-editor.component';

describe('RecipeEditorComponent', () => {
  let fixture: ComponentFixture<RecipeEditorComponent>;
  let component: RecipeEditorComponent;
  let foodstuffBackend: { getAllFoodstuffs: jasmine.Spy; foodstuffsChanged$: Subject<void> };
  let recipeBackend: { getRecipeById: jasmine.Spy };

  const recipe: Recipe = {
    id: 1,
    name: 'Linsensuppe',
    servings: 2,
    preptime: 20,
    originName: null,
    originUrl: null,
    kcal: null,
    carbs: null,
    protein: null,
    fat: null,
    ingredients: [],
    steps: [],
  };

  beforeEach(async () => {
    foodstuffBackend = {
      getAllFoodstuffs: jasmine.createSpy('getAllFoodstuffs').and.resolveTo([]),
      foodstuffsChanged$: new Subject<void>(),
    };
    recipeBackend = {
      getRecipeById: jasmine.createSpy('getRecipeById').and.resolveTo(recipe),
    };

    await TestBed.configureTestingModule({
      imports: [RecipeEditorComponent],
      providers: [
        { provide: FoodstuffBackendService, useValue: foodstuffBackend },
        { provide: RecipeBackendService, useValue: recipeBackend },
        { provide: SnackBarService, useValue: { open: jasmine.createSpy('open') } },
        { provide: MatDialog, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeEditorComponent);
    component = fixture.componentInstance;
  });

  it('becomes ready only after recipe and foodstuff data load', async () => {
    fixture.componentRef.setInput('recipeId', recipe.id);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(recipeBackend.getRecipeById).toHaveBeenCalledOnceWith(recipe.id);
    expect(component.recipe()).toEqual(recipe);
    expect(component.state()).toEqual({ status: 'ready' });
  });

  it('reports a recipe-specific error when the recipe request fails', async () => {
    recipeBackend.getRecipeById.and.rejectWith(new Error('Recipe not found'));
    fixture.componentRef.setInput('recipeId', recipe.id);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.state()).toEqual({ status: 'error', source: 'recipe' });
    expect(component.errorMessage()).toBe('Rezept konnte nicht geladen werden.');
  });
});
