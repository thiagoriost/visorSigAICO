import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultV2Component } from './result-v2.component';
import { ResultIdentifyWMSQuery } from '../../interfaces/ResultIdentifyQuery';
import { ProcessPropertiesFeatureService } from '../../services/process-properties-feature/process-properties-feature.service';
const mockResult: ResultIdentifyWMSQuery = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'ecopetrol_pozos_estado_lisama_2019_pnt_v1.224',
      geometry: {
        type: 'Point',
        coordinates: [-73.54311, 7.022],
      },
      geometry_name: 'geom',
      properties: {
        id: 224,
        nombre: 'NUTRIA 22',
        fid_: 348,
        objectid: 349,
        codigo: 'Pozo_44',
        descripci: 'bombeo mecánico',
        tipo_p: 'Pozo productor',
        tipo_v: 'Ajustar',
        estado: 'Inactivo',
        id_gps: 203,
        conteo: 44,
        este: 1059046.485,
        norte: 1268292.243,
        e_gps: -73.54311,
        n_gps: 7.021996,
        profesiona: 'HOLGER',
        fecha: '2019-11-20Z',
        area_int: 'Nutria',
        images: [
          'https://dev-sigansestral.igac.gov.co/tmp-assets/18_jaba_nukubadziwe.jpg',
          'https://dev-sigansestral.igac.gov.co/tmp-assets/18_jaba_nukubadziwe.jpg',
          'https://dev-sigansestral.igac.gov.co/tmp-assets/18_jaba_nukubadziwe.jpg',
          'https://dev-sigansestral.igac.gov.co/tmp-assets/18_jaba_nukubadziwe.jpg',
          'https://dev-sigansestral.igac.gov.co/tmp-assets/18_jaba_nukubadziwe.jpg',
          'https://dev-sigansestral.igac.gov.co/tmp-assets/18_jaba_nukubadziwe.jpg',
          'https://dev-sigansestral.igac.gov.co/tmp-assets/18_jaba_nukubadziwe.jpg',
          'https://dev-sigansestral.igac.gov.co/tmp-assets/18_jaba_nukubadziwe.jpg',
          'https://dev-sigansestral.igac.gov.co/tmp-assets/18_jaba_nukubadziwe.jpg',
          'https://dev-sigansestral.igac.gov.co/tmp-assets/18_jaba_nukubadziwe.jpg',
        ],
      },
    },
  ],
  totalFeatures: 'unknown',
  crs: {
    type: 'name',
    properties: {
      name: 'urn:ogc:def:crs:EPSG::4326',
    },
  },
};
describe('ResultV2Component', () => {
  let component: ResultV2Component;
  let fixture: ComponentFixture<ResultV2Component>;
  let mockService: jasmine.SpyObj<ProcessPropertiesFeatureService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('processPropertiesFeatureService', [
      'convertObjectToArray',
    ]);
    await TestBed.configureTestingModule({
      imports: [ResultV2Component],
      providers: [
        {
          provide: ProcessPropertiesFeatureService,
          useValue: mockService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultV2Component);
    component = fixture.componentInstance;

    mockService = TestBed.inject(
      ProcessPropertiesFeatureService
    ) as jasmine.SpyObj<ProcessPropertiesFeatureService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive Inputs correctly', () => {
    component.textColorClassForRows = 'text-red';
    component.textColorClassForTitles = 'text-blue';
    component.textColorImageRendererText = 'text-green';
    component.emptyListMessageImageRenderer = 'Sin imágenes';

    expect(component.textColorClassForRows).toBe('text-red');
    expect(component.textColorClassForTitles).toBe('text-blue');
    expect(component.textColorImageRendererText).toBe('text-green');
    expect(component.emptyListMessageImageRenderer).toBe('Sin imágenes');
  });

  it('should load resultArray and resultImages from the service after ngOnInit', () => {
    component.result = mockResult;
    component.ngOnInit();
    expect(component.resultImages.length).toBe(10);
  });
});
