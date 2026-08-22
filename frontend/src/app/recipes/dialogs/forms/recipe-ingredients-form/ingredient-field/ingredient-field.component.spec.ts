import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientFieldComponent } from './ingredient-field.component';

describe('IngredientFieldComponent', () => {
  let component: IngredientFieldComponent;
  let fixture: ComponentFixture<IngredientFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IngredientFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
