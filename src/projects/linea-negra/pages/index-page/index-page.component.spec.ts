import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexPageComponent } from './index-page.component';
import { StoreModule } from '@ngrx/store';
import { Type } from '@angular/core';
import {
  IWidgetConfig,
  WIDGET_CONFIG,
} from '@app/core/config/interfaces/IWidgetConfig';
import { LayersContentTableManagerService } from '@app/core/services/layers-content-table-manager/layers-content-table-manager.service';
import { MessageService } from 'primeng/api';

describe('IndexPageComponent', () => {
  let component: IndexPageComponent;
  let fixture: ComponentFixture<IndexPageComponent>;
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
      imports: [IndexPageComponent, StoreModule.forRoot({})],
      providers: [
        { provide: WIDGET_CONFIG, useValue: mockConfig },
        LayersContentTableManagerService,
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IndexPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
