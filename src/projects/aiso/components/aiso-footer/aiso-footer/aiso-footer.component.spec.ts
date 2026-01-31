import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AisoFooterComponent } from './aiso-footer.component';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { By } from '@angular/platform-browser';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AisoFooterComponent', () => {
  let component: AisoFooterComponent;
  let fixture: ComponentFixture<AisoFooterComponent>;
  let mapaBaseServiceMock: jasmine.SpyObj<MapaBaseService>;

  beforeEach(async () => {
    // Mock del servicio MapaBaseService
    mapaBaseServiceMock = jasmine.createSpyObj('MapaBaseService', [
      'getAllMapOptions',
    ]);
    mapaBaseServiceMock.getAllMapOptions.and.returnValue([
      { label: 'ESRI', value: MapasBase.ESRI_STANDARD },
      { label: 'OSM', value: MapasBase.OSM },
    ]);

    await TestBed.configureTestingModule({
      imports: [AisoFooterComponent],
      providers: [{ provide: MapaBaseService, useValue: mapaBaseServiceMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // Para evitar errores con componentes anidados
    }).compileComponents();

    fixture = TestBed.createComponent(AisoFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- PRUEBAS ---

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar las opciones de mapas base al iniciar', () => {
    // Arrange & Act: se ejecuta ngOnInit en el beforeEach
    // Assert
    expect(mapaBaseServiceMock.getAllMapOptions).toHaveBeenCalled();
    expect(component.mapasBaseOptions.length).toBeGreaterThan(0);
  });

  it('debería tener ESRI_STANDARD como mapa base seleccionado por defecto', () => {
    expect(component.selectedBaseMap).toBe(MapasBase.ESRI_STANDARD);
  });

  it('debería mostrar el componente <app-coordinate-scale-line>', () => {
    const coordLine = fixture.debugElement.query(
      By.css('app-coordinate-scale-line')
    );
    expect(coordLine).toBeTruthy();
  });

  it('debería mostrar el componente <app-mini-map>', () => {
    const miniMap = fixture.debugElement.query(By.css('app-mini-map'));
    expect(miniMap).toBeTruthy();
  });
});
