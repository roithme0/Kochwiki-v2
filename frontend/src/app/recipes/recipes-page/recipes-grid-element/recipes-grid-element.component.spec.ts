import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipesGridElementComponent } from './recipes-grid-element.component';

describe('RecipesGridElementComponent', () => {
  let component: RecipesGridElementComponent;
  let fixture: ComponentFixture<RecipesGridElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesGridElementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecipesGridElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
