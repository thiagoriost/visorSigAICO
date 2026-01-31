import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LegendItemSecondVersionComponent } from '../legend-item-second-version/legend-item-second-version.component';
import { Subject, takeUntil } from 'rxjs';
import { MapLegendService } from '@app/core/services/map-legend-service/map-legend.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { MapActions } from '@app/core/store/map/map.actions';

/**
 * Componente que renderiza la lista de leyendas de las capas que están cargadas en el store del area de * trabajo
 * @date 29-07-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-legend-second-version',
  standalone: true,
  imports: [LegendItemSecondVersionComponent, DragDropModule, CommonModule],
  providers: [MapLegendService],
  templateUrl: './legend-second-version.component.html',
  styleUrl: './legend-second-version.component.scss',
})
export class LegendSecondVersionComponent implements OnInit, OnDestroy {
  layerList: (LayerStore & { leyendaUrl?: string })[] = []; //lista de capas
  @Input() isCollapsedLegend = false;

  destroy$ = new Subject<void>(); //manejador de eventos para la suscripcion

  constructor(
    private mapLegendService: MapLegendService,
    private mapStore: Store<MapState>
  ) {}

  /**
   * Consulta las capas cargadas en el store junto con la url de leyenda de cada una
   */
  ngOnInit(): void {
    this.mapLegendService
      .obtenerCapasConLeyendas()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ capas }) => {
        this.layerList = capas;
      });
  }

  /**
   * Metodo que se ejecuta cuando se hace el drag&drop de los items de leyenda
   * @param event
   */
  drop(event: CdkDragDrop<(LayerStore & { leyendaUrl?: string })[]>) {
    moveItemInArray(this.layerList, event.previousIndex, event.currentIndex);
    this.mapStore.dispatch(
      MapActions.updateLayerOrder({ layers: this.layerList })
    );
  }

  /**
   * Elimina la suscripcion al destruir el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
