import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaAvanzadaLineaNegraComponent } from './consulta-avanzada-linea-negra.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule } from '@ngrx/store';
import { Type } from '@angular/core';
import {
  IWidgetConfig,
  WIDGET_CONFIG,
} from '@app/core/config/interfaces/IWidgetConfig';
import { MessageService } from 'primeng/api';

describe('ConsultaAvanzadaLineaNegraComponent', () => {
  let component: ConsultaAvanzadaLineaNegraComponent;
  let fixture: ComponentFixture<ConsultaAvanzadaLineaNegraComponent>;
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
    await TestBed.configureTestingModule({
      imports: [
        ConsultaAvanzadaLineaNegraComponent,
        HttpClientTestingModule,
        StoreModule.forRoot({}),
      ],
      providers: [
        { provide: WIDGET_CONFIG, useValue: mockConfig },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaAvanzadaLineaNegraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
