import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormGroupDirective,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChartLegendElementComponent } from '../../../../core/components/chart-legend-element/chart-legend-element.component';
import { MacroChartComponent } from '../../../../core/components/macro-chart/macro-chart.component';
import { ChartLegendElement } from '../../../../interfaces/chart-legend-element';
import { Foodstuff } from '../../../../foodstuffs/interfaces/foodstuff';
import { FoodstuffUnit } from '../../../../foodstuffs/interfaces/foodstuff-unit';
import { IngredientFieldComponent } from './ingredient-field/ingredient-field.component';
import { RecipeIngredientsFormComponent } from './recipe-ingredients-form.component';

@Component({ selector: 'app-macro-chart', template: '' })
class MacroChartStubComponent {
  readonly nutrition = input.required<unknown>();
  readonly legendUpdated = output<Record<string, ChartLegendElement>>();
}

@Component({ selector: 'app-chart-legend-element', template: '' })
class ChartLegendElementStubComponent {
  readonly legendElement = input.required<ChartLegendElement>();
}

@Component({ selector: 'app-ingredient-field', template: '' })
class IngredientFieldStubComponent {
  readonly foodstuffs = input.required<Foodstuff[]>();
  readonly index = input.required<number>();
}

describe('RecipeIngredientsFormComponent', () => {
  let fixture: ComponentFixture<RecipeIngredientsFormComponent>;

  const foodstuff: Foodstuff = {
    id: 1,
    name: 'Haferflocken',
    brand: null,
    unit: FoodstuffUnit.Gram,
    unitVerbose: 'g',
    kcal: 370,
    carbs: 60,
    protein: 13,
    fat: 7,
    recipeIds: [],
  };

  beforeEach(async () => {
    const recipeForm = createRecipeForm();

    await TestBed.configureTestingModule({
      imports: [RecipeIngredientsFormComponent],
      providers: [
        { provide: FormGroupDirective, useValue: { control: recipeForm } },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
      ],
    })
      .overrideComponent(RecipeIngredientsFormComponent, {
        remove: {
          imports: [
            MacroChartComponent,
            ChartLegendElementComponent,
            IngredientFieldComponent,
          ],
        },
        add: {
          imports: [
            MacroChartStubComponent,
            ChartLegendElementStubComponent,
            IngredientFieldStubComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RecipeIngredientsFormComponent);
    fixture.componentRef.setInput('foodstuffs', [foodstuff]);
    fixture.detectChanges();
  });

  it('keeps the legend collapsed until Details is clicked', () => {
    const detailsButton = getDetailsButton();

    expect(detailsButton.getAttribute('aria-expanded')).toBe('false');
    expect(getLegend()).toBeNull();

    const chart = fixture.nativeElement.querySelector(
      'app-macro-chart'
    ) as HTMLElement;
    chart.click();
    fixture.detectChanges();

    expect(getDetailsButton().getAttribute('aria-expanded')).toBe('false');
    expect(getLegend()).toBeNull();

    detailsButton.click();
    fixture.detectChanges();

    expect(getDetailsButton().getAttribute('aria-expanded')).toBe('true');
    expect(getLegend()).not.toBeNull();

    getDetailsButton().click();
    fixture.detectChanges();

    expect(getDetailsButton().getAttribute('aria-expanded')).toBe('false');
    expect(getLegend()).toBeNull();
  });

  it('keeps the chart area fixed when Details expands the legend', () => {
    const chartArea = getChartArea();
    const initialTop = chartArea.getBoundingClientRect().top;
    const initialHeight = getComputedStyle(chartArea).height;

    getDetailsButton().click();
    fixture.detectChanges();

    const expandedChartArea = getChartArea();
    expect(getComputedStyle(expandedChartArea).height).toBe(initialHeight);
    expect(expandedChartArea.getBoundingClientRect().top).toBe(initialTop);
    expect(getLegend()).not.toBeNull();
  });

  it('does not offer a legend when every macro is zero', () => {
    fixture.componentRef.setInput('foodstuffs', [
      { ...foodstuff, carbs: 0, protein: 0, fat: 0 },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-macro-chart')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.details-button')).toBeNull();
    expect(getLegend()).toBeNull();
  });

  it('keeps nutrition visible when a new ingredient has no foodstuff yet', () => {
    fixture.componentInstance.addIngredient();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-macro-chart')).not.toBeNull();
    expect(getNutritionMessage()).toBeNull();
  });

  it('keeps the last valid chart while a focused numeric field is invalid', () => {
    const servingsInput = fixture.nativeElement.querySelector(
      'input[formControlName="servings"]'
    ) as HTMLInputElement;
    servingsInput.focus();
    fixture.componentInstance.ingredientsFormGroup
      .get('servings')
      ?.setValue(null);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-macro-chart')).not.toBeNull();
    expect(getNutritionMessage()).toBeNull();

    fixture.componentInstance.ingredientsFormGroup
      .get('servings')
      ?.setValue(4);
    fixture.detectChanges();

    expect(fixture.componentInstance.displayedNutritionState()).toEqual({
      status: 'complete',
      nutrition: { kcal: 92.5, carbs: 15, protein: 3.25, fat: 1.75 },
    });

    fixture.componentInstance.ingredientsFormGroup
      .get('servings')
      ?.setValue(null);
    fixture.detectChanges();

    servingsInput.blur();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-macro-chart')).toBeNull();
    expect(getNutritionMessage()?.textContent).toContain(
      'Nährwerte werden angezeigt, sobald Mengen und Portionen gültig sind.'
    );

    servingsInput.focus();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-macro-chart')).toBeNull();
    expect(getNutritionMessage()?.textContent).toContain(
      'Nährwerte werden angezeigt, sobald Mengen und Portionen gültig sind.'
    );
  });

  it('shows incomplete nutrition immediately for valid foodstuff data', () => {
    fixture.componentRef.setInput('foodstuffs', [
      { ...foodstuff, protein: null },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-macro-chart')).toBeNull();
    expect(getNutritionMessage()?.textContent).toContain(
      'Nährwertangaben der einzelnen Zutaten unvollständig.'
    );
  });

  it('reserves the preview area in stable states', () => {
    const nutritionSection = fixture.nativeElement.querySelector(
      '.nutrition-section'
    ) as HTMLElement;

    expect(getComputedStyle(nutritionSection).minHeight).toBe('208px');
  });

  function getDetailsButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector(
      '.details-button'
    ) as HTMLButtonElement;
  }

  function getLegend(): HTMLElement | null {
    return fixture.nativeElement.querySelector('#recipe-draft-macro-legend');
  }

  function getChartArea(): HTMLElement {
    return fixture.nativeElement.querySelector(
      '.nutrition-chart-area'
    ) as HTMLElement;
  }

  function getNutritionMessage(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.nutrition-message');
  }
});

function createRecipeForm(): FormGroup {
  return new FormGroup({
    ingredientsFormGroup: new FormGroup({
      servings: new FormControl(2),
      ingredients: new FormArray([
        new FormGroup({
          index: new FormControl(1),
          foodstuffId: new FormControl(1),
          amount: new FormControl(100),
        }),
      ]),
    }),
  });
}
