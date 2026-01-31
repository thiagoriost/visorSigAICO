import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { LayerAction } from '@app/core/interfaces/enums/LayerAction.enum';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { MapState } from '@app/core/interfaces/store/map.model';
import { EventBusService } from '@app/shared/services/event-bus-service/event-bus.service';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { MapActions } from '@app/core/store/map/map.actions';
import { TooltipModule } from 'primeng/tooltip';
import { SliderModule } from 'primeng/slider';
import { PopoverModule } from 'primeng/popover';

/**
 * Componente que renderiza una capa con las funcionalidades propias para OPIAC
 * @date 18-06-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-work-layer-item',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    TooltipModule,
    ReactiveFormsModule,
    SliderModule,
    PopoverModule,
  ],
  providers: [],
  templateUrl: './work-layer-item.component.html',
  styleUrl: './work-layer-item.component.scss',
})
export class WorkLayerItemComponent implements OnInit {
  @Input({ required: true }) layer: LayerStore | undefined = undefined; //parametro de entrada ---> capa del store: para construir la tarjeta con los botones

  layerActions = LayerAction; //opciones sobre las capas
  formGroup!: FormGroup; //formulario de control
  isLoading = false; //variable para indicar que la información de la capa se está cargando

  /**
   * Metodo constructor
   * @param formBuilder builder de formularios
   */
  constructor(
    private formBuilder: FormBuilder,
    private mapStore: Store<MapState>,
    private eventBusService: EventBusService
  ) {
    this.formGroup = this.formBuilder.group({
      transparency: new FormControl(0),
    });
    this.load();
  }

  /**
   * Metodo que agrega un timeout de 3 segundos mientras se carga la capa al mapa
   */
  load(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 3000);
  }

  /**
   * Metodo que se ejecuta al iniciar el componente
   * Se llama al servicio de capas para agregar la capa al mapa
   */
  ngOnInit(): void {
    this.onChangesOnTransparency();
  }

  /**
   * Metodo para suscribirse a los cambios del input transparency
   * Se llama al servicio de capas para ajustar la transparencia en el mapa
   * Se llama al store para modificar el valor de transparencia de la capa
   */
  onChangesOnTransparency(): void {
    this.formGroup.get('transparency')?.valueChanges.subscribe(value => {
      if (this.layer) {
        this.mapStore.dispatch(
          MapActions.setLayerTransparency({
            layer: this.layer.layerDefinition,
            transparencyLevel: 100 - value,
          })
        );
      }
    });
  }

  /**
   * Eliminar la capa
   */
  onDeleteLayer(): void {
    if (this.layer) {
      this.mapStore.dispatch(
        MapActions.deleteLayerOfMap({
          layer: this.layer.layerDefinition,
        })
      );
      this.eventBusService.emit(this.layer);
    }
  }

  /**
   * Mostrar/ocultar la capa
   */
  onHideOrShowLayer(): void {
    if (this.layer) {
      this.mapStore.dispatch(
        MapActions.showOrHideLayerOfMap({
          layer: this.layer.layerDefinition,
        })
      );
    }
  }

  /**
   * Visualizar metadatos
   */
  onShowMetadata(): void {
    if (this.layer && this.layer.layerDefinition.urlMetadato) {
      window.open(this.layer.layerDefinition.urlMetadato, 'blank');
    }
  }

  /**
   * Metodo que se ejecuta cuando se presiona cualquier boton de las opciones de la capa
   * @param action  tipo de accion (generar transparencia, mostrar/ocultar, visualizar metadatos, eliminar)
   */
  onActionLayer(action: LayerAction): void {
    switch (action) {
      case LayerAction.DELETE:
        this.onDeleteLayer();
        break;
      case LayerAction.HIDE:
        this.onHideOrShowLayer();
        break;
      case LayerAction.SHOW:
        this.onHideOrShowLayer();
        break;
      case LayerAction.METADATA:
        this.onShowMetadata();
        break;
    }
  }
}
