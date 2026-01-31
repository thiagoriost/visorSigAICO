import { Component } from '@angular/core';
import { DibujarTextoService } from '@app/widget/dibujar/services/dibujarTexto/dibujar-texto.service';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { ColorPickerModule } from 'primeng/colorpicker';
import { Input, Output, EventEmitter } from '@angular/core';

/**
 * Componente para dibujar texto sobre el mapa utilizando el servicio DibujarTextoService.
 * Este componente permite al usuario ingresar texto, elegir su color y tamaño, y dibujarlo en el mapa.
 * También incluye funcionalidades para deshacer, recuperar y eliminar el texto dibujado.
 * Los botones de deshacer/recuperar se habilitan solo cuando hay acciones disponibles.
 * @author Carlos Alberto Aristizabal Vargas
 * @version 1.2.0
 * @since 2025-03-19
 */
@Component({
  selector: 'app-dibujar-texto',
  standalone: true,
  templateUrl: './dibujar-texto.component.html',
  styleUrl: './dibujar-texto.component.scss',
  imports: [
    FormsModule,
    ButtonModule,
    CommonModule,
    InputNumberModule,
    ColorPickerModule,
  ],
})
export class DibujarTextoComponent {
  mostrarCajitaTexto = false;
  colorTexto = '#000000';
  tamanoTexto = 20;

  /**
   * Controla si hay acciones para deshacer disponibles.
   */
  puedeDeshacer = false;

  /**
   * Controla si hay acciones para recuperar disponibles.
   */
  puedeRecuperar = false;

  /**
   * Texto que será previsualizado y dibujado en el mapa.
   * Se vincula mediante binding con el componente padre.
   */
  @Input() texto = '';

  /**
   * Evento que se emite cuando el valor del texto cambia.
   * Permite a componentes padres reaccionar al cambio de texto (two-way binding).
   */
  @Output() textoChange = new EventEmitter<string>();

  /**
   * Constructor del componente DibujarTextoComponent.
   *
   * @param {DibujarTextoService} dibujarTextoService - Servicio utilizado para agregar, deshacer y recuperar interacciones de texto en el mapa.
   */
  constructor(private dibujarTextoService: DibujarTextoService) {}

  /**
   * Método que llama al servicio DibujarTextoService para agregar el texto al mapa.
   * Utiliza los valores de `texto`, `colorTexto` y `tamanoTexto` para personalizar la apariencia del texto.
   */
  dibujarTexto() {
    this.dibujarTextoService.addTextFeature(
      this.texto,
      this.colorTexto,
      this.tamanoTexto
    );
    this.actualizarEstadoBotones();
  }

  /**
   * Llama al servicio DibujarTextoService para deshacer el último texto dibujado en el mapa.
   * El texto se elimina de la vista y se guarda para una posible recuperación.
   */
  deshacerDibujo(): void {
    this.dibujarTextoService.deshacerTexto();
    this.actualizarEstadoBotones();
  }

  /**
   * Llama al servicio DibujarTextoService para recuperar el último texto que fue eliminado.
   * Si hay un texto previamente deshecho, se restaurará a la vista.
   */
  recuperarDibujo(): void {
    this.dibujarTextoService.recuperarTexto();
    this.actualizarEstadoBotones();
  }

  /**
   * Llama al servicio DibujarTextoService para eliminar el texto actual dibujado en el mapa.
   * El texto se elimina permanentemente de la vista y no puede ser recuperado.
   */
  eliminarDibujo(): void {
    this.dibujarTextoService.borrarTexto();
    this.actualizarEstadoBotones();
  }

  /**
   * Maneja los cambios en el campo de texto del componente.
   *
   * Este método se invoca cuando el valor del input de texto cambia.
   * Actualiza la propiedad local `texto` y emite el nuevo valor mediante el
   * evento `textoChange`, permitiendo la sincronización con el componente padre.
   *
   * @param nuevoTexto - El nuevo valor del texto introducido por el usuario.
   */
  onTextoChange(nuevoTexto: string) {
    this.texto = nuevoTexto;
    this.textoChange.emit(this.texto);
  }

  /**
   * Evalúa el estado actual del historial de dibujo y actualiza
   * las banderas que controlan si los botones de deshacer o recuperar
   * deben estar habilitados.
   */
  actualizarEstadoBotones(): void {
    this.puedeDeshacer = this.dibujarTextoService.puedeDeshacer();
    this.puedeRecuperar = this.dibujarTextoService.puedeRecuperar();
  }
}
