import { Component, OnInit } from '@angular/core';

// ===== SERVICES =====
import { MapService } from '@app/core/services/map-service/map.service';

// ===== STORE =====
import { Store } from '@ngrx/store';
import { selectMapParameters } from '@app/core/store/map/map.selectors';

import BaseLayer from 'ol/layer/Base';
import { OSM } from 'ol/source';
import TileLayer from 'ol/layer/Tile';

import { environment } from 'environments/environment';
import {
  MapasBase,
  stringToMapasBase,
} from '@app/core/interfaces/enums/MapasBase.enum';
/**
 * Componente que construye el objeto mapa y lo ubica dentro del layout
 * usa valores de store para parametrizar el mapa
 *
 * @author Juan Carlos Valderrama González
 */

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  providers: [],
})
export class MapComponent implements OnInit {
  layer: BaseLayer[] = [
    new TileLayer({
      source: new OSM(),
    }),
  ];
  mapParameters$; // Observable que contiene los parametros del mapa

  constructor(
    private mapService: MapService,
    private store: Store
  ) {
    this.mapParameters$ = this.store.select(selectMapParameters);
  }

  ngOnInit() {
    // Definir layer base
    let layerBase: MapasBase = MapasBase.OSM;
    if (environment.map.baseLayer !== undefined) {
      const nombreLayerBaseTmp = stringToMapasBase(environment.map.baseLayer);
      if (nombreLayerBaseTmp) {
        layerBase = nombreLayerBaseTmp;
      }
    }
    // Se crea el mapa con las coordenadas iniciales y el zoom
    this.mapService.createMap(
      environment.map.center,
      environment.map.zoom,
      environment.map.projection,
      'map',
      layerBase
    );
  }
}
