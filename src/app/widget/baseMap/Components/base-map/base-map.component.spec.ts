import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { BaseMapComponent } from './base-map.component';
import { BaseMapService } from '@app/widget/baseMap/services/base-map/base-map.service';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { CapaMapaBase } from '@app/core/interfaces/CapaMapaBase';

describe('BaseMapComponent', () => {
  let component: BaseMapComponent;
  let fixture: ComponentFixture<BaseMapComponent>;
  let mockBaseMapService: jasmine.SpyObj<BaseMapService>;
  let mockMapaBaseService: jasmine.SpyObj<MapaBaseService>;

  beforeEach(async () => {
    mockBaseMapService = jasmine.createSpyObj('BaseMapService', [
      'mapToCapaMapaBase',
      'changeBaseLayer',
    ]);

    mockMapaBaseService = jasmine.createSpyObj('MapaBaseService', [
      'getMapBases',
    ]);

    await TestBed.configureTestingModule({
      imports: [BaseMapComponent],
      providers: [
        { provide: BaseMapService, useValue: mockBaseMapService },
        { provide: MapaBaseService, useValue: mockMapaBaseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseMapComponent);
    component = fixture.componentInstance;
  });

  it('debería llamar a cargarMapas al inicializar (ngOnInit)', () => {
    const spyCargar = spyOn(component, 'cargarMapas');
    component.ngOnInit();
    expect(spyCargar).toHaveBeenCalledTimes(1);
  });

  it('debería llamar a cargarMapas si cambia nombresMapas y no es firstChange', () => {
    const spyCargar = spyOn(component, 'cargarMapas');
    const changes = {
      nombresMapas: new SimpleChange([], [MapasBase.OSM], false),
    };

    component.ngOnChanges(changes);
    expect(spyCargar).toHaveBeenCalled();
  });

  it('no debería llamar a cargarMapas si es firstChange', () => {
    const spyCargar = spyOn(component, 'cargarMapas');
    const changes = {
      nombresMapas: new SimpleChange([], [MapasBase.OSM], true),
    };

    component.ngOnChanges(changes);
    expect(spyCargar).not.toHaveBeenCalled();
  });

  it('debería cambiar el mapa base actual y llamar a BaseMapService.changeBaseLayer', () => {
    // Arrange
    const mapa: CapaMapaBase = {
      id: 'satellite',
      thumbnail: 'ruta/a/thumbnail.png',
      titulo: 'Mapa Satelital',
      leaf: true,
      url: 'https://ejemplo.com/satellite', // si tu interfaz tiene más props, puedes completarlas o usar valores dummy
    };

    // Act
    component.changeLayer(mapa);

    // Assert
    expect(component.selectedItemId).toBe(mapa);
    expect(mockBaseMapService.changeBaseLayer).toHaveBeenCalledWith(mapa);
  });
});
