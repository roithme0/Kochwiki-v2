import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodstuffsTableCreateFoodstuffComponent } from './foodstuffs-table-create-foodstuff.component';

describe('FoodstuffsTableCreateFoodstuffComponent', () => {
  let component: FoodstuffsTableCreateFoodstuffComponent;
  let fixture: ComponentFixture<FoodstuffsTableCreateFoodstuffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodstuffsTableCreateFoodstuffComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FoodstuffsTableCreateFoodstuffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
