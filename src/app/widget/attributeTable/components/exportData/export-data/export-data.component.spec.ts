import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportDataComponent } from './export-data.component';
import { ExportDataService } from '@app/widget/attributeTable/services/exportData/export-data.service';

describe('ExportDataComponent', () => {
  let component: ExportDataComponent;
  let fixture: ComponentFixture<ExportDataComponent>;
  let exportService: ExportDataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportDataComponent], // standalone component se importa aquí
      providers: [ExportDataService],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportDataComponent);
    component = fixture.componentInstance;
    exportService = TestBed.inject(ExportDataService);
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe llamar a exportToShapefile cuando formatoSeleccionado es "Excel"', () => {
    const excelSpy = spyOn(exportService, 'exportToExcelFile');
    component.formatoSeleccionado = 'Excel';
    component.data = [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: { nombre: 'Test' },
      },
    ];
    component.titulo = 'geometrias';

    component.exportar();

    expect(excelSpy).toHaveBeenCalledWith(component.data, component.titulo);
  });

  it('debe llamar a exportToShapefile cuando formatoSeleccionado es "Shape"', async () => {
    const shapeSpy = spyOn(exportService, 'exportToShapefile').and.returnValue(
      Promise.resolve()
    );
    component.formatoSeleccionado = 'Shape';
    component.data = [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: { nombre: 'Test' },
      },
    ];
    component.titulo = 'geometrias';

    await component.exportar();

    expect(shapeSpy).toHaveBeenCalledWith(component.data, component.titulo);
  });

  it('No se debe llamar a ningún método de exportación si el formatoSeleccionado está vacío', () => {
    const excelSpy = spyOn(exportService, 'exportToExcelFile');
    const shapeSpy = spyOn(exportService, 'exportToShapefile');

    component.formatoSeleccionado = '';

    component.exportar();

    expect(excelSpy).not.toHaveBeenCalled();
    expect(shapeSpy).not.toHaveBeenCalled();
  });

  it('Debería advertir si se desconoce el formato Seleccionado', () => {
    const consoleWarnSpy = spyOn(console, 'warn');
    component.formatoSeleccionado = 'PDF'; // Valor inválido

    component.exportar();

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Formato no reconocido:',
      'PDF'
    );
  });
});
