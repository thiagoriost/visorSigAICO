import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsTopBarComponent } from './actions-top-bar.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MapState } from '@app/core/interfaces/store/map.model';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import * as mapsSelectors from '@app/core/store/map/map.selectors';
import { MemoizedSelector } from '@ngrx/store';
import { MapActions } from '@app/core/store/map/map.actions';

describe('ActionsTopBarComponent', () => {
  let component: ActionsTopBarComponent;
  let fixture: ComponentFixture<ActionsTopBarComponent>;
  let store: MockStore<MapState>;
  let dispatchSpy: jasmine.Spy;
  let mockSelector: MemoizedSelector<MapState, LayerStore[]>;
  const mockLayers: LayerStore[] = [
    {
      isVisible: true,
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 0,
      transparencyLevel: 0,
      layerDefinition: {
        id: '1',
        origin: 'internal',
        leaf: true,
        titulo: 'Layer 1',
      },
    },
    {
      isVisible: true,
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 0,
      transparencyLevel: 0,
      layerDefinition: {
        id: '2',
        titulo: 'Layer 2',
        leaf: true,
        origin: 'external',
      },
    },
    {
      isVisible: true,
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 0,
      transparencyLevel: 0,
      layerDefinition: {
        id: '3',
        titulo: 'Layer 3',
        leaf: true,
      },
    },
  ];
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsTopBarComponent],
      providers: [provideMockStore()],
    }).compileComponents();
    store = TestBed.inject(MockStore);
    mockSelector = store.overrideSelector(
      mapsSelectors.selectWorkAreaLayerList,
      mockLayers
    );

    fixture = TestBed.createComponent(ActionsTopBarComponent);
    component = fixture.componentInstance;
    dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia inicializar activatedLayerList y habilitar el borrador cuando existan capas.', () => {
    expect(component.activatedLayerList).toEqual(mockLayers);
    expect(component.disabledEraser).toBeFalse();
  });

  it('Deberia deshabilitar el borrador cuando no hay capas', () => {
    mockSelector.setResult([]);
    store.refreshState();
    fixture.detectChanges();
    expect(component.activatedLayerList).toEqual([]);
    expect(component.disabledEraser).toBeTrue();
  });

  it('Deberia disparar la accion deleteLayerOfMap solo para capas con origen internal o undefined ', () => {
    component.activatedLayerList = [...mockLayers];
    component.deleteAllLayers();
    expect(dispatchSpy).toHaveBeenCalledWith(
      MapActions.deleteLayerOfMap({
        layer: mockLayers[0].layerDefinition,
      })
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      MapActions.deleteLayerOfMap({
        layer: mockLayers[2].layerDefinition,
      })
    );
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      MapActions.deleteLayerOfMap({
        layer: mockLayers[1].layerDefinition,
      })
    );
    expect(component.activatedLayerList.length).toBe(0);
  });

  it('No Deberia disparar la accion deleteLayerOfMap si no hay capas', () => {
    component.activatedLayerList = [];
    component.deleteAllLayers();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('Deberia limpiar destroy$ cuando se destruye el componente', () => {
    const completeSpy = spyOn(component.destroy$, 'complete').and.callThrough();
    component.ngOnDestroy();
    expect(completeSpy).toHaveBeenCalled();
  });
});
