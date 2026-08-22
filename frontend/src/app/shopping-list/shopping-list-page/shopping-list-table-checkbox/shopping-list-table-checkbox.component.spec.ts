import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListTableCheckboxComponent } from './shopping-list-table-checkbox.component';

describe('ShoppingListTableCheckboxComponent', () => {
  let component: ShoppingListTableCheckboxComponent;
  let fixture: ComponentFixture<ShoppingListTableCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingListTableCheckboxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppingListTableCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
