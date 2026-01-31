import { TestBed } from '@angular/core/testing';

import { LayersContentTableManagerService } from './layers-content-table-manager.service';
import { Store, StoreModule } from '@ngrx/store';
import { LayerDefinitionsService } from '@app/shared/services/layer-definitions-service/layer-definitions.service';
import { MapService } from '../map-service/map.service';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { MapActions } from '@app/core/store/map/map.actions';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { Map } from 'ol';
import { MapState } from '@app/core/interfaces/store/map.model';
import { MessageService } from 'primeng/api';

describe('LayersContentTableManagerService', () => {
  let service: LayersContentTableManagerService;
  let storeSpy: jasmine.SpyObj<Store<MapState>>;
  let layerDefServiceSpy: jasmine.SpyObj<LayerDefinitionsService>;
  let mapServiceStub: Partial<MapService>;

  beforeEach(() => {
    storeSpy = jasmine.createSpyObj('Store', ['dispatch']);
    layerDefServiceSpy = jasmine.createSpyObj('LayerDefinitionsService', [
      'getAllAvailableLayers',
    ]);
    // Crea un mock de los métodos que realmente se usen
    const mapMock = jasmine.createSpyObj<Map>('Map', ['on', 'once', 'un']);

    mapServiceStub = {
      map: mapMock,
    };

    layerDefServiceSpy.getAllAvailableLayers.and.returnValue(
      Promise.resolve([])
    );

    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [
        LayersContentTableManagerService,
        { provide: Store, useValue: storeSpy },
        { provide: LayerDefinitionsService, useValue: layerDefServiceSpy },
        { provide: MapService, useValue: mapServiceStub },
        MessageService,
      ],
    });
    service = TestBed.inject(LayersContentTableManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Deberia llamar al metodo getAllAvailableLayers() y disparara la accion setContentTableLayerLists', async () => {
    const mockLayers: CapaMapa[] = [{ leaf: true, checked: false } as CapaMapa];

    layerDefServiceSpy.getAllAvailableLayers.and.returnValue(
      Promise.resolve(mockLayers)
    );

    await service.loadLayerOfContentTable();

    expect(layerDefServiceSpy.getAllAvailableLayers).toHaveBeenCalled();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      MapActions.setContentTableLayerList({ layerList: mockLayers })
    );
  });

  it('Deberia manejar errores en getAllAvailableLayers()', async () => {
    const error = new Error('Test error');
    spyOn(console, 'error');

    layerDefServiceSpy.getAllAvailableLayers.and.returnValue(
      Promise.reject(error)
    );

    try {
      await service.loadLayerOfContentTable();
      fail('Expected error to be thrown');
    } catch (e) {
      console.error('Error loading layers for content table', e);
      expect(console.error).toHaveBeenCalledWith(
        'Error loading layers for content table',
        error
      );
    }
  });

  it('Deberia disparar la accion addLayerToMap para capas hojas con checked igual a true', () => {
    const mockLayer: CapaMapa = {
      leaf: true,
      checked: true,
    } as CapaMapa;

    service.checkActivatedLayerOnInit([mockLayer]);

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

  it('Deberia procesar las capas de manera recursiva', () => {
    const nestedLayer: CapaMapa = {
      leaf: true,
      checked: true,
    } as CapaMapa;

    const parentLayer: CapaMapa = {
      Result: [nestedLayer],
      leaf: false,
    } as CapaMapa;

    service.checkActivatedLayerOnInit([parentLayer]);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      MapActions.addLayerToMap({
        layer: {
          isVisible: true,
          layerDefinition: nestedLayer,
          layerLevel: LayerLevel.INTERMEDIATE,
          orderInMap: 0,
          transparencyLevel: 0,
        },
      })
    );
  });
});
