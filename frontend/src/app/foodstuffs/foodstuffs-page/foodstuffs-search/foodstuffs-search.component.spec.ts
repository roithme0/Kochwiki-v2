import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodstuffsSearchComponent } from './foodstuffs-search.component';

describe('FoodstuffsSearchComponent', () => {
  let component: FoodstuffsSearchComponent;
  let fixture: ComponentFixture<FoodstuffsSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodstuffsSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoodstuffsSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
