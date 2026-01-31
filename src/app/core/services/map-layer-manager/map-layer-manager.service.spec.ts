import { TestBed } from '@angular/core/testing';
import { MapLayerManagerService } from './map-layer-manager.service';
import { StoreModule } from '@ngrx/store';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { provideMockStore } from '@ngrx/store/testing';
import { MapService } from '../map-service/map.service';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import LayerGroup from 'ol/layer/Group';

describe('MapLayerManagerService', () => {
  let service: MapLayerManagerService;
  let mapServiceSpy: jasmine.SpyObj<MapService>;
  const workAreaLayerList: LayerStore[] = [];
  const initialState = {
    map: { workAreaLayerList: [] },
  };

  let intermediateLayerGroupMock: LayerGroup | null = null;
  beforeEach(() => {
    // Creando un espía para el MapService
    mapServiceSpy = jasmine.createSpyObj('MapService', [
      'addLayer',
      'removeLayer',
      'getLayerByDefinition',
      'getLayerGroupByName',
      'generateTransparency',
      'showOrHideLayer',
    ]);

    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [
        provideMockStore({ initialState }),
        MapLayerManagerService,
        { provide: MapService, useValue: mapServiceSpy },
      ],
    });
    service = TestBed.inject(MapLayerManagerService);
    service.layerList = workAreaLayerList;
    // Mock para el MapService
    intermediateLayerGroupMock = mapServiceSpy.getLayerGroupByName(
      LayerLevel.INTERMEDIATE
    );
    mapServiceSpy.getLayerGroupByName.and.returnValue(
      intermediateLayerGroupMock
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('deleteLayerFromMap', () => {
    it('should call removeLayer of MapService with correct parameters', () => {
      const layerDefinition: CapaMapa = {
        id: '2222',
        titulo: 'Layer 2',
        leaf: true,
      } as CapaMapa;
      const layerLevel: LayerLevel = LayerLevel.INTERMEDIATE;

      const capaStore: LayerStore = {
        layerDefinition: layerDefinition,
        layerLevel: LayerLevel.INTERMEDIATE,
        orderInMap: 1,
        isVisible: true,
        transparencyLevel: 10,
      };
      // Simulamos que la capa sí está en el mapa
      service.layersInMap = [capaStore];

      service.removeLayer(capaStore);

      expect(mapServiceSpy.removeLayer).toHaveBeenCalledWith(
        layerDefinition,
        layerLevel
      );
    });
  });

  describe('addNewLayers', () => {
    it('Al agregar las capas, la lista de capas en el mapa debe ser igual a la lista de capas que se construyeron', () => {
      const layerStoreList: LayerStore[] = [
        {
          layerDefinition: { id: '2222', titulo: 'Layer 2', leaf: true },
          layerLevel: LayerLevel.INTERMEDIATE,
          isVisible: true,
          orderInMap: 1,
          transparencyLevel: 0,
        },

        {
          layerDefinition: { id: '2221', titulo: 'Layer 1', leaf: true },
          layerLevel: LayerLevel.INTERMEDIATE,
          isVisible: true,
          orderInMap: 1,
          transparencyLevel: 0,
        },
      ];
      service.layersInMap = [];
      service.addNewLayers(layerStoreList);
      expect(service.layersInMap.length).toBe(layerStoreList.length);
    });

    it('Al agregar las capas, el metodo de agregar capa se llama con los parametros correctos', () => {
      const layerDefinition: CapaMapa = {
        id: '2222',
        titulo: 'Layer 2',
        leaf: true,
      } as CapaMapa;
      const layerLevel: LayerLevel = LayerLevel.INTERMEDIATE;

      const capaStore: LayerStore = {
        layerDefinition: layerDefinition,
        layerLevel: LayerLevel.INTERMEDIATE,
        orderInMap: 1,
        isVisible: true,
        transparencyLevel: 10,
      };

      const layerStoreList: LayerStore[] = [capaStore];
      service.addNewLayers(layerStoreList);
      expect(mapServiceSpy.addLayer).toHaveBeenCalledWith(
        layerDefinition,
        layerLevel
      );
    });
  });

  describe('processExistingLayers', () => {
    it('No deberia llamar a los servicios para ajustar la transparencia y visibilidad de la(s) capa(s) ya que la capa intermedia es nula', () => {
      // Mock de las capas existentes
      const layerDefinition: CapaMapa = {
        id: '2222',
        titulo: 'Layer 2',
        leaf: true,
      } as CapaMapa;
      const layerLevel: LayerLevel = LayerLevel.INTERMEDIATE;
      const transparencyLevel = 0.5;
      const visibility = true;
      const existingLayer: LayerStore[] = [
        {
          layerDefinition: layerDefinition,
          layerLevel: layerLevel,
          transparencyLevel: transparencyLevel,
          isVisible: visibility,
          orderInMap: 1,
        },
      ];
      // Llamar al método
      service.processExistingLayers(existingLayer);
      mapServiceSpy.getLayerGroupByName.and.returnValue(null);
      // Verificar que se haya ajustado la transparencia y visibilidad
      expect(mapServiceSpy.generateTransparency).not.toHaveBeenCalledWith(
        layerDefinition,
        layerLevel,
        transparencyLevel
      );

      // Verificar que se haya ajustado la transparencia y visibilidad
      expect(mapServiceSpy.showOrHideLayer).not.toHaveBeenCalledWith(
        layerDefinition,
        layerLevel,
        visibility
      );
    });
  });
});
