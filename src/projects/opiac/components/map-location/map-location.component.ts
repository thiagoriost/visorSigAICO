import { Component } from '@angular/core';
// ===== COMPONENTS ======
import { MiniMapComponent } from '@app/widget/miniMap/components/mini-map/mini-map.component';

/**
 * @description Componente que ubica mapa de localización en la parte inferior derecha
 * @author Juan Carlos Valderrama Gonzalez
 */
@Component({
  selector: 'app-map-location',
  standalone: true,
  imports: [MiniMapComponent],
  templateUrl: './map-location.component.html',
  styleUrl: './map-location.component.scss',
})
export class MapLocationComponent {}
