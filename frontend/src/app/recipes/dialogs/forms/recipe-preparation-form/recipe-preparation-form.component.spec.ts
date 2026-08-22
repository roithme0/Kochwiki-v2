import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipePreparationFormComponent } from './recipe-preparation-form.component';

describe('RecipePreparationFormComponent', () => {
  let component: RecipePreparationFormComponent;
  let fixture: ComponentFixture<RecipePreparationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipePreparationFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecipePreparationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
