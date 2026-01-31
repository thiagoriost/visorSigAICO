import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { ButtonModule } from 'primeng/button';

/**
 * Componente encargado de emitir eventos para ejecutar una consulta o limpiar el formulario.
 * Es utilizado tanto en la consulta simple como en la consulta avanzada.
 * Contiene dos botones: uno para ejecutar la consulta y otro para limpiar los campos del formulario.
 *
 * @author Heidy Paola Lopez Sanchez
 */

@Component({
  selector: 'app-botones-consulta',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './botones-consulta.component.html',
  styleUrl: './botones-consulta.component.scss',
})
export class BotonesConsultaComponent {
  /**
   * Atributo utilizado para mostrar un indicador de carga en el botón "Consultar".
   * Se puede controlar desde el componente padre para deshabilitar el botón mientras se realiza la consulta.
   */
  loading = false;

  /**
   * Evento que se emite cuando el usuario hace clic en el botón "Consultar".
   */
  @Output() ejecutarConsulta = new EventEmitter<boolean>();

  /**
   * Evento que se emite cuando el usuario hace clic en el botón "Limpiar".
   */
  @Output() limpiarCampos = new EventEmitter<void>();

  /**
   * Método que se ejecuta al hacer clic en el botón "Consultar".
   */
  consultar(): void {
    this.ejecutarConsulta.emit(true);
  }

  /**
   * Método que se ejecuta al hacer clic en el botón "Limpiar".
   */
  limpiar(): void {
    this.limpiarCampos.emit();
  }
}
