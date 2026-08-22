import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodstuffCreateDialogComponent } from './foodstuff-create-dialog.component';

describe('FoodstuffCreateDialogComponent', () => {
  let component: FoodstuffCreateDialogComponent;
  let fixture: ComponentFixture<FoodstuffCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodstuffCreateDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodstuffCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
