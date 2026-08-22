import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListTablePinButtonComponent } from './shopping-list-table-pin-button.component';

describe('ShoppingListTablePinButtonComponent', () => {
  let component: ShoppingListTablePinButtonComponent;
  let fixture: ComponentFixture<ShoppingListTablePinButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingListTablePinButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppingListTablePinButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
