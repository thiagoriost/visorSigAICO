import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * Estructura generica que contiene el layout principal para un visor con una distribución
 * de cinco componentes sobre un componente principal
 * LAYOUT X
 * @date 21-09-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-layout-x',
  imports: [NgClass],
  templateUrl: './layout-x.component.html',
  styleUrl: './layout-x.component.scss',
})
export class LayoutXComponent {
  @Input() isMobile = false; //indica si la resolucion de la pantalla es de un dispositivo movil
}
