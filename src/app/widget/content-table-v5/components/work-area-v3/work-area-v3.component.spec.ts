import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkAreaV3Component } from './work-area-v3.component';
import { MemoizedSelector } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MapState } from '@app/core/interfaces/store/map.model';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { selectWorkAreaLayerList } from '@app/core/store/map/map.selectors';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { MapActions } from '@app/core/store/map/map.actions';
import Sortable from 'sortablejs';
import { ElementRef } from '@angular/core';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';

describe('WorkAreaV3Component', () => {
  let component: WorkAreaV3Component;
  let fixture: ComponentFixture<WorkAreaV3Component>;
  let store: MockStore;
  let mockSelector: MemoizedSelector<MapState, LayerStore[]>;

  const initialState: MapState = {
    layers: [],
    // otras props si tu estado las tiene
  } as unknown as MapState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkAreaV3Component],
      providers: [provideMockStore({ initialState }), LayerOptionService],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    mockSelector = store.overrideSelector(selectWorkAreaLayerList, []);
    fixture = TestBed.createComponent(WorkAreaV3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('Deberia ajustar el valor de isEmptyWorkAreaLayerList a true cuando no hay capas', () => {
      mockSelector.setResult([]);
      store.refreshState();
      fixture.detectChanges();
      expect(component.layerStoreList).toEqual([]);
      expect(component.isEmptyWorkAreaLayerList).toBeTrue();
    });

    it('Deberia ajustar el valor de isEmptyWorkAreaLayerList a false cuando existen capas', () => {
      const fakeLayers: LayerStore[] = [
        {
          isVisible: true,
          layerDefinition: { id: '11111', leaf: true, titulo: 'Layer 1 ' },
          layerLevel: LayerLevel.INTERMEDIATE,
          orderInMap: 0,
          transparencyLevel: 0,
        } as LayerStore,
      ];
      mockSelector.setResult(fakeLayers);
      store.refreshState();
      fixture.detectChanges();
      expect(component.layerStoreList).toEqual(fakeLayers);
      expect(component.isEmptyWorkAreaLayerList).toBeFalse();
    });
  });

  describe('turnOnOrOffAllLayers', () => {
    it('Deberia disparar la accion turnOnOrOffAllLayers() con valor true', () => {
      const spyDispatch = spyOn(store, 'dispatch');
      component.turnOnOrOffAllLayers(true);
      expect(spyDispatch).toHaveBeenCalledWith(
        MapActions.turnOnOrOffAllLayers({ stateLayer: true })
      );
    });

    it('Deberia disparar la accion turnOnOrOffAllLayers() con valor false', () => {
      const spyDispatch = spyOn(store, 'dispatch');
      component.turnOnOrOffAllLayers(false);
      expect(spyDispatch).toHaveBeenCalledWith(
        MapActions.turnOnOrOffAllLayers({ stateLayer: false })
      );
    });
  });

  it('Deberia inicializar el Sortable si sortableLayers es definido en el template', () => {
    const div = document.createElement('div');
    component.sortableLayers = {
      nativeElement: div,
    } as ElementRef<HTMLDivElement>;
    const spySortable = spyOn(Sortable, 'create');
    component.ngAfterViewInit();
    expect(spySortable).toHaveBeenCalled();
  });

  it('Deberia completar el destroy$ del subject', () => {
    const completeSpy = spyOn(
      component['destroy$'],
      'complete'
    ).and.callThrough();
    const nextSpy = spyOn(component['destroy$'], 'next').and.callThrough();
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
