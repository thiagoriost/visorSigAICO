import { TestBed } from '@angular/core/testing';

import { ProcessPropertiesFeatureService } from './process-properties-feature.service';
import { ResultPairs } from '../../interfaces/ResultPairs';

describe('ProcessPropertiesFeatureService', () => {
  let service: ProcessPropertiesFeatureService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProcessPropertiesFeatureService],
    });
    service = TestBed.inject(ProcessPropertiesFeatureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Deberia convertir un objeto a un array de clave-valor', () => {
    const result = {
      type: '',
      totalFeatures: '1',
      features: [
        {
          type: '',
          id: '',
          geometry: {},
          geometry_name: '',
          properties: { id: '1', name: 'Geometria de prueba' },
        },
      ],
      crs: {},
    };

    service.convertObjectToArray(result);
    expect(service.resultArray).toEqual([
      { key: 'id', type: 'number', value: '1' },
      { key: 'name', type: 'text', value: 'Geometria de prueba' },
    ]);
  });

  describe('Deberia obtener el tipo de dato de acuerdo al valor ingresado', () => {
    it('Deberia retornar el valor de tipo imagen', () => {
      const value = service.getTypeOfFeature('image.png');
      expect(value).toEqual('image');
    });
    it('Deberia retornar el valor de tipo url', () => {
      const value = service.getTypeOfFeature('https://mock.com');
      expect(value).toEqual('url');
    });
    it('Deberia retornar el valor de tipo numero', () => {
      const value = service.getTypeOfFeature('1');
      expect(value).toEqual('number');
    });
    it('Deberia retornar el valor de tipo texto', () => {
      const value = service.getTypeOfFeature('texto de prueba');
      expect(value).toEqual('text');
    });
    it('Deberia retornar el valor de tipo href', () => {
      const value = service.getTypeOfFeature(
        '<a href="https://example.com">Link</a>'
      );
      expect(value).toEqual('href');
    });
  });

  describe('Deberia obtener el tipo de propiedad para los campos de diferente tipo', () => {
    it('Deberia determinar la propiedad de tipo texto', () => {
      const resultPair: ResultPairs[] = service.getTypeOfProperty(
        'prof',
        'Alexander Junco',
        []
      );

      expect(resultPair).toEqual([
        { key: 'prof', value: 'Alexander Junco', type: 'text' },
      ]);
    });
    it('Deberia determinar la propiedad de tipo numero', () => {
      const resultPair: ResultPairs[] = service.getTypeOfProperty(
        'extension',
        25000,
        []
      );

      const expectedResult: ResultPairs[] = [
        { key: 'extension', value: '25000', type: 'number' },
      ];
      expect(resultPair).toEqual(expectedResult);
    });

    it('Deberia determinar la propiedad de tipo Array e iterar cada elemento', () => {
      const resultPair: ResultPairs[] = service.getTypeOfProperty(
        'images',
        [
          'https://dev-sigansestral.igac.gov.co/tmp-assets/18_jaba_nukubadziwe.jpg',
          'https://dev-sigansestral.igac.gov.co/tmp-assets/19_jaba_nukubadziwe.jpg',
          'https://dev-sigansestral.igac.gov.co/tmp-assets/20_jaba_nukubadziwe.jpg',
        ],
        []
      );

      const expectedResult: ResultPairs[] = [
        {
          key: 'images[0]',
          value:
            'https://dev-sigansestral.igac.gov.co/tmp-assets/18_jaba_nukubadziwe.jpg',
          type: 'image',
        },
        {
          key: 'images[1]',
          value:
            'https://dev-sigansestral.igac.gov.co/tmp-assets/19_jaba_nukubadziwe.jpg',
          type: 'image',
        },
        {
          key: 'images[2]',
          value:
            'https://dev-sigansestral.igac.gov.co/tmp-assets/20_jaba_nukubadziwe.jpg',
          type: 'image',
        },
      ];
      expect(resultPair).toEqual(expectedResult);
    });
  });
});
