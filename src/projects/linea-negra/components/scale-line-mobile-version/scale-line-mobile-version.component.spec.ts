import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleLineMobileVersionComponent } from './scale-line-mobile-version.component';

describe('ScaleLineMobileVersionComponent', () => {
  let component: ScaleLineMobileVersionComponent;
  let fixture: ComponentFixture<ScaleLineMobileVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScaleLineMobileVersionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScaleLineMobileVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
