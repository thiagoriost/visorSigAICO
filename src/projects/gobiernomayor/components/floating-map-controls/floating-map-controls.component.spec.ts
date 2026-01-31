// floating-map-controls.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';

import { FloatingMapControlsComponent } from './floating-map-controls.component';

// Stubs para servicios del hijo <app-map-nav-buttons>
import { MapNavButtonsService } from '@app/widget/map-nav-buttons/services/map-nav-buttons-service/map-nav-buttons.service';
import { NavButtonsMapService } from '@app/widget/map-nav-buttons/services/nav-buttons-map-service/nav-buttons-map.service';

describe('FloatingMapControlsComponent', () => {
  let component: FloatingMapControlsComponent;
  let fixture: ComponentFixture<FloatingMapControlsComponent>;

  // --- BreakpointObserver stub SIN casts y SIN any ---
  const mockState: BreakpointState = {
    matches: false,
    breakpoints: {}, // Record<string, boolean>
  };

  const breakpointStub = {
    observe: jasmine.createSpy('observe').and.returnValue(of(mockState)),
    isMatched: jasmine.createSpy('isMatched').and.returnValue(false),
  };

  const storeSpy = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
  storeSpy.select.and.returnValue(of(null));
  storeSpy.dispatch.and.stub();

  const mapNavButtonsServiceStub: Partial<MapNavButtonsService> = {
    isDrawingZoomBox$: of(false),
    isMaxZoom$: of(false),
    isMinZoom$: of(false),
    setZoomLimit: jasmine.createSpy('setZoomLimit'),
    startZoomBox: jasmine.createSpy('startZoomBox'),
    stopZoomBox: jasmine.createSpy('stopZoomBox'),
  };

  const navButtonsMapServiceStub: Partial<NavButtonsMapService> = {
    zoomIn: jasmine.createSpy('zoomIn'),
    zoomOut: jasmine.createSpy('zoomOut'),
    resetView: jasmine.createSpy('resetView'),
    toggleMouseWheelZoom: jasmine.createSpy('toggleMouseWheelZoom'),
    togglePan: jasmine.createSpy('togglePan'),
    isPaning$: of(false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingMapControlsComponent, NoopAnimationsModule], // standalone
      providers: [
        { provide: BreakpointObserver, useValue: breakpointStub }, // <- sin cast
        { provide: Store, useValue: storeSpy },
        { provide: MapNavButtonsService, useValue: mapNavButtonsServiceStub },
        { provide: NavButtonsMapService, useValue: navButtonsMapServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingMapControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
