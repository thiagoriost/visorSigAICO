import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { WorkLayerItemComponent } from '../work-layer-item/work-layer-item.component';
import { TooltipModule } from 'primeng/tooltip';
import { DragDropModule } from 'primeng/dragdrop';
import { DividerModule } from 'primeng/divider';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import * as mapsSelectors from '@app/core/store/map/map.selectors';
import { MapActions } from '@app/core/store/map/map.actions';

/**
 * Componente que renderiza la lista de capas y muestra dos botones para apagar/prender todas las capas cargadas en el area de trabajo
 */
@Component({
  selector: 'app-work-area-v2',
  standalone: true,
  imports: [
    ButtonModule,
    ScrollPanelModule,
    WorkLayerItemComponent,
    TooltipModule,
    DragDropModule,
    DividerModule,
  ],
  templateUrl: './work-area-v2.component.html',
  styleUrl: './work-area-v2.component.scss',
})
export class WorkAreaV2Component implements OnDestroy, OnInit {
  layerList: LayerStore[] = []; //lista de capas del store
  draggedLayer: LayerStore | undefined | null;
  private destroy$ = new Subject<void>();
  /**
   * @param mapStore store del mapa
   */
  constructor(private mapStore: Store<MapState>) {}
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

  /**
   * Metodo para prender todas las capas del área de trabajo
   */
  onTurnOnLayers() {
    this.mapStore.dispatch(
      MapActions.turnOnOrOffAllLayers({ stateLayer: true })
    );
  }

  /**
   * Metodo para apagar todas las capas del área de trabajo
   */
  onTurnOffLayers() {
    this.mapStore.dispatch(
      MapActions.turnOnOrOffAllLayers({ stateLayer: false })
    );
  }
}
