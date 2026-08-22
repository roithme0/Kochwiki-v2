import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipesGridComponent } from './recipes-grid.component';

describe('RecipesGridComponent', () => {
  let component: RecipesGridComponent;
  let fixture: ComponentFixture<RecipesGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesGridComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecipesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
