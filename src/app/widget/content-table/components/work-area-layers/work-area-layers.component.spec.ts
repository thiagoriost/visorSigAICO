import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkAreaLayersComponent } from './work-area-layers.component';
import { Store, StoreModule } from '@ngrx/store';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { By } from '@angular/platform-browser';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MapState } from '@app/core/interfaces/store/map.model';
import { MapActions } from '@app/core/store/map/map.actions';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';

describe('WorkAreaLayersComponent', () => {
  let component: WorkAreaLayersComponent;
  let fixture: ComponentFixture<WorkAreaLayersComponent>;
  let store: MockStore;

  const mockLayer: LayerStore = {
    layerDefinition: {
      id: '1111',
      titulo: 'Layer 1',
      leaf: true,
    },
    isVisible: true,
    layerLevel: LayerLevel.INTERMEDIATE,
    orderInMap: 1,
    transparencyLevel: 0,
  };

  const othermockLayer: LayerStore = {
    layerDefinition: {
      id: '2222',
      titulo: 'Layer 2',
      leaf: true,
    },
    isVisible: true,
    layerLevel: LayerLevel.INTERMEDIATE,
    orderInMap: 2,
    transparencyLevel: 0.4,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkAreaLayersComponent, StoreModule.forRoot({})],
      providers: [provideMockStore(), LayerOptionService],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkAreaLayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(Store<MapState>) as MockStore;
    spyOn(store, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('debería renderizar la cantidad correcta de layer components', () => {
    // Simulamos una lista de layers
    component.layerList = [
      {
        layerDefinition: { id: '1', leaf: true, titulo: 'Layer 1' },
        isVisible: true,
        layerLevel: LayerLevel.INTERMEDIATE,
        orderInMap: 1,
        transparencyLevel: 60,
      },
    ];

    // Llamamos a detectChanges() para que Angular renderice el componente
    fixture.detectChanges();

    // Buscamos todos los elementos del componente 'app-layer'
    const layerElements = fixture.debugElement.queryAll(By.css('app-layer'));

    // Verificamos que la cantidad de elementos renderizados sea igual a la longitud de la lista de layers
    expect(layerElements.length).toBe(component.layerList.length);
  });

  it('Deberia ajustar la capa cuando inicia el drag en el componente', () => {
    component.dragStart(mockLayer);
    expect(component.draggedLayer).toBe(mockLayer);
  });

  it('Deberia limpiar la variable draggedLayer cuando el drag termina', () => {
    component.draggedLayer = mockLayer;
    component.dragEnd();
    expect(component.draggedLayer).toBeNull();
  });

  it('Deberia reordenar las capas cuando el indice cambia despues de soltar una capa', () => {
    component.draggedLayer = mockLayer;
    component.layerList = [mockLayer, othermockLayer];

    component.onDrop(1);

    expect(store.dispatch).toHaveBeenCalledWith(
      MapActions.updateLayerOrder({ layers: [othermockLayer, mockLayer] })
    );
  });

  it('No deberia disparar acciones cuando se suelta una capa si el indice es el mismo', () => {
    component.draggedLayer = mockLayer;
    component.layerList = [mockLayer, othermockLayer];
    component.onDrop(0);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('Deberia disparar la accion prender capas con el estado true cuando se llama al metodo turnOnAllLayers', () => {
    component.onTurnOnLayers();
    expect(store.dispatch).toHaveBeenCalledWith(
      MapActions.turnOnOrOffAllLayers({ stateLayer: true })
    );
  });

  it('Deberia disparar la accion apagar capas con el estado false cuando se llama al metodo turnOfAllLayers', () => {
    component.onTurnOffLayers();
    expect(store.dispatch).toHaveBeenCalledWith(
      MapActions.turnOnOrOffAllLayers({ stateLayer: false })
    );
  });
});
