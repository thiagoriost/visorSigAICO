import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppTourComponent } from './app-tour.component';

describe('AppTourComponent', () => {
  let component: AppTourComponent;
  let fixture: ComponentFixture<AppTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTourComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia omitir el tour y ocultar el overlay', () => {
    component.showOverlay = true;
    component.omitTour();
    expect(component.showOverlay).toBeFalse();
  });

  it('Deberia marcar el tour como finalizado', () => {
    component.isAvaliableOverlayFinalizedTour = true;
    component.onContinue();
    expect(component.isAvaliableOverlayFinalizedTour).toBeFalse();
  });
});
