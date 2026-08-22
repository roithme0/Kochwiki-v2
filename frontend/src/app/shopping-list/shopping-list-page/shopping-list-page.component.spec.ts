import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListPageComponent } from './shopping-list-page.component';

describe('ShoppingListPageComponent', () => {
  let component: ShoppingListPageComponent;
  let fixture: ComponentFixture<ShoppingListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingListPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppingListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
