import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTableV4Component } from './content-table-v4.component';
import { Store } from '@ngrx/store';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { MapState } from '@app/core/interfaces/store/map.model';
import { of } from 'rxjs';
import { MapActions } from '@app/core/store/map/map.actions';
import { FilterContentTableService } from '@app/core/services/filter-content-table/filter-content-table.service';

describe('ContentTableV4Component', () => {
  let component: ContentTableV4Component;
  let fixture: ComponentFixture<ContentTableV4Component>;
  let storemock: jasmine.SpyObj<Store<MapState>>;
  let mockFilterService: jasmine.SpyObj<FilterContentTableService>;

  beforeEach(async () => {
    storemock = jasmine.createSpyObj<Store<MapState>>('Store', [
      'dispatch',
      'select',
    ]);
    storemock.select.and.returnValue(of([]));
    mockFilterService = jasmine.createSpyObj('', ['filterNodesLineal'], {
      Result: [],
    });
    await TestBed.configureTestingModule({
      imports: [ContentTableV4Component],
      providers: [
        { provide: Store, useValue: storemock },
        {
          provide: FilterContentTableService,
          userValue: mockFilterService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentTableV4Component);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(' deberia ajustar todas las capas como desmarcadas', () => {
    const layers: CapaMapa[] = [
      {
        id: '1',
        titulo: 'Layer 1',
        checked: true,
        Result: [],
        leaf: true,
      } as CapaMapa,
    ];
    const result = component.setLayerListChecked(layers);
    expect(result[0].checked).toBe(false);
  });

  it('Deberia disparar la accion de deleteLayerOfMap() y limpiar selectedLayerList cuando se accione deleteAllLayers()', () => {
    const capa: CapaMapa = {
      id: '1',
      titulo: 'Layer 1',
      origin: 'internal',
      Result: [],
      leaf: true,
    } as CapaMapa;
    component.selectedLayersList = [capa];
    component.layerList = [capa];

    component.deleteAllLayers();

    expect(storemock.dispatch).toHaveBeenCalledWith(
      MapActions.deleteLayerOfMap({ layer: capa })
    );
    expect(component.selectedLayersList.length).toBe(0);
  });

  it('deberia restaurar la lista cuando el filtro es vacio ', () => {
    const capa: CapaMapa = {
      id: '1',
      titulo: 'Layer 1',
      checked: false,
      Result: [],
      leaf: true,
    } as CapaMapa;
    component.originalLayerList = [capa];
    fixture.detectChanges();
    component.onSearchInput('');
    expect(component.layerList.length).toBe(1);
    expect(component.isFiltering).toBe(false);
  });

  it('deberia filtrar la lista cuando el filtro tiene un valor', () => {
    const capa: CapaMapa = {
      id: '1',
      titulo: 'Layer 1',
      checked: false,
      Result: [],
      leaf: true,
    } as CapaMapa;
    component.originalLayerList = [capa];
    mockFilterService.filterNodesLineal.and.returnValue(capa);
    component.onSearchInput('Layer');
    expect(component.layerList.length).toBe(1);
    expect(component.isFiltering).toBe(true);
  });

  it('deberia ajustar el valor de checked cuando encuentra un id coincidente', () => {
    const capa: CapaMapa = {
      id: '1',
      titulo: 'Layer 1',
      checked: false,
      Result: [],
      leaf: true,
    } as CapaMapa;
    const list = [capa];
    component.setLayerCheckedById(list, '1', true);
    expect(list[0].checked).toBe(true);
  });

  it('deberia marcar los nodos que estan en selectedLayerList', () => {
    const capa: CapaMapa = {
      id: '1',
      titulo: 'Layer 1',
      checked: false,
      Result: [],
      leaf: true,
    } as CapaMapa;
    component.selectedLayersList = [capa];
    const tree = [{ ...capa }];
    component.markSelectedNodes(tree);
    expect(tree[0].checked).toBe(true);
  });
});
