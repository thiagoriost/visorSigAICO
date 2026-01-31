import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddWmsComponent } from './add-wms.component';
import { UrlWMSService } from '@app/shared/services/urlWMS/url-wms.service';
import { Store, StoreModule } from '@ngrx/store';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { MapActions } from '@app/core/store/map/map.actions';
import { provideAnimations } from '@angular/platform-browser/animations';

// Datos simulados para pruebas de capas obtenidas desde el servicio
const mockLayers = [{ Name: 'Layer1' }, { Name: 'Layer2' }];

const mockLayer: CapaMapa = {
  id: 'Layer1',
  titulo: 'Capa de prueba',
  leaf: true,
  descripcionServicio: 'CNTI_Geoserver',
  urlMetadatoServicio: 'https://metadata.url',
  tipoServicio: 'WMS',
  wfs: false,
  urlMetadato: 'https://metadata.url',
  nombre: 'Layer1',
  descargaCapa: false,
  url: 'https://legend.url',
  estadoServicio: 'A',
  idInterno: 1234,
  checked: true,
  urlServicioWFS: 'https://valid.url',
  origin: 'external',
};

// Se define la estructura esperada en el store
const mockLayerStore: LayerStore = {
  isVisible: true,
  layerDefinition: mockLayer,
  layerLevel: LayerLevel.INTERMEDIATE,
  orderInMap: 0,
  transparencyLevel: 0,
};

describe('AddWmsComponent', () => {
  let component: AddWmsComponent;
  let fixture: ComponentFixture<AddWmsComponent>;
  let urlWMSServiceSpy: jasmine.SpyObj<UrlWMSService>;
  let storeSpy: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    // Arrange: Configurar espía para el servicio UrlWMSService
    const spy = jasmine.createSpyObj('UrlWMSService', ['getLayersFromWMS']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, StoreModule.forRoot({}), AddWmsComponent],
      providers: [
        FormBuilder,
        { provide: UrlWMSService, useValue: spy }, // Inyectamos el servicio simulado
        {
          provide: Store,
          useValue: jasmine.createSpyObj('Store', ['dispatch']),
        }, // Espía para Store
        provideAnimations(),
      ],
    }).compileComponents();

    // Creación del componente y obtención de inyecciones simuladas
    fixture = TestBed.createComponent(AddWmsComponent);
    component = fixture.componentInstance;
    urlWMSServiceSpy = TestBed.inject(
      UrlWMSService
    ) as jasmine.SpyObj<UrlWMSService>;
    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;

    fixture.detectChanges();
  });

  it('should create', () => {
    // Verificamos que el componente se ha creado correctamente
    expect(component).toBeTruthy();
  });

  it('debería obtener capas cuando la URL es válida', async () => {
    // Arrange: Simulación de respuesta del servicio con capas mock
    urlWMSServiceSpy.getLayersFromWMS.and.returnValue(
      Promise.resolve(mockLayers)
    );

    // Act: Simulación de entrada del usuario y ejecución de búsqueda de capas
    component.formGroup.setValue({
      url: 'https://valid.url',
      selectedLayers: [],
    });
    await component.searchLayers();

    // Assert: Se verifica que las capas se asignaron correctamente
    expect(component.layers).toEqual(mockLayers);
    expect(component.urlValid).toBeTrue();
  });

  it('should add a layer when one is selected', () => {
    // Arrange: Configurar una capa simulada
    const mockLayer = {
      Name: 'TestLayer',
      Title: 'Capa de prueba',
      Abstract: { metadataURL: 'https://metadata.url' },
      Style: {
        LegendURL: { OnlineResource: { '@xlink:href': 'https://legend.url' } },
      },
    };

    // Simulación de entrada del usuario en el formulario
    component.formGroup.setValue({
      url: 'https://valid.url',
      selectedLayers: mockLayer,
    });

    // Act: Ejecutamos el método addLayer
    component.addLayer();

    // Assert: Se espera que se despache una acción con los datos correctos
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        layer: jasmine.objectContaining({
          layerDefinition: jasmine.objectContaining({ nombre: 'TestLayer' }),
        }),
      })
    );
  });

  it('should show an error when no layer is selected', () => {
    // Arrange: Configurar un espía para capturar errores en consola
    spyOn(console, 'error');

    // Simulación de un formulario sin capa seleccionada
    component.formGroup.setValue({
      url: 'https://valid.url',
      selectedLayers: null,
    });

    // Act: Intentar agregar una capa sin haber seleccionado una
    component.addLayer();

    // Assert: Se espera que se muestre un error en la consola y no se llame dispatch
    expect(console.error).toHaveBeenCalledWith(
      'No se ha seleccionado ninguna capa.'
    );
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch the action of adding the layer to the store', () => {
    // Act: Se llama al método privado addLayerToStore
    component['addLayerToStore'](mockLayer);

    // Assert: Se espera que se haya despachado la acción correcta con la capa esperada
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      MapActions.addLayerToMap({ layer: mockLayerStore })
    );
  });
});
