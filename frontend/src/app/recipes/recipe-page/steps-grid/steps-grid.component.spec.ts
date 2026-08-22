import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepsGridComponent } from './steps-grid.component';

describe('StepsGridComponent', () => {
  let component: StepsGridComponent;
  let fixture: ComponentFixture<StepsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepsGridComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StepsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
