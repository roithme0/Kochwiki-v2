import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeCreateDialogComponent } from './recipe-create-dialog.component';

describe('RecipeCreateDialogComponent', () => {
  let component: RecipeCreateDialogComponent;
  let fixture: ComponentFixture<RecipeCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeCreateDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
