import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListTableButtonsComponent } from './shopping-list-table-buttons.component';

describe('ShoppingListTableButtonsComponent', () => {
  let component: ShoppingListTableButtonsComponent;
  let fixture: ComponentFixture<ShoppingListTableButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingListTableButtonsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppingListTableButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
