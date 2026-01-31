import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

/**
 * Componente que contiene un input de texto personalizable
 * @date 24-09-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-search-layer-input',
  imports: [IconFieldModule, InputIconModule, InputTextModule, FormsModule],
  templateUrl: './search-layer-input.component.html',
  styleUrl: './search-layer-input.component.scss',
})
export class SearchLayerInputComponent {
  @Input() placeHolder = 'Buscar'; //texto de ayuda para el input
  @Input() iconClass = 'pi pi-search'; //clase del icono de buscar
  @Input() iconPosition: 'right' | 'left' = 'right'; //posicion del icono
  @Input() iconInputVisible = true; //indica si el icono de busqueda es visible /oculto
  @Output() textEmitter: EventEmitter<string> = new EventEmitter<string>(); //emite el texto cuando cambia

  text = ''; //almacena el texto ingresado por el usuario

  /**
   * Se ejecuta cuando cambia el texto ingresado por el usuario
   * emite el texto al componente padre
   * Elimina los espacios en blanco antes de enviar el texto
   */
  onInputChange() {
    this.textEmitter.emit(this.text.trim());
  }
}
