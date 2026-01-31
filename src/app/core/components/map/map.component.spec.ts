import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MapComponent } from './map.component';
import { MapService } from '@app/core/services/map-service/map.service';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let store: MockStore;
  let mapServiceMock: jasmine.SpyObj<MapService>;

  beforeEach(async () => {
    mapServiceMock = jasmine.createSpyObj<MapService>('MapService', [
      'createMap',
    ]);
    await TestBed.configureTestingModule({
      imports: [MapComponent],
      providers: [
        provideMockStore(),
        { provide: MapService, useValue: mapServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    store = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log(store);
    expect(component).toBeTruthy();
    expect(mapServiceMock.createMap).toHaveBeenCalled();
  });
});
