import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCustomUserPageComponent } from './select-custom-user-page.component';

describe('SelectCustomUserPageComponent', () => {
  let component: SelectCustomUserPageComponent;
  let fixture: ComponentFixture<SelectCustomUserPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectCustomUserPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectCustomUserPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
