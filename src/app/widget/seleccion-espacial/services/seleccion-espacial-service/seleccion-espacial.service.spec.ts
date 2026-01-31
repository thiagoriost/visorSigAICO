import { TestBed } from '@angular/core/testing';
import { SeleccionEspacialService } from './seleccion-espacial.service';
import { MessageService } from 'primeng/api';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { SeleccionEspacialQueryService } from '../seleccion-espacial-query-service/seleccion-espacial-query.service';
import { of } from 'rxjs';
import { MapState } from '@app/core/interfaces/store/map.model';
import { MapService } from '@app/core/services/map-service/map.service';
import { Collection, Map, View } from 'ol';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { GeoJSONGeometrias } from '@app/widget/attributeTable/interfaces/geojsonInterface';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Draw } from 'ol/interaction';
import { createBox } from 'ol/interaction/Draw';
import { Layer } from 'ol/layer';
describe('SeleccionEspacialService', () => {
  let service: SeleccionEspacialService;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockStore: jasmine.SpyObj<Store<MapState>>;
  let spyMockWidgetStore: jasmine.SpyObj<Store<UserInterfaceState>>;
  let spySeleccionEspacialQueryService: jasmine.SpyObj<SeleccionEspacialQueryService>;
  const initialState = {
    map: null,
    proxyURL: 'https://example.com/proxy',
  };
  let spyMapService: jasmine.SpyObj<MapService>;
  beforeEach(() => {
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockStore = jasmine.createSpyObj<Store<MapState>>('Store', ['select']);
    mockStore.select.and.returnValue(of([]));
    spyMockWidgetStore = jasmine.createSpyObj<Store<UserInterfaceState>>(
      'Store',
      ['select', 'dispatch']
    );
    spyMockWidgetStore.select.and.returnValue(of([]));
    spyMapService = jasmine.createSpyObj(
      'mapService',
      [
        'createMap',
        'getMap',
        'getLayerGroupByName',
        'addLayer',
        'removeLayer',
        'showOrHideLayer',
        'generateTransparency',
        'identify',
        'getLayerByDefinition',
      ],
      {
        map: null,
      }
    );

    spySeleccionEspacialQueryService = jasmine.createSpyObj(
      'seleccionEspacialQueryService',
      ['searchWFSFeatures']
    );

    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      providers: [
        SeleccionEspacialService,
        SeleccionEspacialQueryService,
        provideMockStore({ initialState }),
        { provide: Store<MapState>, useValue: mockStore },
        {
          provide: Store<UserInterfaceState>,
          useValue: spyMockWidgetStore,
        },
        { provide: MessageService, useValue: mockMessageService },
        {
          provide: SeleccionEspacialQueryService,
          useValue: spySeleccionEspacialQueryService,
        },
      ],
    });
    service = TestBed.inject(SeleccionEspacialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Deberia mostrar mensaje al tratar de activar la seleccion sin el mapa establecido', () => {
    spyMapService.map = null;
    service.activarSeleccion();
    expect(mockMessageService.add).toHaveBeenCalledWith({
      summary: 'Error',
      detail: 'No se ha cargado el mapa',
      severity: 'error',
      life: 3000,
    });
  });

  it('Deberia llamar al metodo de crear mensaje al activar la seleccion y tener el mapa establecido', () => {
    // Crea la instancia del mapa
    const map: Map = new Map({
      target: 'target',
      layers: [],
      view: new View({
        projection: '',
        center: [],
        zoom: 0,
      }),
    });
    spyMapService.map = map;
    service.crearMensaje(map);
    expect(mockMessageService.add).not.toHaveBeenCalled();
  });

  it('deberia ajustar el valor de la capa seleccionada', () => {
    const layerSelected: CapaMapa = {
      id: '1',
      leaf: true,
      titulo: '',
      checked: true,
    };
    service.setLayerSelected(layerSelected);
    expect(service.selectedLayer).toEqual(layerSelected);
  });

  it('deberia eliminar las geometrias y el area de dibujo', () => {
    spyOn(service, 'deleteGeometries');
    spyOn(service, 'deleteDraw');

    // Crea la instancia del mapa
    const map: Map = new Map({
      target: 'target',
      layers: [],
      view: new View({
        projection: '',
        center: [],
        zoom: 0,
      }),
    });
    spyMapService.map = map;
    service.deleteSelection();
    expect(service.deleteGeometries).toHaveBeenCalled();
    expect(service.deleteDraw).toHaveBeenCalled();
  });

  it('deberia llamar al metodo de dibujar geometria cuando la lista tiene elementos', () => {
    spyOn(service, 'drawGeometry');
    const list: GeoJSONGeometrias[] = [
      {
        geometry: { type: '', coordinates: [1, 2] },
        properties: {},
        type: '',
      },
    ];
    service.drawGeometries(list);
    expect(service.drawGeometry).toHaveBeenCalledWith(list[0]);
  });

  it('deberia llamar al metodo de dibujar geometria cuando se le pasa una geometria valida', () => {
    spyOn(service, 'drawGeometry');
    const geometry = {
      geometry: { type: '', coordinates: [1, 2] },
      properties: {},
      type: '',
    };
    service.drawGeometry(geometry);
    expect(service.drawGeometry).toHaveBeenCalledWith(geometry);
  });

  it('deberia llamar al dispatch del store al eliminar las geometrias', () => {
    service.deleteGeometries();
    expect(spyMockWidgetStore.dispatch).toHaveBeenCalled();
  });

  it('deberia obtener el view del mapa y centrarlo con el valor del center inicial', () => {
    service.initialCenter = [10, 20];
    const map: Map = new Map({
      target: 'target',
      layers: [],
      view: new View({
        projection: '',
        center: [],
        zoom: 0,
      }),
    });
    const view = map.getView();
    spyOn(map, 'getView').and.returnValue(view);
    spyOn(view, 'setCenter');
    service.centerMap(map, null);

    expect(view.setCenter).toHaveBeenCalled();
  });
  it('deberia agregar el dibujo al mapa', () => {
    const map: Map = new Map({
      target: 'target',
      layers: [],
      view: new View({
        projection: '',
        center: [],
        zoom: 0,
      }),
    });
    const vectorSource: VectorSource = new VectorSource();
    const vectorLayer: VectorLayer = new VectorLayer({
      source: vectorSource,
    });
    const drawInteraction = new Draw({
      source: vectorSource,
      type: 'Circle',
      geometryFunction: createBox(),
    });
    spyOn(map, 'addInteraction');
    service.addDrawToMap(map, vectorLayer, drawInteraction, vectorSource);
    expect(map.addInteraction).toHaveBeenCalled();
  });

  it('deberia mover el overlay del mensaje con el puntero', () => {
    const vectorSource: VectorSource = new VectorSource();

    const drawInteraction = new Draw({
      source: vectorSource,
      type: 'Circle',
      geometryFunction: createBox(),
    });
    spyOn(service, 'moveOverlayWithPointer');
    service.moveOverlayWithPointer(drawInteraction);
    expect(service.moveOverlayWithPointer).toHaveBeenCalledWith(
      drawInteraction
    );
  });

  it('deberia llamar al servicio para consultar las geometrias en el servicio WFS', () => {
    const layer: CapaMapa = { id: '1', leaf: true, titulo: '', checked: true };
    const extent: [number, number, number, number] = [1, 2, 3, 4];
    const projection = 'ESPG:4326';
    spySeleccionEspacialQueryService.searchWFSFeatures.and.returnValue(
      Promise.resolve({ type: '', features: [], totalFeatures: '0', crs: {} })
    );
    service.getWFSFeaureInfo(layer, extent, projection);
    expect(
      spySeleccionEspacialQueryService.searchWFSFeatures
    ).toHaveBeenCalled();
  });

  it('deberia eliminar la capa pero no el dibujo ya que su valor es null cuando se llama al metodo de eliminar dibujo', () => {
    const map = new Map({
      target: document.createElement('div'),
      layers: [],
      view: new View({ projection: '', center: [], zoom: 0 }),
    });
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({ source: vectorSource });
    service.vectorLayer = vectorLayer;
    service.drawInteraction = null;
    spyMapService.map = map;
    const layerCollection = new Collection<Layer>([vectorLayer]);
    spyOn(map, 'getLayers').and.returnValue(layerCollection);
    spyOn(map, 'removeInteraction');
    service.deleteDraw();
    expect(map.removeInteraction).not.toHaveBeenCalled();
  });
});
