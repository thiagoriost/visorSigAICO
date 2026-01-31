import { Component } from '@angular/core';
import { MiniMapV2Component } from '@app/widget/miniMap_v2/components/mini-map-v2/mini-map-v2.component';

/**
 * Componente que muestra un mapa de localización para la Línea Negra.
 *@author Andres Fabian Simbaqueba
 * @date 2024-10-06
 */
@Component({
  selector: 'app-mapa-localizacion-linea-negra',
  imports: [MiniMapV2Component],
  templateUrl: './mapa-localizacion-linea-negra.component.html',
  styleUrl: './mapa-localizacion-linea-negra.component.scss',
})
export class MapaLocalizacionLineaNegraComponent {}
