import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepsGridComponent } from './steps-grid.component';
import { Recipe } from '../../interfaces/recipe';

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

  it('sorts steps by index without mutating the input recipe', () => {
    const recipe: Recipe = {
      id: 1,
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
        { id: 2, index: 2, description: 'Second', recipeId: 1 },
        { id: 1, index: 1, description: 'First', recipeId: 1 },
      ],
    };
    fixture.componentRef.setInput('recipe', recipe);
    fixture.detectChanges();

    expect(component.stepsSorted().map((step) => step.id)).toEqual([1, 2]);
    expect(recipe.steps.map((step) => step.id)).toEqual([2, 1]);
  });
});
