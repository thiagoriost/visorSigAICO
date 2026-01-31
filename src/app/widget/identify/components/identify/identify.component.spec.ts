import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentifyComponent } from './identify.component';
import { StoreModule } from '@ngrx/store';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { IdentifyService } from '../../services/identify-service/identify.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { SelectChangeEvent } from 'primeng/select';

describe('IdentifyComponent', () => {
  let component: IdentifyComponent;
  let fixture: ComponentFixture<IdentifyComponent>;
  let mockidentifyService: jasmine.SpyObj<IdentifyService>;
  beforeEach(async () => {
    mockidentifyService = jasmine.createSpyObj('identifyService', [
      'setLayerSelected',
      'deleteGeometry',
      'setIdentifyCursor',
      'resetCursor',
      'deleteGeometryDrawed',
    ]);
    // Añadir observables requeridos como propiedades
    mockidentifyService.error$ = of('');
    await TestBed.configureTestingModule({
      imports: [
        IdentifyComponent,
        StoreModule.forRoot({}),
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: IdentifyService, useValue: mockidentifyService },
        MessageService,
      ],
    })
      .overrideProvider(IdentifyService, { useValue: mockidentifyService })
      .compileComponents();

    fixture = TestBed.createComponent(IdentifyComponent);
    mockidentifyService = TestBed.inject(
      IdentifyService
    ) as jasmine.SpyObj<IdentifyService>;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia convertir una lista de capas del store a una lista de capas mapa', () => {
    const layerStoreList: LayerStore[] = [
      {
        isVisible: true,
        layerDefinition: { id: '1', titulo: 'layer 1', leaf: true },
        layerLevel: LayerLevel.INTERMEDIATE,
        orderInMap: 1,
        transparencyLevel: 0,
      },
      {
        isVisible: true,
        layerDefinition: { id: '2', titulo: 'layer 2', leaf: true },
        layerLevel: LayerLevel.INTERMEDIATE,
        orderInMap: 1,
        transparencyLevel: 0,
      },
    ];
    const capaMapaList: CapaMapa[] = [
      { id: '1', titulo: 'layer 1', leaf: true },
      { id: '2', titulo: 'layer 2', leaf: true },
    ];

    const layerListConverted =
      component.convertLayerStoreListToCapaMapaList(layerStoreList);

    expect(layerListConverted).toEqual(capaMapaList);
  });

  it('Deberia llamar al metodo ajustar capa seleccionada', () => {
    const event = {
      value: { id: '1', leaf: true, titulo: 'Capa prueba' } as CapaMapa,
    } as SelectChangeEvent;

    component.onChangeDropdown(event);
    expect(mockidentifyService.setLayerSelected).toHaveBeenCalled();
  });

  it('Deberia llamar al metodo eliminar geometria al cerrar el componente', () => {
    component.onCleanGeometry();
    expect(mockidentifyService.deleteGeometryDrawed).toHaveBeenCalled();
  });

  it('Deberia cambiar el valor de isWMSService cuando se selecciona una capa de tipo WMS', () => {
    const event = {
      value: {
        id: 'layer1',
        leaf: true,
        titulo: 'Capa de prueba',
        wfs: false,
      } as CapaMapa,
    } as SelectChangeEvent;

    component.onChangeDropdown(event);
    expect(component.isWMSService).toEqual(true);
  });

  it('Deberia cambiar el valor de isWMSService cuando se selecciona una capa de tipo WMS', () => {
    const event = {
      value: {
        id: 'layer1',
        leaf: true,
        titulo: 'Capa de prueba',
        wfs: false,
      },
    } as SelectChangeEvent;

    component.onChangeDropdown(event);
    fixture.detectChanges();

    const message = fixture.debugElement.query(By.css('p-message'));
    expect(message).not.toBeNull();

    const messageText = message.nativeElement.textContent;
    expect(messageText).toContain(component.WMSMessage);
  });
});
