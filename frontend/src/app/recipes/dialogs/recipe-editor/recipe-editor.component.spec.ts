import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { FoodstuffBackendService } from '../../../foodstuffs/services/foodstuff-backend.service';
import { RecipeVersion } from '../../models/recipe';
import { RecipeBackendService } from '../../services/recipe-backend.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { RecipeEditorComponent } from './recipe-editor.component';

describe('RecipeEditorComponent', () => {
  let fixture: ComponentFixture<RecipeEditorComponent>;
  let component: RecipeEditorComponent;
  let foodstuffBackend: { getAllFoodstuffs: jasmine.Spy; foodstuffsChanged$: Subject<void> };
  let recipeBackend: { getActiveRecipeVersion: jasmine.Spy; getRecipeVersion: jasmine.Spy };

  const recipeVersion: RecipeVersion = {
    recipeLineageId: '00000000-0000-4000-8000-000000000001',
    recipeVersionId: '00000000-0000-0000-0000-000000000001',
    state: 'active',
    createdAt: '2026-09-10T10:00:00Z',
    lastModified: '2026-09-10T10:00:00Z',
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
      getActiveRecipeVersion: jasmine.createSpy('getActiveRecipeVersion').and.resolveTo(recipeVersion),
      getRecipeVersion: jasmine.createSpy('getRecipeVersion').and.resolveTo(recipeVersion),
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
    fixture.componentRef.setInput('recipeLineageId', recipeVersion.recipeLineageId);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(recipeBackend.getActiveRecipeVersion).toHaveBeenCalledOnceWith(recipeVersion.recipeLineageId);
    expect(component.recipeVersion()).toEqual(recipeVersion);
    expect(component.state()).toEqual({ status: 'ready' });
  });

  it('reports a recipe-specific error when the recipe request fails', async () => {
    recipeBackend.getActiveRecipeVersion.and.rejectWith(new Error('Recipe not found'));
    fixture.componentRef.setInput('recipeLineageId', recipeVersion.recipeLineageId);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.state()).toEqual({ status: 'error', source: 'recipeVersion' });
    expect(component.errorMessage()).toBe('Rezept konnte nicht geladen werden.');
  });
});
