import { TestBed } from '@angular/core/testing';
import { GeoConsultasService } from './geo-consultas.service';
import { UrlWFSService } from '../urlWFS/url-wfs.service';
import { XmlFilterGeneratorService } from '../XmlFilterGenerator/xml-filter-generator.service';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';

describe('GeoConsultasService', () => {
  let service: GeoConsultasService;
  let urlWFSServiceSpy: jasmine.SpyObj<UrlWFSService>;
  let xmlFilterGeneratorSpy: jasmine.SpyObj<XmlFilterGeneratorService>;
  let userInterfaceServiceSpy: jasmine.SpyObj<UserInterfaceService>;
  let storeSpy: jasmine.SpyObj<Store<MapState>>;

  beforeEach(() => {
    // Crear los spys
    urlWFSServiceSpy = jasmine.createSpyObj('UrlWFSService', [
      'getLayerAttributes',
      'consulta',
    ]);
    xmlFilterGeneratorSpy = jasmine.createSpyObj('XmlFilterGeneratorService', [
      'generarFiltroDesdeExpresion',
    ]);
    userInterfaceServiceSpy = jasmine.createSpyObj('UserInterfaceService', [
      'cambiarVisibleWidget',
    ]);
    storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

    TestBed.configureTestingModule({
      providers: [
        GeoConsultasService,
        { provide: UrlWFSService, useValue: urlWFSServiceSpy },
        { provide: XmlFilterGeneratorService, useValue: xmlFilterGeneratorSpy },
        { provide: UserInterfaceService, useValue: userInterfaceServiceSpy },
        { provide: Store, useValue: storeSpy },
      ],
    });

    service = TestBed.inject(GeoConsultasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should obtain layer attributes', () => {
    // Arrange
    const mockResponse =
      '<xml><element name="name" type="string"></element></xml>';
    urlWFSServiceSpy.getLayerAttributes.and.returnValue(
      Promise.resolve(mockResponse)
    );

    // Act
    service
      .obtenerAtributosCapa('http://example.com/wfs', 'capa1')
      .then(response => {
        // Assert
        expect(response).toBe(mockResponse);
        expect(urlWFSServiceSpy.getLayerAttributes).toHaveBeenCalledWith(
          'http://example.com/wfs',
          ':capa1'
        );
      });
  });

  it('should execute query with expression filter', () => {
    // Arrange
    const mockExpression = "nombre = 'valor'";
    const mockFilter =
      '<filter><property name="nombre" value="valor" /></filter>';
    const mockResponse = '<gml><feature>...</feature></gml>';
    xmlFilterGeneratorSpy.generarFiltroDesdeExpresion.and.returnValue(
      mockFilter
    );
    urlWFSServiceSpy.consulta.and.returnValue(Promise.resolve(mockResponse));

    // Act
    service
      .ejecutarConsulta('http://example.com/wfs', 'capa1', mockExpression)
      .then(response => {
        // Assert
        expect(response).toBe(mockResponse);
        expect(
          xmlFilterGeneratorSpy.generarFiltroDesdeExpresion
        ).toHaveBeenCalledWith(mockExpression);
        expect(urlWFSServiceSpy.consulta).toHaveBeenCalledWith(
          'http://example.com/wfs',
          'capa1',
          mockFilter
        );
      });
  });

  it('should dispatch results to store for table display', () => {
    // Arrange
    const mockGeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [1, 1] },
          properties: {},
        },
      ],
    };
    const titulo = 'Capa 1';

    // Act
    service.mostrarResultadosEnTabla(titulo, mockGeoJSON);

    // Assert
    expect(storeSpy.dispatch).toHaveBeenCalled();
  });
});
