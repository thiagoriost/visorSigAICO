import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaAvanzadaComponent } from './consulta-avanzada.component';
import { GeoConsultasService } from '@app/shared/services/geoConsultas/geo-consultas.service';
import { MessageService } from 'primeng/api';
import { StoreModule } from '@ngrx/store';

class GeoConsultasServiceMock implements Partial<GeoConsultasService> {
  ejecutarConsulta = jasmine
    .createSpy('ejecutarConsulta')
    .and.returnValue(Promise.resolve('<xml>respuesta</xml>'));
  transformarAFormatoGeoJSONData = jasmine
    .createSpy('transformarAFormatoGeoJSONData')
    .and.returnValue({ type: 'FeatureCollection', features: [] });
  mostrarResultadosEnTabla = jasmine.createSpy('mostrarResultadosEnTabla');
  cerrarTabla = jasmine.createSpy('cerrarTabla');
}

describe('ConsultaAvanzadaComponent', () => {
  let component: ConsultaAvanzadaComponent;
  let fixture: ComponentFixture<ConsultaAvanzadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaAvanzadaComponent, StoreModule.forRoot({})],
      providers: [
        { provide: GeoConsultasService, useClass: GeoConsultasServiceMock },
        MessageService,
      ],
    })
      .overrideComponent(ConsultaAvanzadaComponent, {
        set: {
          providers: [
            { provide: GeoConsultasService, useClass: GeoConsultasServiceMock },
            MessageService,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ConsultaAvanzadaComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
