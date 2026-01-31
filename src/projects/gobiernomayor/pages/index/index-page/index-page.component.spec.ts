import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { IndexPageComponent } from './index-page.component';

import { MapService } from '@app/core/services/map-service/map.service';
import { Store } from '@ngrx/store';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MapLayerManagerService } from '@app/core/services/map-layer-manager/map-layer-manager.service';
import { LayersContentTableManagerService } from '@app/core/services/layers-content-table-manager/layers-content-table-manager.service';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { MessageService } from 'primeng/api';

// ====================================================================
// Mocks
// ====================================================================

const storeMock = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
storeMock.select.and.returnValue(of(null));
storeMock.dispatch.and.stub();

const breakpointObserverMock = {
  observe: jasmine
    .createSpy('observe')
    .and.returnValue(of({ matches: false, breakpoints: {} })),
};

const mapServiceMock = jasmine.createSpyObj<MapService>('MapService', [
  'createMap',
  'getMap',
]);
mapServiceMock.createMap.and.stub();
mapServiceMock.getMap.and.returnValue(null);

const mapLayerManagerServiceMock = {};
const layersContentTableManagerServiceMock = {};

const userInterfaceServiceMock = {
  getInitialFloatingWindowConfig: () =>
    of({
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      maxWidth: 900,
      maxHeight: 900,
      enableClose: true,
      enableResize: true,
      enableDrag: true,
      enableMinimize: true,
      buttomSize: 'small',
      buttomRounded: false,
      iconMinimize: 'pi pi-chevron-up',
      iconMaximize: 'pi pi-chevron-down',
      iconClose: 'pi pi-times',
      iconMinimizePosition: 'right',
      iconClosePosition: 'right',
    } satisfies FloatingWindowConfig),
};

// ====================================================================
// Suite
// ====================================================================

type IndexPageFactories = Pick<
  IndexPageComponent,
  'getConfigFloatingWindow' | 'getMobileOverrides'
>;

describe('IndexPageComponent', () => {
  let component: IndexPageComponent;
  let fixture: ComponentFixture<IndexPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexPageComponent, NoopAnimationsModule],
      providers: [
        { provide: Store, useValue: storeMock },
        { provide: MapService, useValue: mapServiceMock },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
        {
          provide: MapLayerManagerService,
          useValue: mapLayerManagerServiceMock,
        },
        {
          provide: LayersContentTableManagerService,
          useValue: layersContentTableManagerServiceMock,
        },
        { provide: UserInterfaceService, useValue: userInterfaceServiceMock },
        MessageService,
      ],
    }).compileComponents();

    // 👇 Base config literal (sin romper FloatingWindowConfig)
    const baseCfg: FloatingWindowConfig = {
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      maxWidth: 900,
      maxHeight: 900,
      enableClose: true,
      enableResize: true,
      enableDrag: true,
      enableMinimize: true,
      buttomSize: 'small',
      buttomRounded: false,
      iconMinimize: 'pi pi-chevron-up',
      iconMaximize: 'pi pi-chevron-down',
      iconClose: 'pi pi-times',
      iconMinimizePosition: 'right',
      iconClosePosition: 'right',
    };

    const proto = IndexPageComponent.prototype as unknown as IndexPageFactories;
    spyOn(proto, 'getConfigFloatingWindow').and.returnValue(baseCfg);
    spyOn(proto, 'getMobileOverrides').and.returnValue({});

    fixture = TestBed.createComponent(IndexPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(mapServiceMock.createMap).toHaveBeenCalled();
  });
});
