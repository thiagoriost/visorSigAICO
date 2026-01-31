import { TestBed } from '@angular/core/testing';

import { LayerOptionService } from './layer-option.service';
import { Store, StoreModule } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { MapActions } from '@app/core/store/map/map.actions';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';

describe('LayerOptionService', () => {
  let service: LayerOptionService;
  let storeSpy: jasmine.SpyObj<Store<MapState>>;

  beforeEach(() => {
    storeSpy = jasmine.createSpyObj<Store<MapState>>('Store', ['dispatch']);
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [LayerOptionService, { provide: Store, useValue: storeSpy }],
    });
    service = TestBed.inject(LayerOptionService);
  });

  const mockLayer: CapaMapa = {
    id: 'layer-1',
    titulo: 'Capa de prueba',
    urlMetadato: 'https://example.com/metadata',
  } as CapaMapa;

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Deberia disparar la accion de addLayerToMap action cuando addLayer() es llamado', () => {
    service.addLayer(mockLayer);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      MapActions.addLayerToMap({
        layer: {
          isVisible: true,
          layerDefinition: mockLayer,
          layerLevel: LayerLevel.INTERMEDIATE,
          orderInMap: 0,
          transparencyLevel: 0,
        },
      })
    );
  });

  it('Deberia disparar la accion deleteLayerOfMap cuando deleteLayer() es llamado', () => {
    service.deleteLayer(mockLayer);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      MapActions.deleteLayerOfMap({ layer: mockLayer })
    );
  });

  it('Deberia disparar la accion showOrHideLayerOfMap cuando turnOnLayer() es llamado', () => {
    service.turnOnLayer(mockLayer);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      MapActions.showOrHideLayerOfMap({ layer: mockLayer })
    );
  });

  it('Deberia disparar la accion showOrHideLayerOfMap cuando turnOffLayer() es llamado', () => {
    service.turnOffLayer(mockLayer);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      MapActions.showOrHideLayerOfMap({ layer: mockLayer })
    );
  });

  it('Deberia disparar la accion setLayerTransparency cuando setTransparencyOfLayer() es llamado', () => {
    service.setTransparencyOfLayer(mockLayer, 50);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      MapActions.setLayerTransparency({
        layer: mockLayer,
        transparencyLevel: 50,
      })
    );
  });

  describe('showMetadata', () => {
    let windowOpenSpy: jasmine.Spy;
    let consoleWarnSpy: jasmine.Spy;

    beforeEach(() => {
      windowOpenSpy = spyOn(window, 'open');
      consoleWarnSpy = spyOn(console, 'warn');
    });

    it('Deberia abrir la ventana si la capa tiene la propiedad urlMetadato', () => {
      service.showMetadata(mockLayer);
      expect(windowOpenSpy).toHaveBeenCalledWith(
        mockLayer.urlMetadato,
        'blank'
      );
    });

    it('Deberia imprimir mensaje de aviso en la consola si la capa no tiene la propiedad urlMetadato', () => {
      const layerWithoutMetadata = { ...mockLayer, urlMetadato: undefined };
      service.showMetadata(layerWithoutMetadata);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'La capa: ',
        layerWithoutMetadata.titulo,
        ' no contiene URL de metadatos'
      );
    });
  });
});
