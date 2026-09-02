import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SnackBarService } from '../../../services/snack-bar.service';
import { FoodstuffMetadataService } from '../../services/foodstuff-metadata.service';
import { FoodstuffFormComponent } from './foodstuff-form.component';

describe('FoodstuffFormComponent', () => {
  let component: FoodstuffFormComponent;
  let fixture: ComponentFixture<FoodstuffFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodstuffFormComponent],
      providers: [
        {
          provide: FoodstuffMetadataService,
          useValue: {
            load: () =>
              of({
                verboseNames: {
                  name: 'Name', brand: 'Marke', unit: 'Einheit', kcal: 'Kalorien',
                  carbs: 'Kohlenhydrate', protein: 'Protein', fat: 'Fett',
                },
                unitChoices: { g: 'Gramm' },
              }),
          },
        },
        { provide: SnackBarService, useValue: { open: jasmine.createSpy('open') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodstuffFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('submitLabel', 'Speichern');
  });

  it('loads metadata and emits the typed foodstuff updates', () => {
    const submitted = jasmine.createSpy('submitted');
    component.submitted.subscribe(submitted);

    fixture.detectChanges();
    component.form.setValue({
      name: 'Linsen', brand: null, unit: 'g', kcal: 100, carbs: 12, protein: 8, fat: 1,
    });
    component.onSubmit();

    expect(component.verboseNames?.name).toBe('Name');
    expect(component.unitChoices).toEqual({ g: 'Gramm' });
    expect(submitted).toHaveBeenCalledOnceWith({
      name: 'Linsen', brand: null, unit: 'g', kcal: 100, carbs: 12, protein: 8, fat: 1,
    });
  });

  it('patches the form when an existing foodstuff is supplied', () => {
    fixture.componentRef.setInput('foodstuff', {
      name: 'Bohnen', brand: 'Bio', unit: 'g', kcal: 110, carbs: 15, protein: 7, fat: 1,
    });
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual({
      name: 'Bohnen', brand: 'Bio', unit: 'g', kcal: 110, carbs: 15, protein: 7, fat: 1,
    });
  });
});
