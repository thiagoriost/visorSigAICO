import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { selectWorkAreaLayerList } from '@app/core/store/map/map.selectors';
import { MapActions } from '@app/core/store/map/map.actions';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';

/**
 * Componente que contiene las dos funcionalidades sobre las capas del store para la tabla de contenido 4
 * @date 2025/10/16
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-actions-top-bar',
  imports: [DividerModule, ButtonModule, TooltipModule, CommonModule],
  templateUrl: './actions-top-bar.component.html',
  styleUrl: './actions-top-bar.component.scss',
})
export class ActionsTopBarComponent implements OnInit, OnDestroy {
  @Input() buttonIconsColor: string | null = null; //color de los iconos de los botones
  @Input() sizeButton: 'small' | 'large' | undefined = 'large'; // indica el tamanio de los botones
  isPrimaryFunction = true; //indica si el boton de activar/desactivar todas las capas esta en la funcion primaria (activar todas las capas)
  disabledEraser = true; //indica si el boton de borrar todas las capas esta deshabilitado
  activatedLayerList: LayerStore[] = []; //lista de capas activadas en el store
  destroy$ = new Subject<void>(); //administrador de suscripciones
  /**
   * constructor del componente
   * @param mapStore store del mapa
   */
  constructor(private mapStore: Store<MapState>) {}
  /**
   * Inicializa el componente y sus variables
   */
  ngOnInit(): void {
    this.mapStore.select(selectWorkAreaLayerList).subscribe(layers => {
      this.disabledEraser = layers.length === 0;
      this.activatedLayerList = layers;
    });
  }

  /**
   * Destruye el componente y sus variables para evitar fugas de memoria
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Permite prender o apagar todas las capas del store
   * @param state
   */
  turnOnOrOffAllLayers(state: boolean) {
    this.isPrimaryFunction = state;
    this.mapStore.dispatch(
      MapActions.turnOnOrOffAllLayers({ stateLayer: state })
    );
  }

  /**
   * Permite borrar todas las capas del store que sean de origen interno
   * (las capas que son de origen externo no se pueden borrar desde la aplicacion)
   */
  deleteAllLayers() {
    if (this.activatedLayerList && this.activatedLayerList.length > 0) {
      for (const layer of this.activatedLayerList) {
        if (
          layer.layerDefinition.origin === 'internal' ||
          layer.layerDefinition.origin === undefined
        ) {
          this.mapStore.dispatch(
            MapActions.deleteLayerOfMap({
              layer: layer.layerDefinition,
            })
          );
        }
      }
      this.activatedLayerList = [];
    }
  }
}
