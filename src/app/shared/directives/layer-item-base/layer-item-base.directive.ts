import { Directive, Input } from '@angular/core';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';
import { EventBusService } from '@app/shared/services/event-bus-service/event-bus.service';

@Directive()

/**
 * Clase abstracta que implementa las funcionalidades principales de una capa para
 * los diferrentes visores georgraficos
 * @date 15-09-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
export abstract class LayerItemBaseDirective {
  @Input() eventEmitter: EventBusService | undefined = undefined; //emisor de eventos cuando se elimina una capa

  /**
   * Inyecta el servicio
   * @param layerOptionsService servicio que interactua con el store del mapa
   */
  constructor(protected layerOptionsService: LayerOptionService) {}

  /**
   * Activar capa en el mapa
   * @param layer definicion de la capa
   */
  onAddLayer(layer: CapaMapa) {
    this.layerOptionsService.addLayer(layer);
  }

  /**
   * Eliminar capa del mapa
   * @param layer definicion de la capa
   */
  onDeleteLayer(layer: CapaMapa) {
    this.layerOptionsService.deleteLayer(layer);
    if (this.eventEmitter !== undefined) {
      this.eventEmitter.emit({
        isVisible: true,
        layerDefinition: layer,
        layerLevel: LayerLevel.INTERMEDIATE,
        orderInMap: 0,
        transparencyLevel: 0,
      });
    }
  }

  /**
   * Prender capa
   * @param layer definicion de la capa
   */
  onTurnOnLayer(layer: CapaMapa) {
    this.layerOptionsService.turnOnLayer(layer);
  }

  /**
   * Apagar capa
   * @param layer definicion de la capa
   */
  onTurnOffLayer(layer: CapaMapa) {
    this.layerOptionsService.turnOffLayer(layer);
  }

  /**
   * Ajustar transparencia
   * @param layer definicion de la capa
   * @param transparencyLevel nivel de transparencia
   */
  onSetTransparencyOfLayer(layer: CapaMapa, transparencyLevel: number) {
    this.layerOptionsService.setTransparencyOfLayer(layer, transparencyLevel);
  }

  /**
   * Mostrar metadatos
   * @param layer definicion de la capa
   */
  onShowMetadata(layer: CapaMapa) {
    this.layerOptionsService.showMetadata(layer);
  }

  /**
   * Metodo que se ejecuta cuando cambia el valor del slider de transparencia
   * @param value valor del slider
   * @param layer definicion de la capa
   */
  onChangeSliderValue(layer: CapaMapa, value: number) {
    this.onSetTransparencyOfLayer(layer, 100 - value);
  }

  /**
   * Metodo que se ejecuta cuando cambia el valor del toggle switch de activacion de la capa
   * @param layer definicion de la capa
   * @param event evento del toggle switch
   */
  onChangeActivatedValue(layer: CapaMapa, checked: boolean) {
    if (checked) {
      this.onAddLayer(layer);
    } else {
      this.onDeleteLayer(layer);
    }
  }
}
