import { Component, Input } from '@angular/core';

/**
 * Componente que contiene un overlay para mostrar contenido como mensajes, avisos, entre otos
 * @date 06-06-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-overlay',
  standalone: true,
  imports: [],
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.scss',
})
export class OverlayComponent {
  @Input() isContained = false; //variable para determinar si es sobre la pantalla completa o sobre un componente en especifico

  /**
   * Metodo para determinar la posicion del componente
   * de acuerdo a la variable isContained
   * @returns texto con la clase
   */
  getPosition() {
    return this.isContained ? 'absolute' : 'fixed';
  }
}
