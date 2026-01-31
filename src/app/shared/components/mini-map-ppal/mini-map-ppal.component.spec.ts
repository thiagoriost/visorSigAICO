import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiniMapPpalComponent } from './mini-map-ppal.component';
import { MiniMapService } from '@app/shared/services/mini-map/mini-map.service';
import { MapService } from '@app/core/services/map-service/map.service';
import Map from 'ol/Map';
import View from 'ol/View';
import { ElementRef } from '@angular/core';

// Mock de MiniMapService
class MockMiniMapService {
  createMiniMap = jasmine.createSpy('createMiniMap');
  removeMiniMap = jasmine.createSpy('removeMiniMap');
}

// Mock de MapService
class MockMapService {
  private map: Map | null = new Map({
    target: document.createElement('div'),
    view: new View({ center: [0, 0], zoom: 5 }),
  });

  getMap(): Map | null {
    return this.map;
  }

  setMap(map: Map | null): void {
    this.map = map;
  }
}

describe('MiniMapPpalComponent', () => {
  let component: MiniMapPpalComponent;
  let fixture: ComponentFixture<MiniMapPpalComponent>;
  let miniMapService: MockMiniMapService;
  let mapService: MockMapService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniMapPpalComponent],
      providers: [
        { provide: MiniMapService, useClass: MockMiniMapService },
        { provide: MapService, useClass: MockMapService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MiniMapPpalComponent);
    component = fixture.componentInstance;
    miniMapService = TestBed.inject(
      MiniMapService
    ) as unknown as MockMiniMapService;
    mapService = TestBed.inject(MapService) as unknown as MockMapService;

    // Simular ViewChild
    component.miniMapContainer = {
      nativeElement: document.createElement('div'),
    } as ElementRef;

    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a createMiniMap si el mapa principal existe', () => {
    spyOn(mapService, 'getMap').and.returnValue(
      new Map({ view: new View({ center: [0, 0], zoom: 5 }) })
    );
    component.ngAfterViewInit();
    expect(miniMapService.createMiniMap).toHaveBeenCalled();
  });

  it('no debería llamar a createMiniMap si el mapa principal es null', () => {
    spyOn(mapService, 'getMap').and.returnValue(null);
    const consoleSpy = spyOn(console, 'error');
    miniMapService.createMiniMap.calls.reset();
    component.ngAfterViewInit();
    expect(miniMapService.createMiniMap).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      'No se encontró el mapa principal al inicializar MiniMap'
    );
  });

  it('debería llamar a removeMiniMap al destruirse', () => {
    component.ngOnDestroy();
    expect(miniMapService.removeMiniMap).toHaveBeenCalled();
  });
});
