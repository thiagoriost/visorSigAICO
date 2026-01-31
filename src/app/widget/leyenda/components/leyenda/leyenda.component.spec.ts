import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { MessageModule } from 'primeng/message';

import { LeyendaComponent } from './leyenda.component';
import { LeyendaItemComponent } from '@app/widget/leyenda/components/leyenda-item/leyenda-item.component';
import { MapLegendService } from '@app/core/services/map-legend-service/map-legend.service';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LeyendaComponent', () => {
  let component: LeyendaComponent;
  let fixture: ComponentFixture<LeyendaComponent>;
  let mapLegendServiceSpy: jasmine.SpyObj<MapLegendService>;

  const capasSimuladas: (LayerStore & { leyendaUrl?: string })[] = [
    {
      layerDefinition: {
        id: 'capa1',
        titulo: 'Capa de prueba 1',
        leaf: true,
      },
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 1,
      isVisible: true,
      transparencyLevel: 0,
      leyendaUrl: 'http://ejemplo.com/leyenda1.png',
    },
    {
      layerDefinition: {
        id: 'capa2',
        titulo: 'Capa de prueba 2',
        leaf: true,
      },
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 2,
      isVisible: true,
      transparencyLevel: 20,
      leyendaUrl: 'http://ejemplo.com/leyenda2.png',
    },
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj<MapLegendService>('MapLegendService', [
      'obtenerCapasConLeyendas',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ImageModule,
        MessageModule,
        LeyendaItemComponent,
        LeyendaComponent,
        NoopAnimationsModule,
      ],
      declarations: [],
      providers: [{ provide: MapLegendService, useValue: spy }],
    }).compileComponents();

    mapLegendServiceSpy = TestBed.inject(
      MapLegendService
    ) as jasmine.SpyObj<MapLegendService>;

    fixture = TestBed.createComponent(LeyendaComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar las capas con leyendas al inicializarse', () => {
    mapLegendServiceSpy.obtenerCapasConLeyendas.and.returnValue(
      of({ capas: capasSimuladas, mensajeError: null })
    );

    fixture.detectChanges(); // Ejecuta ngOnInit

    expect(component.capas.length).toBe(2);
    expect(component.mensajeError).toBeNull();
  });

  it('debería mostrar el mensaje de error si hay un fallo al cargar leyendas', () => {
    const mensajeSimulado = 'Error al cargar leyendas';
    mapLegendServiceSpy.obtenerCapasConLeyendas.and.returnValue(
      of({ capas: [], mensajeError: mensajeSimulado })
    );

    fixture.detectChanges();

    expect(component.capas.length).toBe(0);
    expect(component.mensajeError).toBe(mensajeSimulado);
  });

  it('debería limpiar las suscripciones al destruir el componente', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
