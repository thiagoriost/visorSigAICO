import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BufferAreaPpalComponent } from './buffer-area-ppal.component';
import { BufferAreaCoordenadaService } from '@app/widget/bufferArea/services/buffer-area-coordenada.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BufferAreaComponent } from '@app/widget/bufferArea/components/buffer-area/buffer-area.component';
import { RadioButton } from 'primeng/radiobutton';
import { BufferAreaLocationComponent } from '@app/widget/bufferArea/components/buffer-area-location/buffer-area-location.component';
import { LoadingDataMaskWithOverlayComponent } from '@app/shared/components/loading-data-mask-with-overlay/loading-data-mask-with-overlay.component';
import { Store } from '@ngrx/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { Type } from '@angular/core';
import {
  IWidgetConfig,
  WIDGET_CONFIG,
} from '@app/core/config/interfaces/IWidgetConfig';

describe('BufferAreaPpalComponent', () => {
  let component: BufferAreaPpalComponent;
  let fixture: ComponentFixture<BufferAreaPpalComponent>;
  let servicioBuffer: jasmine.SpyObj<BufferAreaCoordenadaService>;
  let storeMock: jasmine.SpyObj<Store<unknown>>;
  const mockConfig: IWidgetConfig = {
    widgetsConfig: [
      {
        nombreWidget: 'BaseMap',
        titulo: 'Mapa Base',
        ruta: 'mock/ruta',
        importarComponente: (): Promise<Type<unknown>> =>
          Promise.resolve(
            class MockBaseMapComponent {} as unknown as Type<unknown>
          ),
      },
    ],
    overlayWidgetsConfig: [
      {
        nombreWidget: 'Overlay1',
        titulo: 'Overlay 1',
        ruta: 'mock/ruta',
        importarComponente: (): Promise<Type<unknown>> =>
          Promise.resolve(
            class MockOverlayComponent {} as unknown as Type<unknown>
          ),
      },
    ],
  };

  beforeEach(async () => {
    servicioBuffer = jasmine.createSpyObj<BufferAreaCoordenadaService>(
      'BufferAreaCoordenadaService',
      [
        'dibujarBufferDesdeCoordenada',
        'realizarPeticionBufferDesdeCoordenada',
        'limpiarBuffer',
      ]
    );

    // Simulación de retorno de métodos del servicio
    servicioBuffer.dibujarBufferDesdeCoordenada.and.returnValue(
      Promise.resolve()
    );

    const featureCollectionMock: FeatureCollection<
      Geometry,
      GeoJsonProperties
    > = {
      type: 'FeatureCollection',
      features: [],
    };
    servicioBuffer.realizarPeticionBufferDesdeCoordenada.and.returnValue(
      Promise.resolve(featureCollectionMock)
    );

    // 🛠️ Mock de Store que devuelve un observable (para evitar error de .pipe)
    storeMock = jasmine.createSpyObj<Store<unknown>>('Store', [
      'dispatch',
      'select',
    ]);
    storeMock.select.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [
        BufferAreaPpalComponent, // Standalone
        FormsModule,
        CommonModule,
        BufferAreaComponent,
        RadioButton,
        BufferAreaLocationComponent,
        LoadingDataMaskWithOverlayComponent,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: BufferAreaCoordenadaService, useValue: servicioBuffer },
        { provide: Store, useValue: storeMock },
        { provide: WIDGET_CONFIG, useValue: mockConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BufferAreaPpalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar con el método seleccionado como "selección espacial"', () => {
    component.ngAfterContentInit();
    expect(component.metodoSeleccionado).toEqual({
      label: 'Ubicar por selección espacial',
      value: 'seleccion',
    });
  });

  it('debería cambiar el estado de carga a verdadero', () => {
    component.setLoading(true);
    expect(component.isLoading).toBeTrue();
  });

  it('debería cambiar el estado de carga a falso', () => {
    component.setLoading(false);
    expect(component.isLoading).toBeFalse();
  });

  it('debería contener dos métodos de ubicación disponibles', () => {
    expect(component.metodosUbicacion.length).toBe(2);
    expect(component.metodosUbicacion[0].value).toBe('coordenadas');
    expect(component.metodosUbicacion[1].value).toBe('seleccion');
  });
});
