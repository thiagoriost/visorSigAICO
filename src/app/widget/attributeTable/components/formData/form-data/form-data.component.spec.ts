import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDataComponent } from './form-data.component';
import { StoreModule } from '@ngrx/store';
import {
  IWidgetConfig,
  WIDGET_CONFIG,
} from '@app/core/config/interfaces/IWidgetConfig';
import { Type } from '@angular/core';

describe('FormDataComponent', () => {
  let component: FormDataComponent;
  let fixture: ComponentFixture<FormDataComponent>;
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
      imports: [FormDataComponent, StoreModule.forRoot({})],
      providers: [{ provide: WIDGET_CONFIG, useValue: mockConfig }],
    }).compileComponents();

    fixture = TestBed.createComponent(FormDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });
});
