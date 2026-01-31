import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeSeleccionEspacialComponent } from './home-seleccion-espacial.component';
import { Store, StoreModule } from '@ngrx/store';

import { MapState } from '@app/core/interfaces/store/map.model';
import { SeleccionEspacialService } from '../../services/seleccion-espacial-service/seleccion-espacial.service';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';

describe('HomeSeleccionEspacialComponent', () => {
  let component: HomeSeleccionEspacialComponent;
  let fixture: ComponentFixture<HomeSeleccionEspacialComponent>;
  let spyseleccionEspacialService: jasmine.SpyObj<SeleccionEspacialService>;
  let storeSpy: jasmine.SpyObj<Store<MapState>>;
  beforeEach(async () => {
    storeSpy = jasmine.createSpyObj<Store<MapState>>('Store', [
      'dispatch',
      'select',
    ]);
    storeSpy.select.and.returnValue(of([]));

    spyseleccionEspacialService = jasmine.createSpyObj(
      'seleccionEspacialService',
      [
        'setLayerSelected',
        'deleteSelection',
        'activarSeleccion',
        'deleteDraw',
        'deleteGeometries',
      ],
      {
        isSearchingInfo$: of(false), // ⬅️ esto simula el observable del servicio
      }
    );

    await TestBed.configureTestingModule({
      imports: [HomeSeleccionEspacialComponent, StoreModule.forRoot({})],
      providers: [
        MessageService,
        { provide: Store, useValue: storeSpy },
        {
          provide: SeleccionEspacialService,
          useValue: spyseleccionEspacialService,
        },
      ],
    })
      // 3) ANULA el provider a nivel de componente
      .overrideComponent(HomeSeleccionEspacialComponent, {
        set: {
          providers: [
            {
              provide: SeleccionEspacialService,
              useValue: spyseleccionEspacialService,
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeSeleccionEspacialComponent);
    component = fixture.componentInstance;
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store<MapState>>;
    spyseleccionEspacialService = TestBed.inject(
      SeleccionEspacialService
    ) as jasmine.SpyObj<SeleccionEspacialService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia mostrar mensaje de error porque no hay una capa seleccionada', () => {
    spyseleccionEspacialService.selectedLayer = undefined;
    component.onselectButton();
    expect(spyseleccionEspacialService.deleteDraw).not.toHaveBeenCalled();
  });

  it('Deberia llamar al metodo de limpiar seleccion cuando se acciona el boton limpiar selección', () => {
    component.cleanSelection();
    expect(spyseleccionEspacialService.deleteSelection).toHaveBeenCalled();
  });

  it('Deberia llamar al servicio de seleccion espacial al seleccionar un area del mapa', () => {
    spyseleccionEspacialService.selectedLayer = {
      id: '1',
      nombre: 'Layer 1',
      titulo: '',
      leaf: true,
    };
    component.onselectButton();
    expect(spyseleccionEspacialService.deleteDraw).toHaveBeenCalled();
  });
});
