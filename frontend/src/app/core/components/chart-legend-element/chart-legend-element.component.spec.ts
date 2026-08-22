import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartLegendElementComponent } from './chart-legend-element.component';

describe('ChartLegendElementComponent', () => {
  let component: ChartLegendElementComponent;
  let fixture: ComponentFixture<ChartLegendElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartLegendElementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartLegendElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
