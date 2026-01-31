import { Component, Input } from '@angular/core';
import { MiniMapV2Component } from '@app/widget/miniMap_v2/components/mini-map-v2/mini-map-v2.component';

/**
 * @description Componente que renderiza el mapa para gobierno mayor
 * @author Sergio Alonso Mariño Duque
 */
@Component({
  selector: 'app-map-location',
  standalone: true,
  imports: [MiniMapV2Component],
  templateUrl: './map-location.component.html',
  styleUrl: './map-location.component.scss',
})
export class MapLocationComponent {
  /**
   * Flag responsive.
   * - false => desktop/tablet
   * - true  => móvil (XS/SM)
   */
  @Input() isSmallScreen = false;
}
