import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientsGridShoppingListButtonComponent } from './ingredients-grid-shopping-list-button.component';

describe('IngredientsGridShoppingListButtonComponent', () => {
  let component: IngredientsGridShoppingListButtonComponent;
  let fixture: ComponentFixture<IngredientsGridShoppingListButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsGridShoppingListButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IngredientsGridShoppingListButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
