import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinateScaleLineComponent } from './coordinate-scale-line.component';

describe('CoordinateScaleLineComponent', () => {
  let component: CoordinateScaleLineComponent;
  let fixture: ComponentFixture<CoordinateScaleLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordinateScaleLineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoordinateScaleLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
