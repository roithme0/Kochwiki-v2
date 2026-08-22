import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeMacroChartCardComponent } from './recipe-macro-chart-card.component';

describe('RecipeMacroChartCardComponent', () => {
  let component: RecipeMacroChartCardComponent;
  let fixture: ComponentFixture<RecipeMacroChartCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeMacroChartCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeMacroChartCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
