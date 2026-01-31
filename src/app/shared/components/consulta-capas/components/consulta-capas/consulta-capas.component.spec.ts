import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaCapasComponent } from './consulta-capas.component';
import { GeoConsultasService } from '@app/shared/services/geoConsultas/geo-consultas.service';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { StoreModule } from '@ngrx/store';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { MessageService } from 'primeng/api';

// Mock del servicio GeoConsultasService
const geoConsultasServiceMock = {
  obtenerAtributosCapa: jasmine
    .createSpy()
    .and.returnValue(Promise.resolve('<xml></xml>')),
  parseLayerAttributes: jasmine
    .createSpy()
    .and.returnValue([{ name: 'attr1' }, { name: 'attr2' }]),
  obtenerValoresAtributo: jasmine
    .createSpy()
    .and.returnValue(Promise.resolve('<xml></xml>')),
  parseAttributeValues: jasmine
    .createSpy()
    .and.returnValue(['valor1', 'valor2']),
};

describe('ConsultaCapasComponent', () => {
  let component: ConsultaCapasComponent;
  let fixture: ComponentFixture<ConsultaCapasComponent>;
  let messageServiceMock: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);
    await TestBed.configureTestingModule({
      imports: [
        ConsultaCapasComponent,
        StoreModule.forRoot({}),
        ReactiveFormsModule,
        FormsModule,
      ],
      providers: [
        { provide: GeoConsultasService, useValue: geoConsultasServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaCapasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe guardar capas en el store', () => {
    const capasMock = {
      layerDefinition: { id: 'c1', titulo: 'Capa Mock', leaf: true },
      layerLevel: LayerLevel.UPPER,
      orderInMap: 0,
      isVisible: true,
      transparencyLevel: 0,
    };
    component.guardarLayerStore([capasMock]);
    expect(component.currentLayerStore).toEqual([capasMock]);
  });

  it('debe procesar capa con atributos correctamente', async () => {
    const capa = {
      layerDefinition: {
        id: 'c1',
        urlServicioWFS: 'http://fake',
        nombre: 'testLayer',
      },
      layerLevel: LayerLevel.UPPER,
      orderInMap: 0,
      isVisible: true,
      transparencyLevel: 0,
    };
    component.guardarLayerStore([
      {
        ...capa,
        layerDefinition: {
          ...capa.layerDefinition,
          titulo: 'Test Layer',
          leaf: true,
        },
      },
    ]);
    const spyEmit = spyOn(component.capaActualizada, 'emit');

    const capaMapaMock: CapaMapa = {
      id: 'c1',
      titulo: 'Test Layer',
      leaf: true,
      urlServicioWFS: 'http://fake',
      nombre: 'testLayer',
    };
    await component.procesarSeleccion(capaMapaMock);

    expect(spyEmit).toHaveBeenCalledWith({
      label: 'Test Layer',
      value: 'c1',
      name: 'testLayer',
      urlServicioWFS: 'http://fake',
    });
    expect(component.attributeValues.length).toBeGreaterThan(0);
  });

  it('debe limpiar los campos correctamente', () => {
    component.selectedLayer = {
      label: 'C',
      value: '1',
      urlServicioWFS: '',
      name: 'c1',
    };
    component.selectedAttribute = { name: 'a', value: 'a' };
    component.selectedValue = { name: 'v', value: 'v' };
    component.mensajeSinAtributos = 'Error';
    component.onLimpiarCampos();
    expect(component.selectedLayer).toBeUndefined();
    expect(component.selectedAttribute).toBeNull();
    expect(component.selectedValue).toBeNull();
    expect(component.mensajeSinAtributos).toBe('');
  });

  it('debe obtener valores al cambiar atributo', async () => {
    component.selectedLayer = {
      label: 'Layer',
      value: '1',
      name: 'layer_name',
      urlServicioWFS: 'http://fake/wfs',
    };
    component.capaSeleccionada = {
      id: '1',
      nombre: 'layer_name',
      urlServicioWFS: 'http://fake/wfs',
      titulo: 'Layer Title',
      leaf: true,
    };

    component.formConsulta.get('selectedAttribute')?.setValue({
      name: 'atributo',
      value: 'atributo',
    });

    const spyEmit = spyOn(component.atributoActualizado, 'emit');
    await component.onAttributeChange();

    expect(geoConsultasServiceMock.obtenerValoresAtributo).toHaveBeenCalled();
    expect(component.attributeValueOptions.length).toBe(2);
    expect(spyEmit).toHaveBeenCalledWith({
      name: 'atributo',
      value: 'atributo',
    });
  });

  it('debe emitir el valor seleccionado', () => {
    const valor = { name: 'valor', value: 'valor' };
    component.formConsulta.get('selectedValue')?.setValue(valor);

    const spyEmit = spyOn(component.valorActualizado, 'emit');
    component.onValueSelect();

    expect(spyEmit).toHaveBeenCalledWith(valor);
  });

  it('debe inicializar el formulario con campos nulos', () => {
    expect(component.formConsulta.get('selectedAttribute')?.value).toBeNull();
    expect(component.formConsulta.get('selectedValue')?.value).toBeNull();
  });
});
