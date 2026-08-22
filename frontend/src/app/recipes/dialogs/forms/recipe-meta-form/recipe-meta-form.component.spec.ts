import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeMetaFormComponent } from './recipe-meta-form.component';

describe('RecipeMetaFormComponent', () => {
  let component: RecipeMetaFormComponent;
  let fixture: ComponentFixture<RecipeMetaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeMetaFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecipeMetaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
