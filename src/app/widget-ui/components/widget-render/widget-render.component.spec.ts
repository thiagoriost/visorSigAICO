import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { WidgetRenderComponent } from './widget-render.component';
import {
  IWidgetConfig,
  WIDGET_CONFIG,
} from '@app/core/config/interfaces/IWidgetConfig';
import { Type } from '@angular/core';
// TODO: Completar pruebas unitarias
describe('WidgetRenderComponent', () => {
  let component: WidgetRenderComponent;
  let fixture: ComponentFixture<WidgetRenderComponent>;
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
      imports: [WidgetRenderComponent],
      providers: [
        provideMockStore(),
        { provide: WIDGET_CONFIG, useValue: mockConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WidgetRenderComponent);
    component = fixture.componentInstance;
    component.widgetName = 'nombre-ejemplo';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
