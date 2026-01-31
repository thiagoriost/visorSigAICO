import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BackgroundStyleComponent } from '@app/shared/utils/background-style/backgroundStyle';
import { Button } from 'primeng/button';

/**
 * Componente que renderiza una ventana flotante responsiva con opciones de minimizar y cerrar.
 * @date 2025/10/08
 * @author Andres Fabian Simbaqueba Del Rio
 * @extends {BackgroundStyleComponent} Hereda estilos de fondo desde BackgroundStyleComponent.
 */
@Component({
  selector: 'app-linea-negra-responsive-floating-window',
  imports: [CommonModule, Button],
  templateUrl: './responsive-floating-window.component.html',
  styleUrl: './responsive-floating-window.component.scss',
})
export class ResponsiveFloatingWindowComponent extends BackgroundStyleComponent {
  @Input() title = 'Sin titulo'; //titulo de la ventana
  @Input() minimized = false; //indica si la ventana está minimizada

  @Output() closeEmitter = new EventEmitter<void>(); //evento que se emite al cerrar la ventana
  @Output() minimizeEmitter = new EventEmitter<boolean>(); //evento que se emite al minimizar o restaurar la ventana

  /**
   * Alterna el estado de minimización de la ventana y emite el evento correspondiente.
   */
  toggleMinimize() {
    this.minimized = !this.minimized;
    this.minimizeEmitter.emit(this.minimized);
  }

  /**
   * Emite el evento de cierre de la ventana.
   */
  onClose() {
    this.closeEmitter.emit();
  }
}
