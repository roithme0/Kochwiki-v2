import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipesGridCreateRecipeComponent } from './recipes-grid-create-recipe.component';

describe('RecipesGridCreateRecipeComponent', () => {
  let component: RecipesGridCreateRecipeComponent;
  let fixture: ComponentFixture<RecipesGridCreateRecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesGridCreateRecipeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecipesGridCreateRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
