import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodstuffsPageComponent } from './foodstuffs-page.component';

describe('FoodstuffsPageComponent', () => {
  let component: FoodstuffsPageComponent;
  let fixture: ComponentFixture<FoodstuffsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodstuffsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodstuffsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
