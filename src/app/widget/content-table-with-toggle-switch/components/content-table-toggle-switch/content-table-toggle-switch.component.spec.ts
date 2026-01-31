import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTableToggleSwitchComponent } from './content-table-toggle-switch.component';
import { Store, StoreModule } from '@ngrx/store';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { MapState } from '@app/core/interfaces/store/map.model';
import { of } from 'rxjs';

describe('ContentTableToggleSwitchComponent', () => {
  let component: ContentTableToggleSwitchComponent;
  let fixture: ComponentFixture<ContentTableToggleSwitchComponent>;
  let storemock: jasmine.SpyObj<Store<MapState>>;

  const selecTedLayerList: CapaMapa[] = [
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

  beforeEach(async () => {
    storemock = jasmine.createSpyObj<Store<MapState>>('Store', [
      'dispatch',
      'select',
    ]);
    storemock.select.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [ContentTableToggleSwitchComponent, StoreModule.forRoot({})],
      providers: [{ provide: Store, useValue: storemock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentTableToggleSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia Eliminar todas las capas activas cuando se presiona el boton desseleccionarTodo', () => {
    component.selectedLayersList = selecTedLayerList;
    component.deleteAllLayers();
    expect(component.selectedLayersList.length).toEqual(0);
  });

  it('debería cancelar la suscripción al destruir el componente', () => {
    const destroy$ = component['destroy$'];

    spyOn(destroy$, 'next').and.callThrough();
    spyOn(destroy$, 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(destroy$.next).toHaveBeenCalled();
    expect(destroy$.complete).toHaveBeenCalled();
  });

  it('debería actualizar el checked correctamente por ID', () => {
    const layers: CapaMapa[] = [
      {
        id: '1',
        titulo: 'Padre',
        checked: false,
        leaf: false,
        Result: [
          { id: '2', titulo: 'Hijo', checked: false, leaf: true, Result: [] },
        ],
      },
    ];
    component.setLayerCheckedById(layers, '2', true);
    expect(layers[0]?.Result?.[0].checked).toBeTrue();
  });
});
