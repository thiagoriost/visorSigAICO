import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowResultComponent } from './show-result.component';
import { Store, StoreModule } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { GeometryIdentified } from '../../interfaces/GeometryIdentified';
import { of } from 'rxjs';

describe('ShowResultComponent', () => {
  let component: ShowResultComponent;
  let fixture: ComponentFixture<ShowResultComponent>;
  let mockStore: jasmine.SpyObj<Store<MapState>>;

  const mockGeometry: GeometryIdentified = {
    geometry: {
      type: 'FeatureCollection',
      features: [
        { geometry: {}, geometry_name: '', id: '', properties: {}, type: '' },
      ],
      crs: { properties: {} },
      totalFeatures: 'unknown',
    },
    layerName: 'Test Layer',
  };

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj<Store<MapState>>('Store', ['select']);
    mockStore.select.and.returnValue(of(mockGeometry));
    await TestBed.configureTestingModule({
      imports: [ShowResultComponent, StoreModule.forRoot({})],
      providers: [{ provide: Store, useValue: mockStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowResultComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería asignar el resultado al suscribirse al store', () => {
    expect(mockStore.select).toHaveBeenCalled();
    expect(component.result).toEqual(mockGeometry);
  });

  it('debería completar destroy$ en ngOnDestroy', () => {
    const destroySpy = spyOn(component['destroy$'], 'next');
    const completeSpy = spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
