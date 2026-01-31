import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { LayerComponent } from '../layer/layer.component';

import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import * as mapsSelectors from '@app/core/store/map/map.selectors';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { MapActions } from '@app/core/store/map/map.actions';
import { DragDropModule } from 'primeng/dragdrop';
import { Subject, takeUntil } from 'rxjs';
import { EventBusService } from '@app/shared/services/event-bus-service/event-bus.service';
/**
 * @description Componente que contiene el área de trabajo con la lista de capas
 * @author Andres Fabian Simbaqueba del Rio <<anfasideri@hotmail.com>>
 * @date 02/12/2024
 * @class WorkAreaLayersComponent
 */
@Component({
  selector: 'app-work-area-layers',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    TooltipModule,
    ScrollPanelModule,
    LayerComponent,
    DragDropModule,
  ],
  templateUrl: './work-area-layers.component.html',
  styleUrl: './work-area-layers.component.scss',
})
export class WorkAreaLayersComponent implements OnInit, OnDestroy {
  @Input() titleheader = 'ÁREA DE TRABAJO';
  @Input() emptyListMessage =
    'Seleccione una capa para agregarla al área de trabajo';
  layerList: LayerStore[] = []; //lista de capas del store
  draggedLayer: LayerStore | undefined | null;
  private destroy$ = new Subject<void>();
  eventBusService: EventBusService | undefined = undefined; //manejador de eventos cuando se eliminan las capas

  /**
   * @param mapStore store del mapa
   */
  constructor(
    private mapStore: Store<MapState>,
    private eventBusEmitter: EventBusService
  ) {
    this.eventBusService = this.eventBusEmitter;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Metodo que se ejecuta al inciar el componente
   * se suscribe a los cambios del selector del mapa y asigna la lista de capas
   */
  ngOnInit(): void {
    this.mapStore
      .select(mapsSelectors.selectWorkAreaLayerList)
      .pipe(takeUntil(this.destroy$))
      .subscribe(layers => {
        if (layers) {
          this.layerList = layers;
        }
      });
  }

  /**
   * Metodo qus se ejecuta cuando se inicia el arrastre de un elemento
   * @param layer capa a ser arrastrada
   */
  dragStart(layer: LayerStore) {
    this.draggedLayer = layer;
  }

  /**
   * Metodo que ocurre cuando se suelta el elemento arrastrado
   */
  dragEnd() {
    this.draggedLayer = null;
  }

  /**
   * Metodo que se ejecuta cuando se suelta el elemento arrastrado
   * @param index posicion del elemento en la lista
   */
  onDrop(index: number) {
    //se consulta el indice de la capa arrastrada
    const draggedIndex = this.layerList.indexOf(this.draggedLayer!);
    // Si el elemento arrastrado no está en la misma posición, lo movemos
    if (draggedIndex !== index) {
      // Se mueve la capa arrastrada al nuevo índice
      const tempList = [...this.layerList];
      // Elimina la capa de la posición original
      tempList.splice(draggedIndex, 1);
      // Inserta la capa en la nueva posición
      tempList.splice(index, 0, this.draggedLayer!);
      // Actualiza el estado de las capas en el store
      this.mapStore.dispatch(MapActions.updateLayerOrder({ layers: tempList }));
    }
  }

  onTurnOnLayers() {
    this.mapStore.dispatch(
      MapActions.turnOnOrOffAllLayers({ stateLayer: true })
    );
  }

  onTurnOffLayers() {
    this.mapStore.dispatch(
      MapActions.turnOnOrOffAllLayers({ stateLayer: false })
    );
  }
}
