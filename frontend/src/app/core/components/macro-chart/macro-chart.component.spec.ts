import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MacroChartComponent } from './macro-chart.component';

describe('MacroChartComponent', () => {
  let fixture: ComponentFixture<MacroChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MacroChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MacroChartComponent);
    fixture.componentRef.setInput('nutrition', {
      kcal: 420,
      carbs: 40,
      protein: 20,
      fat: 10,
    });
    fixture.detectChanges();
  });

  it('centers the kcal overlay across the full chart area', () => {
    const kcalWrapper = fixture.nativeElement.querySelector(
      '.kcal-wrapper'
    ) as HTMLElement;
    const styles = getComputedStyle(kcalWrapper);

    expect(styles.inset).toBe('0px');
    expect(styles.placeItems).toBe('center');
  });
});
