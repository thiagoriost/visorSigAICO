import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaSimpleComponent } from './consulta-simple.component';
import { MessageService } from 'primeng/api';
import { GeoConsultasService } from '@app/shared/services/geoConsultas/geo-consultas.service';
import { StoreModule } from '@ngrx/store';
import { BotonesConsultaComponent } from '@app/shared/components/botones-consulta/botones-consulta.component';

class BotonesConsultaMock implements Partial<BotonesConsultaComponent> {
  loading = false;
}

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

describe('ConsultaSimpleComponent', () => {
  let component: ConsultaSimpleComponent;
  let fixture: ComponentFixture<ConsultaSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaSimpleComponent, StoreModule.forRoot({})],
      providers: [
        { provide: GeoConsultasService, useClass: GeoConsultasServiceMock },
        MessageService,
      ],
    })
      .overrideComponent(ConsultaSimpleComponent, {
        set: {
          providers: [
            { provide: GeoConsultasService, useClass: GeoConsultasServiceMock },
            MessageService,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ConsultaSimpleComponent);
    component = fixture.componentInstance;

    // 🔑 Asignamos mocks manualmente para evitar undefined
    component.botonesConsultaComponent =
      new BotonesConsultaMock() as BotonesConsultaComponent;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
