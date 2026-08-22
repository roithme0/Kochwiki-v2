import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientsGridComponent } from './ingredients-grid.component';

describe('IngredientsGridComponent', () => {
  let component: IngredientsGridComponent;
  let fixture: ComponentFixture<IngredientsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientsGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IngredientsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
