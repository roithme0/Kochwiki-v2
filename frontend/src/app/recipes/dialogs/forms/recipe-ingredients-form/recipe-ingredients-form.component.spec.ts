import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeIngredientsFormComponent } from './recipe-ingredients-form.component';

describe('RecipeIngredientsFormComponent', () => {
  let component: RecipeIngredientsFormComponent;
  let fixture: ComponentFixture<RecipeIngredientsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeIngredientsFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeIngredientsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
