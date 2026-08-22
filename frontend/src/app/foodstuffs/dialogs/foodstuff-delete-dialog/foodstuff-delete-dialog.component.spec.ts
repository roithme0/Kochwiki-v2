import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodstuffDeleteDialogComponent } from './foodstuff-delete-dialog.component';

describe('FoodstuffDeleteDialogComponent', () => {
  let component: FoodstuffDeleteDialogComponent;
  let fixture: ComponentFixture<FoodstuffDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodstuffDeleteDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodstuffDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
