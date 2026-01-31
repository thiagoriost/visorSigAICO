import { Component, Input } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { GeoJSONGeometrias } from '@app/widget/attributeTable/interfaces/geojsonInterface';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ExportDataService } from '@app/widget/attributeTable/services/exportData/export-data.service';

/**
 * Componente que gestiona la exportación de datos espaciales (GeoJSON)
 * a distintos formatos como Excel o Shapefile.
 *
 * Permite seleccionar el formato y ejecutar la exportación
 * utilizando un servicio especializado.
 *
 * @author Heidy Paola Lopez Sanchez
 */

@Component({
  selector: 'app-export-data',
  standalone: true,
  imports: [
    FormsModule,
    CheckboxModule,
    CommonModule,
    ButtonModule,
    ReactiveFormsModule,
    RadioButtonModule,
  ],
  templateUrl: './export-data.component.html',
  styleUrl: './export-data.component.scss',
})
export class ExportDataComponent {
  /**
   * Variable que almacena losa datos manejados en el componente y recibidos del padre.
   */
  formatoSeleccionado = '';
  @Input() data: GeoJSONGeometrias[] = [];
  @Input() titulo = '';

  constructor(private exportService: ExportDataService) {}

  /**
   * Método que ejecuta la exportación de los datos en el formato previamente seleccionado.
   */
  exportar(): void {
    // Validar que exista un formato seleccionado antes de proceder.
    if (!this.formatoSeleccionado) {
      console.warn('Debes seleccionar un formato antes de exportar.');
      return;
    }

    // Ejecución de la exportación según el formato seleccionado.
    switch (this.formatoSeleccionado) {
      case 'Excel':
        this.exportService.exportToExcelFile(this.data, this.titulo);
        break;

      case 'Shape':
        this.exportService.exportToShapefile(this.data, this.titulo);
        break;

      // Caso por defecto si se introduce un valor no reconocido.
      default:
        console.warn('Formato no reconocido:', this.formatoSeleccionado);
    }
  }
}
