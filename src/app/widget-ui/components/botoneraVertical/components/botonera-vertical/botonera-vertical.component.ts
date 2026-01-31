import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  BotonConfigModel,
  OpcionMenuModel,
} from '../../interfaces/boton-config.model';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { BackgroundStyleComponent } from '@app/shared/utils/background-style/backgroundStyle';

/**
 * Componente encargado del funcionamiento de la botonera vertical general
 * @date 12-06-2025
 * @author Sergio Alonso Mariño Duque
 */
@Component({
  selector: 'app-botonera-vertical',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    PopoverModule,
    TooltipModule,
    RippleModule,
  ],
  templateUrl: './botonera-vertical.component.html',
  styleUrls: ['./botonera-vertical.component.scss'],
})
export class BotoneraVerticalComponent extends BackgroundStyleComponent {
  /**
   * Lista de botones a renderizar.
   * Cada botón incluye su ícono, texto y opciones desplegables.
   */
  @Input() botones: BotonConfigModel[] = [];

  /**
   * NUEVO: Selector de forma para los botones del rail.
   *  - 'rounded' (DEFAULT): botones circulares (usa [rounded]="true" en p-button)
   *  - 'square'           : botones cuadrados (usa [rounded]="false" y respeta
   *                         el radio configurado por preset o la var CSS
   *                         --p-button-border-radius)
   *
   * Si no se especifica, queda 'rounded' por defecto.
   */
  @Input() shape: 'rounded' | 'square' = 'rounded';

  /**
   * Tamaño de los botones de la botonera.
   * Valores permitidos:
   *  - 'small'   : Botones pequeños
   *  - 'large'   : Botones grandes
   *  - 'default' : Tamaño por defecto (null en PrimeNG)
   *
   * Este valor se pasa directamente al atributo [size] de p-button de PrimeNG.
   * Si no se especifica, se usa 'default'.
   */
  @Input() size: 'small' | 'large' | 'default' = 'default';

  /**
   * Flag calculado para compatibilidad directa con p-button.
   * Cuando shape === 'rounded', devolvemos true; en caso contrario false.
   * Esto nos permite bindear [rounded]="isRounded" en la plantilla.
   */
  get isRounded(): boolean {
    return this.shape === 'rounded';
  }

  /**
   * Tamaño calculado para compatibilidad con PrimeNG p-button.
   * Convierte 'default' a undefined (valor esperado por PrimeNG para tamaño por defecto).
   * Para 'small' y 'large', devuelve el valor tal cual.
   * @returns El tamaño del botón compatible con PrimeNG: "small" | "large" | undefined
   */
  get buttonSize(): 'small' | 'large' | undefined {
    return this.size === 'default' ? undefined : this.size;
  }

  /**
   * Emite { botonId, opcionId } cuando el usuario
   * selecciona una opción de cualquiera de los menús.
   */
  @Output() seleccion = new EventEmitter<{
    botonId: string;
    opcionId: string;
  }>();

  /**
   * Maneja el click en una opción de menú.
   * @param botonId id del botón padre
   * @param opcion objeto de la opción clickeada
   */
  onSeleccion(botonId: string, opcion: OpcionMenuModel) {
    this.seleccion.emit({ botonId, opcionId: opcion.id });
  }
}
