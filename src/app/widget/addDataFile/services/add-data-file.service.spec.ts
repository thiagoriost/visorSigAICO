import { TestBed } from '@angular/core/testing';
import { AddDataFileService } from './add-data-file.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { Store } from '@ngrx/store';
import { GeoJSON, GPX, KML, TopoJSON } from 'ol/format';
import { Feature } from 'ol';
import { View } from 'ol';
import { Map } from 'ol'; // Importar Map

describe('AddDataFileService', () => {
  let service: AddDataFileService;
  let mapService: jasmine.SpyObj<MapService>;

  beforeEach(() => {
    // Creación de los spys de los servicios MapService y Store
    const mapServiceSpy = jasmine.createSpyObj('MapService', [
      'getMap',
      'getLayerGroupByName',
    ]);
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

    // Configuración del TestBed con los servicios simulados
    TestBed.configureTestingModule({
      providers: [
        AddDataFileService,
        { provide: MapService, useValue: mapServiceSpy },
        { provide: Store, useValue: storeSpy },
      ],
    });

    service = TestBed.inject(AddDataFileService);
    mapService = TestBed.inject(MapService) as jasmine.SpyObj<MapService>;
  });

  // Prueba para procesar un archivo GPX correctamente
  it('debería procesar un archivo GPX correctamente', done => {
    const mockFile = new File([''], 'archivo.gpx');
    const mockContent = '<gpx></gpx>';
    const mockFileName = 'archivo.gpx';
    const noop = () => {
      return;
    };
    const spyReadFeatures = spyOn(
      GPX.prototype,
      'readFeatures'
    ).and.returnValue([new Feature()]);

    // Crear un mock de la vista (View)
    const mockView = jasmine.createSpyObj<View>('View', [
      'fit',
      'animate',
      'getZoom',
    ]);
    mockView.fit.and.callFake(noop);
    mockView.animate.and.callFake(noop);
    mockView.getZoom.and.returnValue(10); // Mock de getZoom que devuelve un valor arbitrario, por ejemplo, 10

    // Simular un Map completo, pero solo exponiendo lo necesario
    const mockMap = jasmine.createSpyObj<Map>('Map', ['getView']);
    mockMap.getView.and.returnValue(mockView);

    // Arrange: Preparar el servicio y los mocks
    mapService.getMap.and.returnValue(mockMap);

    // Act: Llamar al método loadData
    service.loadData(mockContent, mockFileName, mockFile);

    // Assert: Verificar que se haya procesado el archivo
    expect(spyReadFeatures).toHaveBeenCalled();
    done();
  });

  // Prueba para procesar un archivo GeoJSON correctamente
  it('debería procesar un archivo GeoJSON correctamente', done => {
    const mockFile = new File([''], 'archivo.geojson');
    const mockContent = '{"type": "FeatureCollection", "features": []}';
    const mockFileName = 'archivo.geojson';
    const noop = () => {
      return;
    };
    const spyReadFeatures = spyOn(
      GeoJSON.prototype,
      'readFeatures'
    ).and.returnValue([new Feature()]);

    // Crear un mock de la vista (View)
    const mockView = jasmine.createSpyObj<View>('View', [
      'fit',
      'animate',
      'getZoom',
    ]);
    mockView.fit.and.callFake(noop);
    mockView.animate.and.callFake(noop);
    mockView.getZoom.and.returnValue(10); // Mock de getZoom que devuelve un valor arbitrario, por ejemplo, 10

    // Simular un Map completo, pero solo exponiendo lo necesario
    const mockMap = jasmine.createSpyObj<Map>('Map', ['getView']);
    mockMap.getView.and.returnValue(mockView);

    // Arrange: Preparar el servicio y los mocks
    mapService.getMap.and.returnValue(mockMap);

    // Act: Llamar al método loadData
    service.loadData(mockContent, mockFileName, mockFile);

    // Assert: Verificar que se haya procesado el archivo
    expect(spyReadFeatures).toHaveBeenCalled();
    done();
  });

  // Prueba para procesar un archivo KML correctamente
  it('debería procesar un archivo KML correctamente', done => {
    const mockFile = new File([''], 'archivo.kml');
    const mockContent = '<kml></kml>';
    const mockFileName = 'archivo.kml';
    const noop = () => {
      return;
    };
    const spyReadFeatures = spyOn(
      KML.prototype,
      'readFeatures'
    ).and.returnValue([new Feature()]);

    // Crear un mock de la vista (View)
    const mockView = jasmine.createSpyObj<View>('View', [
      'fit',
      'animate',
      'getZoom',
    ]);
    mockView.fit.and.callFake(noop);
    mockView.animate.and.callFake(noop);
    mockView.getZoom.and.returnValue(10); // Mock de getZoom que devuelve un valor arbitrario, por ejemplo, 10

    // Simular un Map completo, pero solo exponiendo lo necesario
    const mockMap = jasmine.createSpyObj<Map>('Map', ['getView']);
    mockMap.getView.and.returnValue(mockView);

    // Arrange: Preparar el servicio y los mocks
    mapService.getMap.and.returnValue(mockMap);

    // Act: Llamar al método loadData
    service.loadData(mockContent, mockFileName, mockFile);

    // Assert: Verificar que se haya procesado el archivo
    expect(spyReadFeatures).toHaveBeenCalled();
    done();
  });

  // Prueba para procesar un archivo TopoJSON correctamente
  it('debería procesar un archivo TopoJSON correctamente', done => {
    const mockFile = new File([''], 'archivo.topojson');
    const mockContent = '{"type": "Topology", "objects": {}}';
    const mockFileName = 'archivo.topojson';
    const noop = () => {
      return;
    };
    const spyReadFeatures = spyOn(
      TopoJSON.prototype,
      'readFeatures'
    ).and.returnValue([new Feature()]);

    // Crear un mock de la vista (View)
    const mockView = jasmine.createSpyObj<View>('View', [
      'fit',
      'animate',
      'getZoom',
    ]);
    mockView.fit.and.callFake(noop);
    mockView.animate.and.callFake(noop);
    mockView.getZoom.and.returnValue(10); // Añadir el mock para getZoom, devolviendo un valor arbitrario (10 en este caso)

    // Simular un Map completo, pero solo exponiendo lo necesario
    const mockMap = jasmine.createSpyObj<Map>('Map', ['getView']);
    mockMap.getView.and.returnValue(mockView);

    // Arrange: Preparar el servicio y los mocks
    mapService.getMap.and.returnValue(mockMap);

    // Act: Llamar al método loadData
    service.loadData(mockContent, mockFileName, mockFile);

    // Assert: Verificar que se haya procesado el archivo
    expect(spyReadFeatures).toHaveBeenCalled();
    done();
  });
});
