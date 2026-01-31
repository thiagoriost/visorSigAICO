import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
} from '@angular/core';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { MapState } from '@app/core/interfaces/store/map.model';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { selectWorkAreaLayerList } from '@app/core/store/map/map.selectors';
import { LayerItemWithLegendComponent } from '../layer-item-with-legend/layer-item-with-legend.component';
import { MapActions } from '@app/core/store/map/map.actions';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import Sortable from 'sortablejs';
import { CommonModule } from '@angular/common';

/**
 * Componente que renderiza la lista de capas cargadas al store del mapa
 * y permite hacer reordenamiento a traves de Drag&Drop
 * @date 03-09-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-work-area-v3',
  imports: [
    LayerItemWithLegendComponent,
    ButtonModule,
    TooltipModule,
    CommonModule,
  ],
  templateUrl: './work-area-v3.component.html',
  styleUrl: './work-area-v3.component.scss',
})
export class WorkAreaV3Component implements OnInit, OnDestroy, AfterViewInit {
  @Input() isLegendVisible = false; //parametro que indica si la leyenda es visible o colapsada
  @Input() ocultLayerIcon = 'pi pi-eye-slash'; // icono para ocultar la capa
  @Input() showLayerIcon = 'pi pi-eye'; // icono para mostrar la capa
  @Input() setTransparencyIcon = 'pi pi-sliders-h'; // icono para generar trasnparencia de la capa
  @Input() showMetadataIcon = 'pi pi-file-o'; // icono para mostrar metadatos de la capa
  @Input() showLegendIcon = 'pi pi-palette'; // icono para mostrar la leyenda la capa
  @Input() deleteLayerIcon = 'pi pi-times'; // icono para eliminar la capa
  @Input() textColor: string | null = null; //color para el texto del titulo de la capa
  @Input() isTextButton = true; //indica si el boton es tipo texto o lleva fondo
  @Input() isRoundedButton = false; //indica si el boton es redondeado
  @Input() isCenteredButtons = false; //indica si los botones superiores deben ir centrados
  @Input() turnOnAllLayersIcon = 'pi pi-eye'; //indica el icono para el boton de prender todas las capas
  @Input() turnOffAllLayersIcon = 'pi pi-eye-slash'; //indica el icono para el boton de apagar todas las capas

  layerStoreList: LayerStore[] = []; //lista de capas
  isEmptyWorkAreaLayerList = true; //indica si la lista de capas en el area de trabajo esta vacia
  @ViewChild('sortableLayers') sortableLayers!: ElementRef<HTMLDivElement>; //apuntador al elemento en el template
  private destroy$ = new Subject<void>(); //manejador de suscripciones

  /**
   * @param mapStore store del mapa
   */
  constructor(private mapStore: Store<MapState>) {}

  /**
   * Despues de iniciar la vista del componente
   * se crea el sortable para la lista de capas en el area de trabajo
   */
  ngAfterViewInit(): void {
    if (!this.sortableLayers) return;
    Sortable.create(this.sortableLayers.nativeElement, {
      animation: 150,
      handle: '.drag-handle',
      onEnd: event => {
        const moved = this.layerStoreList.splice(event.oldIndex!, 1)[0];
        this.layerStoreList.splice(event.newIndex!, 0, moved);
        this.mapStore.dispatch(
          MapActions.updateLayerOrder({ layers: this.layerStoreList })
        );
      },
    });
  }

  /**
   * Metodo que se ejecuta al inciar el componente
   * se suscribe a los cambios del selector del mapa y asigna la lista de capas
   */
  ngOnInit(): void {
    this.mapStore
      .select(selectWorkAreaLayerList)
      .pipe(takeUntil(this.destroy$))
      .subscribe(layers => {
        this.layerStoreList = layers;
        if (layers.length === 0) {
          this.isEmptyWorkAreaLayerList = true;
        } else {
          this.isEmptyWorkAreaLayerList = false;
        }
      });
  }

  /**
   * Apagar/prender todas las capas
   * @param state true para prender, false para apagar
   */
  turnOnOrOffAllLayers(state: boolean) {
    this.mapStore.dispatch(
      MapActions.turnOnOrOffAllLayers({ stateLayer: state })
    );
  }

  /**
   * Se cancelan las suscripciones para evitar uso de recursos innecesarios
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
