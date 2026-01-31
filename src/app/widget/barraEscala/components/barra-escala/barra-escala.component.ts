// Angular Core
import { Component, Input } from '@angular/core';
// Componentes internos
import { DropdownEscalaComponent } from '../dropdown-escala/dropdown-escala/dropdown-escala.component';
import { EscalaComponent } from '../escala/escala/escala.component';
import { CommonModule } from '@angular/common';

/**
 * Componente que muestra una barra para seleccionar y mostrar la escala
 * gráfica y numérica de un mapa OpenLayers.
 * Permite seleccionar una escala predefinida y ajusta el zoom/resolución
 * del mapa según la selección.
 * Escucha cambios en la resolución del mapa para actualizar la escala mostrada.
 * @author Heidy Paola Lopez Sanchez
 */
@Component({
  selector: 'app-barra-escala',
  standalone: true,
  imports: [EscalaComponent, DropdownEscalaComponent, CommonModule],
  templateUrl: './barra-escala.component.html',
  styleUrls: ['./barra-escala.component.scss'],
})
export class BarraEscalaComponent {
  @Input() scaleType: 'scaleline' | 'scalebar' = 'scaleline';
  /**
   * Input para controlar si se muestra el selector de escalas.
   * Valor por defecto: true.
   */
  @Input() showDropdown = true;

  /**
   * Input para controlar si se muestra la escala.
   * Valor por defecto: true.
   */
  @Input() showEscalas = true;
}
