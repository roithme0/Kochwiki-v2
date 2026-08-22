import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListTableControlsComponent } from './shopping-list-table-controls.component';

describe('ShoppingListTableControlsComponent', () => {
  let component: ShoppingListTableControlsComponent;
  let fixture: ComponentFixture<ShoppingListTableControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingListTableControlsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppingListTableControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
