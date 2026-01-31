import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { AttributeTableComponent } from './attribute-table.component';
import { MapDrawService } from '../../services/mapDraw/map-draw.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { StoreModule } from '@ngrx/store';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';
import { GeoJSONData } from '../../interfaces/geojsonInterface';

describe('AttributeTableComponent', () => {
  let component: AttributeTableComponent;
  let fixture: ComponentFixture<AttributeTableComponent>;

  // Mock de servicios
  const mockMapDrawService = {
    addGeometryToMap: jasmine.createSpy('addGeometryToMap'),
    createFeatureFromGeometry: jasmine.createSpy('createFeatureFromGeometry'),
    addGeometryGroupToMap: jasmine.createSpy('addGeometryGroupToMap'),
    zoomToFeaturesExtent: jasmine.createSpy('zoomToFeaturesExtent'),
    addSingleGeometryToMap: jasmine.createSpy('addSingleGeometryToMap'),
  };

  const mockMapService = {
    addLayer: jasmine.createSpy('addLayer'),
    removeLayer: jasmine.createSpy('removeLayer'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributeTableComponent, StoreModule.forRoot({})],
      providers: [
        { provide: MapDrawService, useValue: mockMapDrawService },
        { provide: MapService, useValue: mockMapService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AttributeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', fakeAsync(() => {
    fixture.detectChanges(); // Primera detección de cambios
    tick(); // Espera operaciones asíncronas (delay(0))
    fixture.detectChanges(); // Segunda detección después de carga
    expect(component).toBeTruthy();
  }));

  it('debería limpiar la selección y eliminar todas las capas de geometrías seleccionadas del mapa', () => {
    // Arrange: Simulamos selección de filas con geometrías.
    component.selectedRow = [
      {
        id: 1,
        nombre: 'Cundinamarca',
        _geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
      },
      {
        id: 2,
        nombre: 'Antioquia',
        _geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 1],
              [1, 0],
              [0, 0],
            ],
          ],
        },
      },
    ];

    // Act: Llamamos al método que limpia la selección.
    component.limpiarSeleccion();

    // Assert: Verificamos que se haya llamado a `removeLayer` por cada geometría seleccionada.
    expect(mockMapService.removeLayer).toHaveBeenCalledWith(
      { id: 'Geometria_1' },
      'upper'
    );
    expect(mockMapService.removeLayer).toHaveBeenCalledWith(
      { id: 'Geometria_2' },
      'upper'
    );

    // Verificamos que el array de selección está vacío después de limpiar.
    expect(component.selectedRow).toEqual([]);
  });

  it('debería seleccionar una fila y actualizar geometrías, además de hacer zoom', () => {
    // Arrange: Preparamos los datos de la fila seleccionada.
    const mockRow = {
      id: 1,
      nombre: 'Bogotá',
      _geometry: { type: 'Point', coordinates: [0, 0] },
    };
    // Creamos un mock de la geometría como Feature de OpenLayers.
    const mockFeature: Feature<Geometry> = new Feature<Geometry>(
      new Point([0, 0])
    );

    // Espiamos el método `actualizarGeometriasSeleccionadas` para devolver la geometría mock.
    spyOn(component, 'actualizarGeometriasSeleccionadas').and.returnValue([
      mockFeature,
    ]);

    // Creamos un evento simulado que cumple con la interfaz TableRowSelectEvent<Record<string, unknown>>
    const mockEvent = { data: mockRow };

    // Act: Llamamos al método `seleccionarfila` que debe actualizar las geometrías y hacer zoom.
    component.seleccionarfila(mockEvent);

    // Assert: Verificamos que se haya llamado a `addSingleGeometryToMap` con la geometría.
    expect(mockMapDrawService.addSingleGeometryToMap).toHaveBeenCalledWith(
      mockRow._geometry,
      'Geometria_1'
    );
    // Verificamos que el método `actualizarGeometriasSeleccionadas` se haya llamado.
    expect(component.actualizarGeometriasSeleccionadas).toHaveBeenCalled();
    // Verificamos que se haya llamado a `zoomToFeaturesExtent` con la geometría.
    expect(mockMapDrawService.zoomToFeaturesExtent).toHaveBeenCalledWith([
      mockFeature,
    ]);
  });

  it('debería abrir el modal de exportación', () => {
    // Arrange: Establecemos que `visible` es false antes de llamar al método.
    component.visible = false;

    // Act: Llamamos al método `exportarDatos`, que debe cambiar la visibilidad a true.
    component.exportarDatos();

    // Assert: Verificamos que el valor de `visible` ha cambiado a true.
    expect(component.visible).toBeTrue();
  });

  it('debería crear capas cuando attributeTableData.visible es true en procesarData', fakeAsync(() => {
    // Arrange: Preparamos un mock de un GeoJSONData válido.
    const mockGeojson: GeoJSONData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature', // Este campo es necesario según la interfaz GeoJSONGeometrias.
          geometry: { type: 'Point', coordinates: [1, 1] },
          properties: { nombre: 'X' },
        },
      ],
    };

    // Mock de Feature para la geometría.
    const mockFeature = new Feature({
      geometry: new Point([1, 1]),
      properties: { nombre: 'X' },
    });

    // Configuramos los spies.
    mockMapDrawService.createFeatureFromGeometry.and.returnValue(mockFeature);
    mockMapDrawService.addGeometryGroupToMap = jasmine.createSpy();
    mockMapDrawService.zoomToFeaturesExtent = jasmine.createSpy();

    // Asignamos un objeto válido a attributeTableData.
    component.attributeTableData = {
      geojson: mockGeojson,
      visible: true,
      titulo: 'Capa de prueba',
    };

    // Act: llamamos a procesarData.
    fixture.detectChanges(); // Inicia ngAfterViewInit
    tick(); // Completa delay(0)
    component.procesarData(); // Ahora procesa los datos

    // Assert: verificamos las llamadas.
    expect(mockMapDrawService.createFeatureFromGeometry).toHaveBeenCalledWith(
      mockGeojson.features[0].geometry,
      'capa'
    );
    expect(mockMapDrawService.addGeometryGroupToMap).toHaveBeenCalledWith(
      [mockFeature],
      'Capa Geometrias'
    );
    expect(mockMapDrawService.zoomToFeaturesExtent).toHaveBeenCalledWith([
      mockFeature,
    ]);
  }));
});
