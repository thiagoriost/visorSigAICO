import { Injectable } from '@angular/core';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { MapState } from '@app/core/interfaces/store/map.model';
import { MapActions } from '@app/core/store/map/map.actions';
import { LayerDefinitionsService } from '@app/shared/services/layer-definitions-service/layer-definitions.service';
import { Store } from '@ngrx/store';
import { MapService } from '../map-service/map.service';
import { MessageService } from 'primeng/api';
import { LayerContentTableManagerDirective } from '@app/core/directives/layer-content-table-manager.directive';

/**
 * Servicio que se encarga de gestionar las capas que se muestran en la tabla de contenido
 * y de verificar si alguna capa debe ser activada en el mapa al iniciar la aplicacion.
 * @date 2025/10/09
 * @author Andres Fabian Simbaqueba Del Rio
 *
 * @export
 * @class LayersContentTableManagerService
 * @typedef {LayersContentTableManagerService}
 */
@Injectable({
  providedIn: 'root',
})
export class LayersContentTableManagerService extends LayerContentTableManagerDirective {
  /**
   * Creates an instance of LayersContentTableManagerService.
   * @param store
   * @param layerDefinitionService
   */
  constructor(
    private layerDefinitionService: LayerDefinitionsService,
    private messageService: MessageService,
    protected override mapService: MapService,
    protected override store: Store<MapState>
  ) {
    super(mapService, store);
    this.loadLayerOfContentTable();
  }

  /**
   * Consulta las capas disponibles para la tabla de contenido y las carga en el store
   * Adicionalmente verifica si alguna capa debe ser activada en el mapa al iniciar la aplicacion
   */
  loadLayerOfContentTable(
    url?: string,
    detailMessage?: string,
    closableMessage?: boolean,
    sticky?: boolean,
    summary?: string,
    severity?:
      | 'success'
      | 'info'
      | 'warn'
      | 'danger'
      | 'help'
      | 'primary'
      | 'secondary'
      | 'contrast'
      | null
      | undefined,
    icon?: string
  ) {
    return this.layerDefinitionService
      .getAllAvailableLayers(url)
      .then(res => {
        if (res && res.length > 0) {
          const uniqueIdList: CapaMapa[] = this.addLayerWithUniqueID(res, []);
          this.store.dispatch(
            MapActions.setContentTableLayerList({ layerList: uniqueIdList })
          );
          this.checkActivatedLayerOnInit(res);
        }
      })
      .catch(err => {
        console.error('Error loading layers for content table', err);
        this.messageService.clear();
        this.messageService.add({
          closable: closableMessage ?? true,
          detail:
            detailMessage ??
            'Error: No se ha podido consultar la lista de capas',
          sticky: sticky ?? true,
          summary: summary ?? 'Tabla de contenido',
          severity: severity ?? 'error',
          icon: icon ?? 'pi pi-info',
        });
        throw new Error(err);
      });
  }
}
