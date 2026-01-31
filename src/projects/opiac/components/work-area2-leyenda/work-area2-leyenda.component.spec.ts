import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkArea2LeyendaComponent } from './work-area2-leyenda.component';
import { StoreModule } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { MapLegendService } from '@app/core/services/map-legend-service/map-legend.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('WorkArea2LeyendaComponent', () => {
  let component: WorkArea2LeyendaComponent;
  let fixture: ComponentFixture<WorkArea2LeyendaComponent>;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let leyendaServiceSpy: jasmine.SpyObj<MapLegendService>;

  beforeEach(async () => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

    leyendaServiceSpy = jasmine.createSpyObj('MapLegendService', [
      'obtenerLeyendaDesdeCapa',
      'obtenerCapasConLeyendas',
    ]);

    // Retornos con tipos correctos
    leyendaServiceSpy.obtenerLeyendaDesdeCapa.and.returnValue(
      'url-leyenda-mock'
    );
    leyendaServiceSpy.obtenerCapasConLeyendas.and.returnValue(
      of({ capas: [], mensajeError: null })
    );

    await TestBed.configureTestingModule({
      imports: [
        WorkArea2LeyendaComponent,
        StoreModule.forRoot({}),
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: MapLegendService, useValue: leyendaServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkArea2LeyendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
