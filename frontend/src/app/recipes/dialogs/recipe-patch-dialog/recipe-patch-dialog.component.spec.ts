import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipePatchDialogComponent } from './recipe-patch-dialog.component';

describe('RecipePatchDialogComponent', () => {
  let component: RecipePatchDialogComponent;
  let fixture: ComponentFixture<RecipePatchDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipePatchDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipePatchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
