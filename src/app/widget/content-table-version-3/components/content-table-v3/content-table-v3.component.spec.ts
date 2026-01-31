import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentTableV3Component } from './content-table-v3.component';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MapActions } from '@app/core/store/map/map.actions';
import { FilterContentTableService } from '@app/core/services/filter-content-table/filter-content-table.service';
const layerMap: CapaMapa[] = [
  {
    id: '1',
    titulo: 'Capa de Datos Geográficos 1',
    leaf: false,
    descripcionServicio: 'Servicio WMS de mapas geográficos',
    tipoServicio: 'WMS',
    urlMetadatoServicio: 'http://example.com/metadata1',
    url: 'http://example.com/service1',
    estadoServicio: 'Activo',
    checked: true,
    Result: [
      {
        id: '1.1',
        titulo: 'Subcapa 1.1',
        leaf: true,
        tipoServicio: 'WMS',
        urlMetadato: 'http://example.com/metadata1-1',
        nombre: 'Subcapa de detalles',
        descargaCapa: true,
        url: 'http://example.com/service1-1',
      },
    ],
  },
  {
    id: '2',
    titulo: 'Capa de Datos Geográficos 2',
    leaf: false,
    descripcionServicio: 'Servicio WMS de datos geoespaciales',
    tipoServicio: 'WMS',
    urlMetadatoServicio: 'http://example.com/metadata2',
    url: 'http://example.com/service2',
    estadoServicio: 'Inactivo',
    Result: [
      {
        id: '2.1',
        titulo: 'Subcapa 2.1',
        leaf: true,
        tipoServicio: 'REST',
        urlMetadato: 'http://example.com/metadata2-1',
        nombre: 'Subcapa de regiones',
        descargaCapa: false,
        url: 'http://example.com/service2-1',
      },
    ],
  },
  {
    id: '3',
    titulo: 'Capa de Datos de Sensores',
    leaf: true,
    tipoServicio: 'WMS',
    descripcionServicio: 'Servicio WMS de datos de sensores',
    urlMetadatoServicio: 'http://example.com/metadata3',
    estadoServicio: 'Activo',
    url: 'http://example.com/service3',
    checked: false,
  },
  {
    id: '4',
    titulo: 'Capa de Mapas del Territorio',
    leaf: false,
    tipoServicio: 'REST',
    descripcionServicio: 'Servicio REST para mapas del territorio',
    urlMetadatoServicio: 'http://example.com/metadata4',
    url: 'http://example.com/service4',
    estadoServicio: 'Activo',
    idInterno: 123,
    Result: [
      {
        id: '4.1',
        titulo: 'Subcapa de Zonas Urbanas',
        leaf: true,
        tipoServicio: 'REST',
        nombre: 'Zonas urbanas detalladas',
        descargaCapa: true,
        url: 'http://example.com/service4-1',
      },
    ],
  },
  {
    id: '5',
    titulo: 'Capa de Clima Global',
    leaf: true,
    tipoServicio: 'WMS',
    descripcionServicio: 'Servicio WMS de datos climáticos',
    urlMetadatoServicio: 'http://example.com/metadata5',
    url: 'http://example.com/service5',
    estadoServicio: 'Inactivo',
    descargaCapa: true,
  },
];
describe('ContentTableV3Component', () => {
  let component: ContentTableV3Component;
  let fixture: ComponentFixture<ContentTableV3Component>;
  let store: MockStore;
  let filterServiceMock: jasmine.SpyObj<FilterContentTableService>;

  beforeEach(async () => {
    filterServiceMock = jasmine.createSpyObj('FilterContentTableService', [
      'filterNodesLineal',
    ]);
    await TestBed.configureTestingModule({
      imports: [ContentTableV3Component],
      providers: [
        provideMockStore(),
        { provide: FilterContentTableService, useValue: filterServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentTableV3Component);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    component.originalLayerList = layerMap;
    component.layerList = layerMap;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería marcar los nodos correctamente según los seleccionados', () => {
    const tree: CapaMapa[] = [
      // Árbol completo
      {
        id: '1',
        titulo: 'Capa de Datos Geográficos 1',
        leaf: false,
        checked: false,
        Result: [
          {
            id: '1.1',
            titulo: 'Subcapa 1.1',
            leaf: true,
            checked: false,
            Result: [],
          },
        ],
      },
      {
        id: '2',
        titulo: 'Capa de Datos Geográficos 2',
        leaf: false,
        checked: false,
        Result: [
          {
            id: '2.1',
            titulo: 'Subcapa 2.1',
            leaf: true,
            checked: false,
            Result: [],
          },
        ],
      },
      {
        id: '3',
        titulo: 'Capa de Datos de Sensores',
        leaf: true,
        checked: false,
        Result: [],
      },
      {
        id: '4',
        titulo: 'Capa de Mapas del Territorio',
        leaf: false,
        checked: false,
        Result: [
          {
            id: '4.1',
            titulo: 'Subcapa de Zonas Urbanas',
            leaf: true,
            checked: false,
            Result: [],
          },
        ],
      },
      {
        id: '5',
        titulo: 'Capa de Clima Global',
        leaf: true,
        checked: false,
        Result: [],
      },
    ];

    // Capas seleccionadas que deben marcarse
    const selected: CapaMapa[] = [
      {
        id: '4.1',
        titulo: 'Subcapa de Zonas Urbanas',
        leaf: true,
        checked: false,
        Result: [],
      },
      {
        id: '5',
        titulo: 'Capa de Clima Global',
        leaf: true,
        checked: false,
        Result: [],
      },
    ];

    component.selectedLayersList = selected;
    component.markSelectedNodes(tree);

    // ✅ Debe marcar 4.1 (subcapa) y 5 (hoja)
    expect(tree[3].Result?.[0].checked).toBeTrue(); // 4.1
    expect(tree[4].checked).toBeTrue(); // 5

    // ✅ Debe dejar los demás sin marcar
    expect(tree[0].checked).toBeFalse(); // 1
    expect(tree[0].Result?.[0].checked).toBeFalse(); // 1.1
    expect(tree[1].Result?.[0].checked).toBeFalse(); // 2.1
    expect(tree[2].checked).toBeFalse(); // 3
  });

  it('Deberia desmarcar todas las capas', () => {
    const layerListUnChecked = component.setLayerListChecked(layerMap);
    const layerListChecked: CapaMapa[] = [
      {
        id: '1',
        titulo: 'Capa de Datos Geográficos 1',
        leaf: false,
        descripcionServicio: 'Servicio WMS de mapas geográficos',
        tipoServicio: 'WMS',
        urlMetadatoServicio: 'http://example.com/metadata1',
        url: 'http://example.com/service1',
        estadoServicio: 'Activo',
        checked: false,
        Result: [
          {
            id: '1.1',
            titulo: 'Subcapa 1.1',
            leaf: true,
            tipoServicio: 'WMS',
            urlMetadato: 'http://example.com/metadata1-1',
            nombre: 'Subcapa de detalles',
            descargaCapa: true,
            url: 'http://example.com/service1-1',
            checked: false,
          },
        ],
      },
      {
        id: '2',
        titulo: 'Capa de Datos Geográficos 2',
        leaf: false,
        descripcionServicio: 'Servicio WMS de datos geoespaciales',
        tipoServicio: 'WMS',
        urlMetadatoServicio: 'http://example.com/metadata2',
        url: 'http://example.com/service2',
        estadoServicio: 'Inactivo',
        checked: false,
        Result: [
          {
            id: '2.1',
            titulo: 'Subcapa 2.1',
            leaf: true,
            tipoServicio: 'REST',
            urlMetadato: 'http://example.com/metadata2-1',
            nombre: 'Subcapa de regiones',
            descargaCapa: false,
            url: 'http://example.com/service2-1',
            checked: false,
          },
        ],
      },
      {
        id: '3',
        titulo: 'Capa de Datos de Sensores',
        leaf: true,
        tipoServicio: 'WMS',
        descripcionServicio: 'Servicio WMS de datos de sensores',
        urlMetadatoServicio: 'http://example.com/metadata3',
        estadoServicio: 'Activo',
        url: 'http://example.com/service3',
        checked: false,
      },
      {
        id: '4',
        titulo: 'Capa de Mapas del Territorio',
        leaf: false,
        tipoServicio: 'REST',
        descripcionServicio: 'Servicio REST para mapas del territorio',
        urlMetadatoServicio: 'http://example.com/metadata4',
        url: 'http://example.com/service4',
        estadoServicio: 'Activo',
        idInterno: 123,
        checked: false,
        Result: [
          {
            id: '4.1',
            titulo: 'Subcapa de Zonas Urbanas',
            leaf: true,
            tipoServicio: 'REST',
            nombre: 'Zonas urbanas detalladas',
            descargaCapa: true,
            url: 'http://example.com/service4-1',
            checked: false,
          },
        ],
      },
      {
        id: '5',
        titulo: 'Capa de Clima Global',
        leaf: true,
        tipoServicio: 'WMS',
        descripcionServicio: 'Servicio WMS de datos climáticos',
        urlMetadatoServicio: 'http://example.com/metadata5',
        url: 'http://example.com/service5',
        estadoServicio: 'Inactivo',
        descargaCapa: true,
        checked: false,
      },
    ];
    expect(layerListUnChecked).toEqual(layerListChecked);
  });

  it('no debería hacer nada si selectedLayersList está vacío o undefined', () => {
    component.selectedLayersList = [];
    const spySetLayer = spyOn(component, 'setLayerCheckedById');
    const spyDispatch = spyOn(store, 'dispatch');
    component.deleteAllLayers();
    expect(spySetLayer).not.toHaveBeenCalled();
    expect(spyDispatch).not.toHaveBeenCalled();
    expect(component.selectedLayersList.length).toBe(0);
  });

  it('deberia desmarcar capas internas y hacer dispatch por cada capa', () => {
    const layerList: CapaMapa[] = [
      {
        id: '1',
        origin: 'internal',
        titulo: 'Layer 1',
        leaf: true,
      },
      { id: '2', origin: 'external', titulo: 'layer 2', leaf: true },
      { id: '3', titulo: 'Layer 3', leaf: true },
    ];
    component.layerList = layerList;
    component.selectedLayersList = [...layerList];
    const spySetLayer = spyOn(component, 'setLayerCheckedById');
    const spyDispatch = spyOn(store, 'dispatch');
    component.deleteAllLayers();
    expect(spySetLayer).toHaveBeenCalledTimes(2);
    expect(spySetLayer).toHaveBeenCalledWith(layerList, '1', false);
    expect(spySetLayer).toHaveBeenCalledWith(layerList, '3', false);
    expect(spyDispatch).toHaveBeenCalledTimes(2);
    expect(spyDispatch).toHaveBeenCalledWith(
      MapActions.deleteLayerOfMap({ layer: layerList[0] })
    );
    expect(spyDispatch).toHaveBeenCalledWith(
      MapActions.deleteLayerOfMap({ layer: layerList[2] })
    );
    expect(component.selectedLayersList.length).toBe(0);
  });

  it('deberia actualizar el checked de una capa en el nivel raíz', () => {
    const layers: CapaMapa[] = [
      { id: '1', titulo: 'Capa 1', checked: false },
      { id: '2', titulo: 'Capa 2', checked: false },
    ] as CapaMapa[];
    component.setLayerCheckedById(layers, '2', true);
    expect(layers[1].checked).toBeTrue();
    expect(layers[0].checked).toBeFalse();
  });

  it('deberia actualizar el checked de una capa en un nivel anidado', () => {
    const layers: CapaMapa[] = [
      {
        id: '1',
        titulo: 'Capa Padre',
        checked: false,
        Result: [
          { id: '1.1', titulo: 'Hijo', checked: false },
          { id: '1.2', titulo: 'Hijo 2', checked: false },
        ],
      },
    ] as CapaMapa[];

    component.setLayerCheckedById(layers, '1.2', true);
    expect(layers[0].Result![1].checked).toBeTrue();
    expect(layers[0].Result![0].checked).toBeFalse();
  });

  it('no debería cambiar nada si el id no existe', () => {
    const layers: CapaMapa[] = [
      { id: 'a', titulo: 'Capa A', checked: false },
      { id: 'b', titulo: 'Capa B', checked: false },
    ] as CapaMapa[];
    component.setLayerCheckedById(layers, 'z', true);
    expect(layers[0].checked).toBeFalse();
    expect(layers[1].checked).toBeFalse();
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
    filterServiceMock.filterNodesLineal.and.returnValue(capa);
    component.onSearchInput('Layer');
    expect(component.layerList.length).toBe(1);
    expect(component.isFiltering).toBe(true);
  });
});
