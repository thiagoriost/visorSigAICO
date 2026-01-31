import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopUpComponent } from './pop-up.component';
import { InfoPanelService } from '@app/widget/InfoPanel/services/info-panel.service';
import { ElementRef, SimpleChanges, SimpleChange } from '@angular/core';
import { Coordinate } from 'ol/coordinate';

class MockInfoPanelService {
  createPopup = jasmine.createSpy('createPopup').and.returnValue(456);
  updatePopupCoords = jasmine.createSpy('updatePopupCoords');
  closePopup = jasmine.createSpy('closePopup');
}

describe('PopUpComponent', () => {
  let component: PopUpComponent;
  let fixture: ComponentFixture<PopUpComponent>;
  let infoPanelService: MockInfoPanelService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpComponent],
      providers: [
        { provide: InfoPanelService, useClass: MockInfoPanelService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PopUpComponent);
    component = fixture.componentInstance;
    infoPanelService = TestBed.inject(
      InfoPanelService
    ) as unknown as MockInfoPanelService;

    component.popupNode = {
      nativeElement: document.createElement('div'),
    } as ElementRef<HTMLDivElement>;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el popup en el mapa al cargar la vista si hay coordenadas', () => {
    component.coordenadas = [1, 2];
    fixture.detectChanges();
    expect(infoPanelService.createPopup).toHaveBeenCalledWith(
      component.coordenadas,
      component.popupNode
    );
    expect(component.id).toBe(456);
  });

  it('no debería inicializar el popup si no hay coordenadas', () => {
    component.coordenadas = null as unknown as Coordinate;
    fixture.detectChanges();
    expect(infoPanelService.createPopup).not.toHaveBeenCalled();
    expect(component.id).toBeUndefined();
  });

  it('debería actualizar las coordenadas del popup si cambian y ya existe un id', () => {
    component.id = 456;
    const previous: Coordinate = [1, 2];
    const current: Coordinate = [3, 4];
    component.coordenadas = current;

    const changes: SimpleChanges = {
      coordenadas: new SimpleChange(previous, current, false),
    };

    component.ngOnChanges(changes);

    expect(infoPanelService.updatePopupCoords).toHaveBeenCalledWith(
      456,
      current
    );
  });

  it('no debería actualizar las coordenadas si es el primer cambio', () => {
    const changes: SimpleChanges = {
      coordenadas: new SimpleChange([1, 2], [3, 4], true),
    };

    component.ngOnChanges(changes);

    expect(infoPanelService.updatePopupCoords).not.toHaveBeenCalled();
  });

  it('debería cerrar el popup al invocar closePopup', () => {
    component.id = 456;
    component.closePopup();

    expect(infoPanelService.closePopup).toHaveBeenCalledWith(456);
    expect(component.id).toBeUndefined();
  });

  it('debería devolver la clase CSS correcta según el color', () => {
    component.color = 'primary';
    expect(component.bgColorClass).toBe('bg-primary-500');

    component.color = 'white';
    expect(component.bgColorClass).toBe('bg-white');

    component.color = 'surface';
    expect(component.bgColorClass).toBe('bg-surface-500');
  });

  it('debería devolver la clase por defecto si se establece un color inválido', () => {
    component.color = 'invalid' as 'primary';
    expect(component.bgColorClass).toBe('bg-surface-500');
  });
});
