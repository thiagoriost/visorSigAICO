import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerComponent } from './layer.component';
import { Store } from '@ngrx/store';
import { EventBusService } from '../../../../shared/services/event-bus-service/event-bus.service';
import { MapState } from '@app/core/interfaces/store/map.model';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import * as layersActions from '@app/core/store/map/map.actions';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';

describe('LayerComponent', () => {
  let component: LayerComponent;
  let fixture: ComponentFixture<LayerComponent>;
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

  beforeEach(() => {
    const eventBusServiceMock = jasmine.createSpyObj('EventBusService', [
      'emit',
    ]);
    const storeMock = jasmine.createSpyObj('Store', ['dispatch']);

    TestBed.configureTestingModule({
      imports: [LayerComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,

        { provide: EventBusService, useValue: eventBusServiceMock },
        { provide: Store, useValue: storeMock },
        LayerOptionService,
      ],
    });

    fixture = TestBed.createComponent(LayerComponent);
    component = fixture.componentInstance;

    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store<MapState>>;

    component.layer = mockLayer; // Asignamos el mock de la capa
    fixture.detectChanges(); // Disparar detección de cambios
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch setLayerTransparency and call generateTransparency when transparency changes', () => {
    component.layer = mockLayer;
    component.onChangeSliderValue(mockLayer.layerDefinition, 30);
    component.transparencyValue = 30;
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      layersActions.MapActions.setLayerTransparency({
        layer: mockLayer.layerDefinition,
        transparencyLevel: 70,
      })
    );
  });

  it('should call deleteLayerFromMap and emit event when onDeleteLayer is called', () => {
    component.layer = mockLayer;
    component.onDeleteLayer(mockLayer.layerDefinition);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      layersActions.MapActions.deleteLayerOfMap({
        layer: mockLayer.layerDefinition,
      })
    );
  });

  it('should call showOrHideLayerOfMap when onTurnOffLayer is called', () => {
    component.layer = mockLayer;
    component.onTurnOffLayer(mockLayer.layerDefinition);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      layersActions.MapActions.showOrHideLayerOfMap({
        layer: mockLayer.layerDefinition,
      })
    );
  });

  it('should call showOrHideLayerOfMap when onTurnOnLayer is called', () => {
    component.layer = mockLayer;
    component.onTurnOnLayer(mockLayer.layerDefinition);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      layersActions.MapActions.showOrHideLayerOfMap({
        layer: mockLayer.layerDefinition,
      })
    );
  });

  it('should open metadata URL when onShowMetadata is called', () => {
    component.layer = mockLayer;
    spyOn(window, 'open');
    component.onShowMetadata(mockLayer.layerDefinition);
    expect(window.open).toHaveBeenCalledWith(
      mockLayer.layerDefinition.urlMetadato,
      'blank'
    );
  });
});
