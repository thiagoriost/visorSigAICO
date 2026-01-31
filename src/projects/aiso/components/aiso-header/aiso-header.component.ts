import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Image } from 'primeng/image';

/**
 * @description Cabecera principal de la aplicación AISO.
 * Contiene el logo de AISO
 * que se renderizan en la parte superior de la interfaz.
 * @date 19-09-2025
 * @author Heidy Paola Lopez Sanchez
 */
@Component({
  selector: 'app-aiso-header',
  standalone: true,
  imports: [Image, CommonModule],
  templateUrl: './aiso-header.component.html',
  styleUrl: './aiso-header.component.css',
})
export class AisoHeaderComponent {
  @Input() isSmallScreen = false; //variable para determinar si la resolucion de pantalla es de tipo movil
}
