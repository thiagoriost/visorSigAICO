import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { MapNavButtonsComponent } from './map-nav-buttons.component';
import { MapNavButtonsService } from '@app/widget/map-nav-buttons/services/map-nav-buttons-service/map-nav-buttons.service';
import { NavButtonsMapService } from '@app/widget/map-nav-buttons/services/nav-buttons-map-service/nav-buttons-map.service';
import { MapNavButtonsInterface } from '@app/widget/map-nav-buttons/interfaces/map-nav-buttons.interface';
import { ActionsMapNavButtons } from '@app/core/interfaces/store/user-interface.model';
import { setZoomModes } from '@app/core/store/user-interface/user-interface.actions';
import { MapActions } from '@app/core/store/map/map.actions';
import { MapHistoryService } from '../../services/map-history-service/map-history.service';
import {
  selectCanGoBack,
  selectCanGoForward,
} from '@app/core/store/map/map.selectors';

describe('MapNavButtonsComponent', () => {
  let component: MapNavButtonsComponent;
  let fixture: ComponentFixture<MapNavButtonsComponent>;
  let store: MockStore;
  let mockMapNavService: jasmine.SpyObj<MapNavButtonsService>;
  let mockNavButtonsMapService: jasmine.SpyObj<NavButtonsMapService>;
  let mockHistoryService: jasmine.SpyObj<MapHistoryService>;
  const mockWidgetConfig: MapNavButtonsInterface = {
    showZoomIn: true,
    showZoomOut: true,
    showAdvancedZoomIn: true,
    showAdvancedZoomOut: true,
    showResetView: true,
    showToggleMouseWheelZoom: true,
    showPan: true,
    isPanEnabled: false,
    initialCenter: [0, 0],
    initialZoom: 5,
    isMouseWheelZoomEnabled: true,
    minZoom: 1,
    maxZoom: 10,
    orderZoomIn: 0,
    orderZoomOut: 0,
    orderAdvancedZoomIn: 0,
    orderAdvancedZoomOut: 0,
    orderResetView: 0,
    orderToggleMouseWheelZoom: 0,
    orderPan: 0,
    gapButtons: 2,
    showHistory: false,
    orderHistoryBack: 0,
    orderHistoryNext: 0,
  };

  const initialActionState: ActionsMapNavButtons = {
    isAdvancedZoomInActive: false,
    isAdvancedZoomOutActive: false,
    isDrawingZoomBox: false,
    isPaning: false,
  };

  beforeEach(async () => {
    mockMapNavService = jasmine.createSpyObj<MapNavButtonsService>(
      'MapNavButtonsService',
      ['startZoomBox', 'stopZoomBox', 'setZoomLimit'],
      {
        isMaxZoom$: of(false),
        isMinZoom$: of(false),
      }
    );
    mockNavButtonsMapService = jasmine.createSpyObj<NavButtonsMapService>(
      'NavButtonsMapService',
      ['zoomIn', 'zoomOut', 'resetView', 'toggleMouseWheelZoom', 'togglePan']
    );

    mockHistoryService = jasmine.createSpyObj<MapHistoryService>(
      'MapHistoryService',
      ['goBack', 'goForward', 'setInactivateService']
    );

    await TestBed.configureTestingModule({
      imports: [MapNavButtonsComponent],
      providers: [
        provideMockStore(),
        { provide: MapNavButtonsService, useValue: mockMapNavService },
        { provide: NavButtonsMapService, useValue: mockNavButtonsMapService },
      ],
    })
      .overrideComponent(MapNavButtonsComponent, {
        remove: { providers: [NavButtonsMapService] },
      })
      .overrideProvider(MapHistoryService, { useValue: mockHistoryService })
      .compileComponents();

    fixture = TestBed.createComponent(MapNavButtonsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar configMapNavButtons en ngOnInit con valores del store', () => {
    const selectSpy = spyOn(store, 'select').and.returnValue(
      of(mockWidgetConfig)
    );
    fixture.detectChanges();
    component.ngOnInit();

    expect(selectSpy).toHaveBeenCalled();
    expect(mockMapNavService.setZoomLimit).toHaveBeenCalledWith(
      mockWidgetConfig.minZoom,
      mockWidgetConfig.maxZoom,
      mockWidgetConfig.isPanEnabled
    );
  });

  it('debería ejecutar zoomIn cuando se llama onZoomIn()', () => {
    component.onZoomIn();
    expect(mockNavButtonsMapService.zoomIn).toHaveBeenCalled();
  });

  it('debería ejecutar zoomOut cuando se llama onZoomOut()', () => {
    component.onZoomOut();
    expect(mockNavButtonsMapService.zoomOut).toHaveBeenCalled();
  });

  it('debería alternar el modo advanced zoom in correctamente', () => {
    component.stateMapNavButtons = { ...initialActionState };
    const dispatchSpy = spyOn(store, 'dispatch');
    component.configMapNavButtons = { ...mockWidgetConfig };

    component.onAdvancedZoomIn();

    expect(mockMapNavService.startZoomBox).toHaveBeenCalledWith(
      true,
      undefined
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      setZoomModes({
        isAdvancedZoomInActive: true,
        isAdvancedZoomOutActive: false,
        isDrawingZoomBox: true,
      })
    );
  });

  it('debería alternar el modo advanced zoom out correctamente', () => {
    component.stateMapNavButtons = { ...initialActionState };
    const dispatchSpy = spyOn(store, 'dispatch');
    component.configMapNavButtons = { ...mockWidgetConfig };

    component.onAdvancedZoomOut();

    expect(mockMapNavService.startZoomBox).toHaveBeenCalledWith(
      false,
      undefined
    );
    expect(dispatchSpy).toHaveBeenCalledWith(
      setZoomModes({
        isAdvancedZoomInActive: false,
        isAdvancedZoomOutActive: true,
        isDrawingZoomBox: true,
      })
    );
  });

  it('debería llamar resetView en el servicio al ejecutar onResetView()', () => {
    component.configMapNavButtons = mockWidgetConfig;
    component.stateMapNavButtons = { ...initialActionState };
    const dispatchSpy = spyOn(store, 'dispatch');

    component.onResetView();

    expect(mockNavButtonsMapService.resetView).toHaveBeenCalledWith(
      mockWidgetConfig.initialCenter,
      mockWidgetConfig.initialZoom
    );

    // También verificar que no se active zoom avanzado
    expect(dispatchSpy).not.toHaveBeenCalledWith(
      setZoomModes({
        isAdvancedZoomInActive: true,
        isAdvancedZoomOutActive: true,
        isDrawingZoomBox: true,
      })
    );
  });

  it('debería alternar el estado del mouse wheel zoom', () => {
    component.configMapNavButtons = {
      ...mockWidgetConfig,
      isMouseWheelZoomEnabled: true,
    };
    const dispatchSpy = spyOn(store, 'dispatch');

    component.onToggleMouseWheelZoom();

    const expectedData: MapNavButtonsInterface = {
      ...mockWidgetConfig,
      isMouseWheelZoomEnabled: false,
    };

    expect(dispatchSpy).toHaveBeenCalledWith(
      MapActions.setWidgetNavButtonsData({
        widgetId: 'MapNavButtons',
        data: expectedData,
      })
    );
    expect(mockNavButtonsMapService.toggleMouseWheelZoom).toHaveBeenCalledWith(
      true
    );
  });

  it('debería cancelar las suscripciones en ngOnDestroy()', () => {
    const unsubscribeSpy = spyOn(component['subscription'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('debería ejecutar goBack cuando se llama onClickBack()', () => {
    component.onClickBack();
    expect(mockHistoryService.goBack).toHaveBeenCalled();
  });

  it('debería ejecutar goForward cuando se llama onClickNext()', () => {
    component.onClickNext();
    expect(mockHistoryService.goForward).toHaveBeenCalled();
  });

  it('debería deshabilitar el botón de historial atrás cuando el selector retorna false', () => {
    component.configMapNavButtons = { ...mockWidgetConfig, showHistory: true };

    store.overrideSelector(selectCanGoBack, false);
    store.refreshState();

    expect(component.isBackHistory).toBeFalse();
  });

  it('debería deshabilitar el botón de historial adelante cuando el selector retorna false', () => {
    component.configMapNavButtons = { ...mockWidgetConfig, showHistory: true };

    store.overrideSelector(selectCanGoForward, false);
    store.refreshState();

    expect(component.isForwadHistory).toBeFalse();
  });
});
