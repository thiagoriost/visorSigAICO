import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddDataFileComponent } from './add-data-file.component';
import { AddDataFileService } from '@app/widget/addDataFile/services/add-data-file.service';
import { MessageService } from 'primeng/api';
import { FileSelectEvent } from 'primeng/fileupload';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MapService } from '@app/core/services/map-service/map.service';

/**
 * Mock de AddDataFileService para pruebas unitarias.
 */
class MockAddDataFileService {
  loadData = jasmine.createSpy('loadData');
}

/**
 * Mock de MessageService para pruebas unitarias.
 */
class MockMessageService {
  add = jasmine.createSpy('add');
}

/**
 * Mock de MapService para pruebas unitarias.
 */
class MockMapService {
  getMap = jasmine.createSpy().and.returnValue({
    getView: () => ({
      fit: jasmine.createSpy(),
    }),
  });

  getLayerGroupByName = jasmine.createSpy().and.returnValue({
    getLayers: () => ({
      push: jasmine.createSpy(),
    }),
  });
}

describe('AddDataFileComponent', () => {
  let component: AddDataFileComponent;
  let fixture: ComponentFixture<AddDataFileComponent>;

  /**
   * Configura el entorno de pruebas antes de cada caso de prueba.
   * Importa el componente standalone y define los mocks necesarios.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddDataFileComponent, // Standalone Component
        HttpClientTestingModule, // Mock HttpClientModule
      ],
      providers: [
        { provide: AddDataFileService, useClass: MockAddDataFileService },
        { provide: MessageService, useClass: MockMessageService },
        { provide: MapService, useClass: MockMapService }, // Mock MapService
      ],
    }).compileComponents();
  });

  /**
   * Crea la instancia del componente y configura los mocks.
   */
  beforeEach(() => {
    fixture = TestBed.createComponent(AddDataFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Verifica si el componente se crea correctamente.
   */
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Verifica que se muestre un mensaje de error si el archivo es demasiado grande (más de 20MB).
   */
  it('debería mostrar un error si el archivo es mayor a 20MB', () => {
    const largeFile = new File([''], 'archivo-grande.txt');
    Object.defineProperty(largeFile, 'size', { value: 30 * 1024 * 1024 }); // 30MB

    const event: FileSelectEvent = { files: [largeFile] } as FileSelectEvent;
    component.onFileChange(event);

    expect(component.errorMessage).toBe(
      'El archivo es demasiado grande. El tamaño máximo permitido es 20MB.'
    );
  });

  /**
   * Verifica que se genere el mensaje de error adecuado cuando se detecta un formato de archivo no compatible.
   */
  it('debería devolver un mensaje adecuado cuando el formato de archivo no es compatible', () => {
    const error = new Error('Formato de archivo no soportado');
    const mensaje = component.getErrorMessage(error);
    expect(mensaje).toBe(
      'El archivo seleccionado no es compatible. Por favor, elige un archivo con formato GPX, GeoJSON, KML, TopoJSON o Shapefile.'
    );
  });

  /**
   * Verifica que se maneje un mensaje de error genérico cuando el error es desconocido.
   */
  it('debería devolver un mensaje genérico si ocurre un error desconocido', () => {
    const error = new Error('Otro error inesperado');
    const mensaje = component.getErrorMessage(error);
    expect(mensaje).toBe('Error al procesar el archivo. Intenta nuevamente.');
  });
});
