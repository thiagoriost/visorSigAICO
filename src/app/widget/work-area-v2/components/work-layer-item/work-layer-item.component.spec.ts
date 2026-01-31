import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkLayerItemComponent } from './work-layer-item.component';
import { Store, StoreModule } from '@ngrx/store';
import { EventBusService } from '@app/shared/services/event-bus-service/event-bus.service';
import { MapState } from '@app/core/interfaces/store/map.model';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LayerAction } from '@app/core/interfaces/enums/LayerAction.enum';
import * as layersActions from '@app/core/store/map/map.actions';
describe('WorkLayerItemComponent', () => {
  let component: WorkLayerItemComponent;
  let fixture: ComponentFixture<WorkLayerItemComponent>;
  let eventBusServiceSpy: jasmine.SpyObj<EventBusService>;
  let storeSpy: jasmine.SpyObj<Store<MapState>>;

  const mockLayer: LayerStore = {
    layerDefinition: {
      id: '1',
      titulo: 'Layer 1',
      leaf: true,
      urlMetadato: 'https://example.com/metadata',
    },
    layerLevel: LayerLevel.INTERMEDIATE,
    isVisible: true,
    orderInMap: 1,
    transparencyLevel: 50,
  };
  beforeEach(async () => {
    const eventBusServiceMock = jasmine.createSpyObj('EventBusService', [
      'emit',
    ]);
    const storeMock = jasmine.createSpyObj('Store', ['dispatch']);
    await TestBed.configureTestingModule({
      imports: [
        WorkLayerItemComponent,
        StoreModule.forRoot({}),
        ReactiveFormsModule,
      ],
      providers: [
        FormBuilder,
        { provide: EventBusService, useValue: eventBusServiceMock },
        { provide: Store, useValue: storeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkLayerItemComponent);
    component = fixture.componentInstance;
    eventBusServiceSpy = TestBed.inject(
      EventBusService
    ) as jasmine.SpyObj<EventBusService>;
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store<MapState>>;

    component.layer = mockLayer; // Asignamos el mock de la capa
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería enviar setLayerTransparency y llamar a generateTransparency cuando cambia la transparencia', () => {
    const transparencyControl = component.formGroup.get('transparency');
    transparencyControl?.setValue(30);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      layersActions.MapActions.setLayerTransparency({
        layer: mockLayer.layerDefinition,
        transparencyLevel: 70,
      })
    );
  });

  it('debería llamar a deleteLayerFromMap y emitir el evento cuando se llama a onDeleteLayer', () => {
    component.onDeleteLayer();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      layersActions.MapActions.deleteLayerOfMap({
        layer: mockLayer.layerDefinition,
      })
    );

    expect(eventBusServiceSpy.emit).toHaveBeenCalledWith(mockLayer);
  });

  it('debería llamar a showOrOcultLayerOnMap cuando se llama a onHideOrShowLayer', () => {
    component.onHideOrShowLayer();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      layersActions.MapActions.showOrHideLayerOfMap({
        layer: mockLayer.layerDefinition,
      })
    );
  });

  it('Debería abrir la URL de metadatos cuando se llama a onShowMetadata', () => {
    spyOn(window, 'open'); // Espejeamos la función window.open
    component.onShowMetadata();
    expect(window.open).toHaveBeenCalledWith(
      mockLayer.layerDefinition.urlMetadato,
      'blank'
    );
  });

  it('Debería manejar las acciones de capa correctamente en onActionLayer', () => {
    // Probar con la acción DELETE
    spyOn(component, 'onDeleteLayer');
    component.onActionLayer(LayerAction.DELETE);
    expect(component.onDeleteLayer).toHaveBeenCalled();

    // Probar con la acción HIDE
    spyOn(component, 'onHideOrShowLayer');
    component.onActionLayer(LayerAction.HIDE);
    expect(component.onHideOrShowLayer).toHaveBeenCalled();

    // Probar con la acción SHOW
    component.onActionLayer(LayerAction.SHOW);
    expect(component.onHideOrShowLayer).toHaveBeenCalled();

    // Probar con la acción METADATA
    spyOn(component, 'onShowMetadata'); // Espiamos el método onShowMetadata
    component.onActionLayer(LayerAction.METADATA);
    expect(component.onShowMetadata).toHaveBeenCalled();
  });
});
