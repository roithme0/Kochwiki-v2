import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { FoodstuffBackendService } from '../../../foodstuffs/services/foodstuff-backend.service';
import { RecipeVersion } from '../../models/recipe';
import { RecipeBackendService } from '../../services/recipe-backend.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { RecipeEditorComponent } from './recipe-editor.component';

describe('RecipeEditorComponent', () => {
  let fixture: ComponentFixture<RecipeEditorComponent>;
  let component: RecipeEditorComponent;
  let foodstuffBackend: { getAllFoodstuffs: jasmine.Spy; foodstuffsChanged$: Subject<void> };
  let recipeBackend: { getActiveRecipeVersion: jasmine.Spy; getRecipeVersion: jasmine.Spy };

  const recipeVersion: RecipeVersion = {
    recipeLineageId: '00000000-0000-4000-8000-000000000001',
    recipeVersionId: '00000000-0000-0000-0000-000000000001',
    state: 'active',
    createdAt: '2026-09-10T10:00:00Z',
    lastModified: '2026-09-10T10:00:00Z',
    name: 'Linsensuppe',
    servings: 2,
    preptime: 20,
    originName: null,
    originUrl: null,
    kcal: null,
    carbs: null,
    protein: null,
    fat: null,
    ingredients: [],
    steps: [],
  };

  beforeEach(async () => {
    foodstuffBackend = {
      getAllFoodstuffs: jasmine.createSpy('getAllFoodstuffs').and.resolveTo([]),
      foodstuffsChanged$: new Subject<void>(),
    };
    recipeBackend = {
      getActiveRecipeVersion: jasmine.createSpy('getActiveRecipeVersion').and.resolveTo(recipeVersion),
      getRecipeVersion: jasmine.createSpy('getRecipeVersion').and.resolveTo(recipeVersion),
    };

    await TestBed.configureTestingModule({
      imports: [RecipeEditorComponent],
      providers: [
        { provide: FoodstuffBackendService, useValue: foodstuffBackend },
        { provide: RecipeBackendService, useValue: recipeBackend },
        { provide: SnackBarService, useValue: { open: jasmine.createSpy('open') } },
        { provide: MatDialog, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeEditorComponent);
    component = fixture.componentInstance;
  });

  it('becomes ready only after recipe and foodstuff data load', async () => {
    fixture.componentRef.setInput('recipeLineageId', recipeVersion.recipeLineageId);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(recipeBackend.getActiveRecipeVersion).toHaveBeenCalledOnceWith(recipeVersion.recipeLineageId);
    expect(component.recipeVersion()).toEqual(recipeVersion);
    expect(component.state()).toEqual({ status: 'ready' });
  });

  it('reports a recipe-specific error when the recipe request fails', async () => {
    recipeBackend.getActiveRecipeVersion.and.rejectWith(new Error('Recipe not found'));
    fixture.componentRef.setInput('recipeLineageId', recipeVersion.recipeLineageId);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.state()).toEqual({ status: 'error', source: 'recipeVersion' });
    expect(component.errorMessage()).toBe('Rezept konnte nicht geladen werden.');
  });

  it('shows all editor sections together when ready', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const sections = Array.from(
      fixture.nativeElement.querySelectorAll('section.form-section') as NodeListOf<HTMLElement>
    );
    expect(sections.map((section) => section.querySelector('h2')?.textContent?.trim())).toEqual([
      'Basis',
      'Zutaten',
      'Zubereitung',
    ]);
    expect(sections.every((section) => section.querySelector('app-recipe-meta-form, app-recipe-ingredients-form, app-recipe-preparation-form'))).toBeTrue();
  });

  it('starts create mode with one removable ingredient and preparation row', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const ingredients = component.recipeForm.controls.ingredientsFormGroup.controls.ingredients;
    const steps = component.recipeForm.controls.preparationFormGroup.controls.steps;
    expect(ingredients.length).toBe(1);
    expect(steps.length).toBe(1);

    component.recipeForm.controls.ingredientsFormGroup.controls.ingredients.removeAt(0);
    component.recipeForm.controls.preparationFormGroup.controls.steps.removeAt(0);
    expect(ingredients.length).toBe(0);
    expect(steps.length).toBe(0);
  });

  it('starts an empty edited recipe with one ingredient and preparation row', async () => {
    fixture.componentRef.setInput('recipeLineageId', recipeVersion.recipeLineageId);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.recipeForm.controls.ingredientsFormGroup.controls.ingredients.length).toBe(1);
    expect(component.recipeForm.controls.preparationFormGroup.controls.steps.length).toBe(1);
  });

  it('navigates to a section and follows manual dialog scrolling', async () => {
    const scrollArea = document.createElement('mat-dialog-content');
    scrollArea.appendChild(fixture.nativeElement);
    const scrollTo = spyOn(scrollArea, 'scrollTo');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('.section-nav') as HTMLElement;
    const sections = fixture.nativeElement.querySelectorAll('.form-section') as NodeListOf<HTMLElement>;
    spyOnProperty(nav, 'offsetHeight', 'get').and.returnValue(44);
    spyOn(scrollArea, 'getBoundingClientRect').and.returnValue({ top: 0, bottom: 400 } as DOMRect);
    spyOn(sections[1], 'getBoundingClientRect').and.returnValue({ top: 280 } as DOMRect);
    const buttons = fixture.nativeElement.querySelectorAll('.section-nav button') as NodeListOf<HTMLButtonElement>;

    buttons[1].click();
    expect(scrollTo).toHaveBeenCalled();
    expect(scrollTo.calls.mostRecent().args[0] as unknown as ScrollToOptions).toEqual({ top: 228, behavior: 'smooth' });
    expect(component.activeSection()).toBe('ingredients');

    spyOn(nav, 'getBoundingClientRect').and.returnValue({ bottom: 60 } as DOMRect);
    spyOn(sections[0], 'getBoundingClientRect').and.returnValue({ top: -200 } as DOMRect);
    (sections[1].getBoundingClientRect as jasmine.Spy).and.returnValue({ top: 40 } as DOMRect);
    spyOn(sections[2], 'getBoundingClientRect').and.returnValue({ top: 300 } as DOMRect);
    spyOnProperty(scrollArea, 'scrollHeight', 'get').and.returnValue(600);
    spyOnProperty(scrollArea, 'clientHeight', 'get').and.returnValue(400);
    spyOnProperty(scrollArea, 'scrollTop', 'get').and.returnValue(200);
    scrollArea.dispatchEvent(new Event('scroll'));
    expect(component.activeSection()).toBe('ingredients');
    fixture.detectChanges();
    expect(buttons[1].classList.contains('active')).toBeTrue();

    (sections[2].getBoundingClientRect as jasmine.Spy).and.returnValue({ top: 180 } as DOMRect);
    buttons[2].click();
    scrollArea.dispatchEvent(new Event('scroll'));
    expect(component.activeSection()).toBe('preparation');

    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    expect(component.activeSection()).toBe('preparation');
    fixture.detectChanges();
    expect(buttons[2].classList.contains('active')).toBeTrue();

    (sections[2].getBoundingClientRect as jasmine.Spy).and.returnValue({ top: 340 } as DOMRect);
    scrollArea.dispatchEvent(new Event('scroll'));
    expect(component.activeSection()).toBe('preparation');

    buttons[1].click();
    scrollArea.dispatchEvent(new Event('scroll'));
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    expect(component.activeSection()).toBe('ingredients');
    fixture.detectChanges();
    expect(buttons[1].classList.contains('active')).toBeTrue();

    scrollArea.dispatchEvent(new Event('scroll'));
    expect(component.activeSection()).toBe('preparation');

    buttons[1].click();
    scrollArea.dispatchEvent(new Event('touchmove'));
    scrollArea.dispatchEvent(new Event('scroll'));
    expect(component.activeSection()).toBe('preparation');

    scrollArea.remove();
  });

  it('submits step indexes derived from visible form order', () => {
    component.recipeForm.controls.metaFormGroup.controls.name.setValue('Linsensuppe');
    component.recipeForm.controls.preparationFormGroup.controls.steps.push(
      new FormGroup({ description: new FormControl('Servieren', Validators.required) })
    );
    component.recipeForm.controls.preparationFormGroup.controls.steps.push(
      new FormGroup({ description: new FormControl('Kochen', Validators.required) })
    );
    const emitted = jasmine.createSpy('emitted');
    component.submitted.subscribe(emitted);

    component.onSubmit('publish');

    expect(emitted).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        action: 'publish',
        recipeVersion: jasmine.objectContaining({
          steps: [
            { index: 1, description: 'Servieren' },
            { index: 2, description: 'Kochen' },
          ],
        }),
      })
    );
  });

  it('does not submit an invalid step description', () => {
    component.recipeForm.controls.metaFormGroup.controls.name.setValue('Linsensuppe');
    component.recipeForm.controls.preparationFormGroup.controls.steps.push(
      new FormGroup({ description: new FormControl('', Validators.required) })
    );
    const emitted = jasmine.createSpy('emitted');
    component.submitted.subscribe(emitted);

    component.onSubmit('publish');

    expect(emitted).not.toHaveBeenCalled();
  });

  it('keeps Save available and shows the first required field error on an invalid attempt', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const save = fixture.nativeElement.querySelector('.button-wrapper button') as HTMLButtonElement;
    expect(save.disabled).toBeFalse();

    save.click();
    fixture.detectChanges();

    expect(component.recipeForm.controls.metaFormGroup.controls.name.touched).toBeTrue();
    expect(fixture.nativeElement.querySelector('#basics mat-error')?.textContent).toContain('Bitte einen Namen eingeben.');
  });

  it('jumps to the first invalid ingredient field after Basics is valid', async () => {
    const scrollArea = document.createElement('mat-dialog-content');
    scrollArea.appendChild(fixture.nativeElement);
    const scrollTo = spyOn(scrollArea, 'scrollTo');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    component.recipeForm.controls.metaFormGroup.controls.name.setValue('Linsensuppe');
    const ingredients = fixture.nativeElement.querySelector('app-recipe-ingredients-form') as HTMLElement;
    (ingredients.querySelector('.add-ingredient-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.button-wrapper button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(component.activeSection()).toBe('ingredients');
    expect(scrollTo).toHaveBeenCalled();
    expect(ingredients.querySelector('.ingredient-errors')?.textContent).toContain('Bitte ein Lebensmittel auswählen.');
    expect(ingredients.querySelector('.ingredient-errors')?.textContent).toContain('Bitte eine Menge eingeben.');

    component.recipeForm.controls.ingredientsFormGroup.controls.ingredients.at(0).controls.foodstuffId.setValue(1);
    fixture.detectChanges();
    expect(ingredients.querySelector('.ingredient-errors')?.textContent).not.toContain('Bitte ein Lebensmittel auswählen.');
    expect(ingredients.querySelector('.ingredient-errors')?.textContent).toContain('Bitte eine Menge eingeben.');
    scrollArea.remove();
  });
});
