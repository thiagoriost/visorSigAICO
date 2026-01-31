import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinatesScaleLineaNegraComponent } from './coordinates-scale-linea-negra.component';

describe('CoordinatesScaleLineaNegraComponent', () => {
  let component: CoordinatesScaleLineaNegraComponent;
  let fixture: ComponentFixture<CoordinatesScaleLineaNegraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordinatesScaleLineaNegraComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoordinatesScaleLineaNegraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
