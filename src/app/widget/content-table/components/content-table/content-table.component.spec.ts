import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTableComponent } from './content-table.component';
import { TreeNode } from 'primeng/api';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { StoreModule } from '@ngrx/store';
const nodes: TreeNode[] = [
  {
    label: 'Root Node 1',
    data: '1',
    icon: 'pi pi-folder',
    expandedIcon: 'pi pi-folder-open',
    collapsedIcon: 'pi pi-folder',
    children: [
      {
        label: 'Child Node 1.1',
        data: '2',
        icon: 'pi pi-file',
        leaf: true,
        checked: false,
        expanded: false,
        key: 'node-2',
        parent: undefined, // Este se asignará más adelante
        styleClass: 'child-node',
        selectable: true,
        draggable: true,
      },
      {
        label: 'Child Node 1.2',
        data: '3',
        icon: 'pi pi-file',
        leaf: true,
        checked: true,
        expanded: false,
        key: 'node-3',
        parent: undefined, // Este se asignará más adelante
        styleClass: 'child-node',
        selectable: true,
        draggable: true,
      },
    ],
    leaf: false, // Este nodo tiene hijos
    expanded: true, // Este nodo está expandido inicialmente
    key: 'node-1',
    parent: undefined, // Este nodo es la raíz
    selectable: true,
    draggable: true,
  },
  {
    label: 'Root Node 2',
    data: '4',
    icon: 'pi pi-folder',
    expandedIcon: 'pi pi-folder-open',
    collapsedIcon: 'pi pi-folder',
    children: [
      {
        label: 'Child Node 2.1',
        data: '5',
        icon: 'pi pi-file',
        leaf: true,
        checked: false,
        expanded: true,
        key: 'node-5',
        parent: undefined, // Este se asignará más adelante
        styleClass: 'child-node',
        selectable: true,
        draggable: true,
      },
    ],
    leaf: false, // Este nodo tiene hijos
    expanded: false, // Este nodo no está expandido inicialmente
    key: 'node-4',
    parent: undefined, // Este nodo es la raíz
    selectable: true,
    draggable: true,
  },
  {
    label: 'Root Node 3',
    data: '6',
    icon: 'pi pi-folder',
    expandedIcon: 'pi pi-folder-open',
    collapsedIcon: 'pi pi-folder',
    children: [],
    leaf: true, // Este nodo no tiene hijos
    expanded: false,
    key: 'node-6',
    parent: undefined, // Este nodo es la raíz
    selectable: true,
    draggable: true,
  },
];

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
describe('ContentTableComponent', () => {
  let component: ContentTableComponent;
  let fixture: ComponentFixture<ContentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentTableComponent, StoreModule.forRoot({})],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentTableComponent);
    component = fixture.componentInstance;
    component.selectedNodes = nodes;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  //bsucar en lista de nodos
  it('exist on list', () => {
    expect(component.existLayerOnList(nodes, '1')).toBeTrue();
  });
  it('exist on list-as children', () => {
    expect(component.existLayerOnList(nodes, '2')).toBeTrue();
  });
  it('no exist on List', () => {
    expect(component.existLayerOnList(nodes, '12345')).toBeFalse();
  });
  //buscar en lista de capas
  it('no exist on layerList', () => {
    expect(component.getLayerByID(layerMap, '12345')).toBe(undefined);
  });
  it(' exist on layerList', () => {
    expect(component.getLayerByID(layerMap, '1')).toEqual({
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
    });
  });
  it(' exist on layerList as children', () => {
    expect(component.getLayerByID(layerMap, '1.1')).toEqual({
      id: '1.1',
      titulo: 'Subcapa 1.1',
      leaf: true,
      tipoServicio: 'WMS',
      urlMetadato: 'http://example.com/metadata1-1',
      nombre: 'Subcapa de detalles',
      descargaCapa: true,
      url: 'http://example.com/service1-1',
    });
  });
  //obtener numero de hijos de un nodo
  it('get children count of a parent Node', () => {
    expect(component.getChildrenNumberOfANode('1')).toEqual(0);
  });
  //encontrar nodo por un id
  it('get node by ID', () => {
    expect(component.findNodeById(nodes, '4')).toEqual({
      label: 'Root Node 2',
      data: '4',
      icon: 'pi pi-folder',
      expandedIcon: 'pi pi-folder-open',
      collapsedIcon: 'pi pi-folder',
      children: [
        {
          label: 'Child Node 2.1',
          data: '5',
          icon: 'pi pi-file',
          leaf: true,
          checked: false,
          expanded: true,
          key: 'node-5',
          parent: undefined, // Este se asignará más adelante
          styleClass: 'child-node',
          selectable: true,
          draggable: true,
        },
      ],
      leaf: false, // Este nodo tiene hijos
      expanded: false, // Este nodo no está expandido inicialmente
      key: 'node-4',
      parent: undefined, // Este nodo es la raíz
      selectable: true,
      draggable: true,
      checked: false,
      partialSelected: false,
    });
  });
  it('get node by ID - not found', () => {
    expect(component.findNodeById(nodes, '41111')).toEqual(null);
  });
});
