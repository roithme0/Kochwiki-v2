import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepsGridComponent } from './steps-grid.component';
import { RecipeVersion } from '../../models/recipe';

describe('StepsGridComponent', () => {
  let component: StepsGridComponent;
  let fixture: ComponentFixture<StepsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepsGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StepsGridComponent);
    component = fixture.componentInstance;
  });

  it('sorts steps by index without mutating the input recipe version', () => {
    const recipeVersion: RecipeVersion = {
      recipeLineageId: '00000000-0000-4000-8000-000000000001',
      recipeVersionId: '00000000-0000-0000-0000-000000000001',
      state: 'active',
      createdAt: '2026-09-10T10:00:00Z',
      lastModified: '2026-09-10T10:00:00Z',
      name: 'Test recipe',
      servings: 2,
      preptime: null,
      originName: null,
      originUrl: null,
      kcal: null,
      carbs: null,
      protein: null,
      fat: null,
      ingredients: [],
      steps: [
        { id: 2, index: 2, description: 'Second', recipeVersionId: '00000000-0000-4000-8000-000000000001' },
        { id: 1, index: 1, description: 'First', recipeVersionId: '00000000-0000-4000-8000-000000000001' },
      ],
    };
    fixture.componentRef.setInput('recipeVersion', recipeVersion);
    fixture.detectChanges();

    expect(component.stepsSorted().map((step) => step.id)).toEqual([1, 2]);
    expect(recipeVersion.steps.map((step) => step.id)).toEqual([2, 1]);
  });
});
