import { TestBed } from '@angular/core/testing';

import { FilterContentTableService } from './filter-content-table.service';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';

describe('FilterContentTableService', () => {
  let service: FilterContentTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FilterContentTableService] });
    service = TestBed.inject(FilterContentTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Filtrar nodos linealmente', () => {
    it('Deberia retornar vacio si el texto de la consulta es vacio', () => {
      const result = service.filterNodesLineal('  ', []);
      expect(result.Result?.length).toBe(0);
    });

    it('Deberia retornar las capas de tipo hoja que coincida con la busqueda', () => {
      const tree: CapaMapa[] = [
        { id: '1', titulo: 'Mapa de Ríos', leaf: true },
        {
          id: '2',
          titulo: 'Agrupación',
          leaf: false,
          Result: [{ id: '3', titulo: 'Mapa de Carreteras', leaf: true }],
        },
      ];

      const result = service.filterNodesLineal('mapa', tree);
      expect(result.Result?.length).toBe(2);
      expect(result.Result?.some(n => n.titulo === 'Mapa de Ríos')).toBeTrue();
      expect(
        result.Result?.some(n => n.titulo === 'Mapa de Carreteras')
      ).toBeTrue();
    });

    it('deberia retornar vacio si la consulta no coincide', () => {
      const tree: CapaMapa[] = [
        { id: '1', titulo: 'Sin coincidencia', leaf: true },
      ];

      const result = service.filterNodesLineal('no-existe', tree);
      expect(result.Result?.length).toBe(0);
    });
  });

  describe('Agregar Capas con Unico ID', () => {
    it('Deberia agregar capas no duplicadas', () => {
      const existing: CapaMapa[] = [{ id: '1', titulo: 'Base', leaf: true }];
      const toAdd: CapaMapa = { id: '2', titulo: 'Nueva', leaf: true };

      const updated = service.addLayerWithUniqueID(toAdd, existing);
      expect(updated.length).toBe(2);
      expect(updated.some(l => l.id === '2')).toBeTrue();
    });

    it('No deberia agregar capas duplicadas', () => {
      const existing: CapaMapa[] = [{ id: '1', titulo: 'Base', leaf: true }];
      const toAdd: CapaMapa = { id: '1', titulo: 'Base', leaf: true };

      const updated = service.addLayerWithUniqueID(toAdd, existing);
      expect(updated.length).toBe(1);
    });

    it('Deberia agregar recursivamente las capas con ID unico', () => {
      const existing: CapaMapa[] = [];
      const toAdd: CapaMapa = {
        id: '1',
        titulo: 'Grupo',
        leaf: false,
        Result: [
          { id: '2', titulo: 'Subcapa', leaf: true },
          { id: '3', titulo: 'Subcapa2', leaf: true },
        ],
      };

      const updated = service.addLayerWithUniqueID(toAdd, existing);
      expect(updated.length).toBe(1);
      expect(updated[0].Result?.length).toBe(2);
    });
  });

  describe('Convertir lista de  LayerStore a LIsta de CapaMapa', () => {
    it('Deberia convertir una lista de LayerStore a una lista de CapaMapa', () => {
      const storeList: LayerStore[] = [
        {
          layerDefinition: { id: '1', titulo: 'Layer', leaf: true } as CapaMapa,
          isVisible: true,
          layerLevel: LayerLevel.INTERMEDIATE,
          orderInMap: 0,
          transparencyLevel: 0,
        },
      ];

      const result = service.convertFromLayerStoreListToCapaMapaList(storeList);
      expect(result.length).toBe(1);
      expect(result[0].titulo).toBe('Layer');
    });

    it('Deberia retornar vacio si la lista de entrada es vacia', () => {
      const result = service.convertFromLayerStoreListToCapaMapaList([]);
      expect(result.length).toBe(0);
    });
  });
});
