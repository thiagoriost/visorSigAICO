import { Component } from '@angular/core';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { BaseMapComponent } from '@app/widget/baseMap/Components/base-map/base-map.component';

/**
 * Componente envoltura para el widget de mapa base
 * @date 2025-11-25
 * @author Andres Fabian Simbaqueba
 */
@Component({
  selector: 'app-mapa-base-linea-negra',
  imports: [BaseMapComponent],
  templateUrl: './mapa-base-linea-negra.component.html',
  styleUrl: './mapa-base-linea-negra.component.scss',
})
export class MapaBaseLineaNegraComponent {
  listaMapasBase: MapasBase[] = [
    MapasBase.ESRI_STANDARD,
    MapasBase.POSITRON,
    MapasBase.ESRI_OCEAN,
    MapasBase.OSM_STANDARD,
    MapasBase.GOOGLE_SATELLITE,
  ]; //lista de mapas base para el visor de linea negra
}
