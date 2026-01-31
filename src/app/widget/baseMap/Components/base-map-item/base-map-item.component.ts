// ==== ANGULAR CORE ====
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// ==== INTERFACES ====
import { CapaMapaBase } from '@app/core/interfaces/CapaMapaBase';

/**
 * Componente que muestra un mapa de la grilla de mapas base disponibles
 * @author Heidy Paola Lopez Sanchez
 */

@Component({
  selector: 'app-base-map-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-map-item.component.html',
  styleUrl: './base-map-item.component.scss',
})
export class BaseMapItemComponent {
  //Item mapa base
  @Input() mapa: CapaMapaBase = {
    thumbnail: '',
    id: '',
    titulo: '',
    leaf: false,
    url: '',
  };
  //Mapa base seleccionado
  @Input() selected: CapaMapaBase | undefined;
  //Icono a mostrar en el mapa base seleccionado
  @Input() icon!: string;
}
