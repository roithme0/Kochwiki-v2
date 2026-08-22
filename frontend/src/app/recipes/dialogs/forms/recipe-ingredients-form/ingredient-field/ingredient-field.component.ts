import {
  Component,
  WritableSignal,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { Foodstuff } from '../../../../../foodstuffs/interfaces/foodstuff';

@Component({
  selector: 'app-ingredient-field',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatExpansionModule,
    MatSelectModule,
  ],
  templateUrl: './ingredient-field.component.html',
  styleUrl: './ingredient-field.component.scss',
})
export class IngredientFieldComponent {
  foodstuffs = input.required<Foodstuff[]>();
  index = input.required<number>();

  readonly ingredientsFormGroupDirective = inject(FormGroupDirective);

  ingredientsFormGroup!: FormGroup;
  foodstuffIdControl!: FormControl;
  ingredientControl!: FormControl;

  selectedFoodstuffId: WritableSignal<number | undefined> = signal(undefined);
  selectedFoodstuff = computed((): Foodstuff | undefined =>
    this.foodstuffs().find(
      (foodstuff) => foodstuff.id === this.selectedFoodstuffId()
    )
  );
  panelTitle = computed((): string => {
    const selectedFoodstuff: Foodstuff | undefined = this.selectedFoodstuff();
    return selectedFoodstuff == undefined
      ? 'Lebensmittel wählen ...'
      : selectedFoodstuff.name;
  });

  ngOnInit(): void {
    this.ingredientsFormGroup = this.ingredientsFormGroupDirective.control;
    this.foodstuffIdControl = this.ingredientsFormGroup.get(
      `ingredients.${this.index()}.foodstuffId`
    ) as FormControl;
    this.ingredientControl = this.ingredientsFormGroup.get(
      `ingredients.${this.index()}.amount`
    ) as FormControl;

    this.selectedFoodstuffId.set(this.foodstuffIdControl.value);
  }
}
