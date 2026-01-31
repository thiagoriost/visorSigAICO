import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ViewCoordsComponent } from '../view-coords/view-coords.component';
import { CRSCode } from '../../interface/crs-code';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

/**
 * LauncherViewCoordsComponent
 *
 * Componente lanzador que permite al usuario seleccionar
 * una proyección y enviar dicha selección al componente
 * <app-view-coords>.
 *
 * Este componente NO realiza conversiones; únicamente
 * gestiona selección, visualización y parámetros para
 * el componente hijo.
 * @author Heidy Paola Lopez Sanchez
 */
@Component({
  selector: 'app-launcher-view-coords',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ViewCoordsComponent,
    SelectModule,
    CardModule,
    ButtonModule,
  ],
  templateUrl: './launcher-view-coords.component.html',
  styleUrl: './launcher-view-coords.component.scss',
})
export class LauncherViewCoordsComponent {
  /**
   * Lista de opciones de proyecciones disponibles.
   * Cada elemento contiene:
   *  - label: texto visible en el UI
   *  - value: código EPSG o identificador interno
   */
  opcionesProyecciones: { label: string; value: string }[] = [
    { label: 'MAGNA Bogotá (EPSG:3116)', value: CRSCode.MAGNA_BOGOTA },
    { label: 'MAGNA Occidente (EPSG:9377)', value: CRSCode.MAGNA_OCCIDENTE },
    { label: 'MAGNA-SIRGAS (EPSG:4686)', value: CRSCode.MAGNA },
    { label: 'WGS84 (EPSG:4326)', value: CRSCode.WGS84 },
  ];
  /**
   * Proyección seleccionada por el usuario.
   * Se establece mediante la UI (<p-dropdown> o <p-selectButton>).
   */
  seleccionada: CRSCode | null = null;
}
