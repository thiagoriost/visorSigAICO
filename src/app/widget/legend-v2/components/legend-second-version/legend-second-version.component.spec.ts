import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegendSecondVersionComponent } from './legend-second-version.component';
import { StoreModule } from '@ngrx/store';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MapLegendService } from '@app/core/services/map-legend-service/map-legend.service';
import { provideMockStore } from '@ngrx/store/testing';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LegendSecondVersionComponent', () => {
  let component: LegendSecondVersionComponent;
  let fixture: ComponentFixture<LegendSecondVersionComponent>;
  // Mock data
  const mockLayers: (LayerStore & { leyendaUrl?: string })[] = [
    {
      isVisible: true,
      layerDefinition: { id: '11234', leaf: true, titulo: 'Layer 1' },
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 0,
      transparencyLevel: 0,
      leyendaUrl: 'https://url-mock.com',
    },
    {
      isVisible: true,
      layerDefinition: { id: '12345', leaf: true, titulo: 'layer 2' },
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 0,
      transparencyLevel: 0,
      leyendaUrl: 'https://otrourl-mock.com',
    },
  ];

  let mockMapLegendService: jasmine.SpyObj<MapLegendService>;

  beforeEach(async () => {
    mockMapLegendService = jasmine.createSpyObj('MapLegendService', [
      'obtenerCapasConLeyendas',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        LegendSecondVersionComponent,
        StoreModule.forRoot({}),
        NoopAnimationsModule,
      ],
      providers: [
        HttpClient,
        HttpHandler,
        { provide: MapLegendService, useValue: mockMapLegendService },
        provideMockStore(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LegendSecondVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deberia cargar la liosta al iniciar el componente', () => {
    component.layerList = mockLayers;
    expect(component.layerList.length).toBe(2);
    expect(component.layerList[0].layerDefinition.titulo).toBe('Layer 1');
  });

  it('Deberia limpiar la suscripcion cuando se destruye el componente', () => {
    const completeSpy = spyOn(
      (component as LegendSecondVersionComponent).destroy$,
      'complete'
    );
    const nextSpy = spyOn(
      (component as LegendSecondVersionComponent).destroy$,
      'next'
    );
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
