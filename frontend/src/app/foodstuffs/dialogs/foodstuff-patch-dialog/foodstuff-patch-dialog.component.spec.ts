import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodstuffPatchDialogComponent } from './foodstuff-patch-dialog.component';

describe('FoodstuffPatchDialogComponent', () => {
  let component: FoodstuffPatchDialogComponent;
  let fixture: ComponentFixture<FoodstuffPatchDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodstuffPatchDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodstuffPatchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
