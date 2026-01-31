import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalizedSpinnerComponent } from './personalized-spinner.component';

describe('PersonalizedSpinnerComponent', () => {
  let component: PersonalizedSpinnerComponent;
  let fixture: ComponentFixture<PersonalizedSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalizedSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalizedSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
