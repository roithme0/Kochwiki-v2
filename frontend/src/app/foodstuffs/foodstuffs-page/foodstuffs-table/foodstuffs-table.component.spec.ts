import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodstuffsTableComponent } from './foodstuffs-table.component';

describe('FoodstuffsTableComponent', () => {
  let component: FoodstuffsTableComponent;
  let fixture: ComponentFixture<FoodstuffsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodstuffsTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FoodstuffsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
