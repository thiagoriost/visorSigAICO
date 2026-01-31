import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LnWindowSingleComponenteRenderComponent } from './ln-window-single-componente-render.component';
import { StoreModule } from '@ngrx/store';
import { Type } from '@angular/core';
import {
  IWidgetConfig,
  WIDGET_CONFIG,
} from '@app/core/config/interfaces/IWidgetConfig';

describe('LnWindowSingleComponenteRenderComponent', () => {
  let component: LnWindowSingleComponenteRenderComponent;
  let fixture: ComponentFixture<LnWindowSingleComponenteRenderComponent>;
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
      imports: [LnWindowSingleComponenteRenderComponent, StoreModule.forRoot()],
      providers: [{ provide: WIDGET_CONFIG, useValue: mockConfig }],
    }).compileComponents();

    fixture = TestBed.createComponent(LnWindowSingleComponenteRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
