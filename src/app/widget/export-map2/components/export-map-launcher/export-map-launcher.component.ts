import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ExportMap2Component } from '../export-map2/export-map2.component';

/**
 * Componente lanzador del módulo de exportación de mapa.
 * Este componente actúa como un botón o disparador visual para abrir el diálogo principal de exportación,
 * donde el usuario podrá configurar y generar la salida del mapa en formato PDF o imagen.
 *
 * El componente es independiente (`standalone`) y utiliza `ExportMap2Component` como el diálogo emergente
 * que se activa cuando el usuario solicita la exportación.
 *
 * @author Sergio Alonso Mariño
 * @date 07-07-2025
 * @version 1.0.0
 */

@Component({
  selector: 'app-export-map-launcher',
  standalone: true,
  imports: [CommonModule, ButtonModule, ExportMap2Component],
  templateUrl: './export-map-launcher.component.html',
  styleUrls: ['./export-map-launcher.component.scss'],
})
export class ExportMapLauncherComponent {
  isDialogVisible = false;

  showExportDialog(): void {
    this.isDialogVisible = true;
  }
}
