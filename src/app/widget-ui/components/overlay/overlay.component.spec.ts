import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayComponent } from './overlay.component';

describe('OverlayComponent', () => {
  let component: OverlayComponent;
  let fixture: ComponentFixture<OverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Método getPosition()', () => {
    it('Deberia retornar "absolute" cuando la variable isContained is Verdadera', () => {
      component.isContained = true;
      expect(component.getPosition()).toBe('absolute');
    });

    it('Deberia retornar "fixed" cuando la variable isContained es falsa', () => {
      component.isContained = false;
      expect(component.getPosition()).toBe('fixed');
    });
  });
});
