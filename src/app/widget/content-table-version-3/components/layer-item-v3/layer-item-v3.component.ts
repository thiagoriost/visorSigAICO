import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { MapLegendService } from '@app/core/services/map-legend-service/map-legend.service';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { CommonModule } from '@angular/common';
import { slideDownSlow } from '@app/widget/content-table-version-3/animations/animations';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerItemBaseDirective } from '@app/shared/directives/layer-item-base/layer-item-base.directive';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';
import { FormsModule } from '@angular/forms';

/**
 * Componente que renderiza la capa con las opciones disponibles hereda de LayerItemBase las funcionalidades principales
 * @date 29-07-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-layer-item-v3',
  imports: [
    ButtonModule,
    TooltipModule,
    SliderModule,
    ToggleSwitch,
    CommonModule,
    FormsModule,
  ],
  providers: [MapLegendService, LayerOptionService],
  templateUrl: './layer-item-v3.component.html',
  styleUrl: './layer-item-v3.component.scss',
  animations: [slideDownSlow],
})
export class LayerItemV3Component
  extends LayerItemBaseDirective
  implements OnInit, OnChanges
{
  @Input({ required: true }) layer: CapaMapa | undefined = undefined; //Capamapa de entrada
  @Input() iconsColor: string | null = 'text-red-500'; // color para los iconos de la capa
  @Input() titleColor: string | null = null; // color para el titulo de la capa
  @Input() severityButtonList:
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'help'
    | 'primary'
    | 'secondary'
    | 'contrast'
    | null
    | undefined = 'danger'; //indica la severidad del boton
  @Input() showMetadataIcon = 'pi pi-code'; //icono para mostrar metadatos
  @Input() turnOffLayerIcon = 'pi pi-eye-slash'; //icono patra ocultar la capa
  @Input() turnOnLayerIcon = 'pi pi-eye'; //icono para mostrar la capa
  @Input() moreOptionsIcon = 'pi pi-ellipsis-v'; //icono para las opciones de la capa
  isVisibleButtonList = false; //variable para indicar si es visible la botonera de opciones
  isVisibleLayer = false; //indica si la capa es visible para el mapa
  sliderValue!: number; //variable para ngModel del slider de transparencia
  toggleSwitchValue!: boolean; //variable para ngModel del toggleSwitch de la capa
  lastActivatedValue = false; //variable para almacenar el valor de activacion del boton de mas opciones de la capa

  /**
   * Crea una instancia del componente
   * @param layerOptionsService  servicio para las opciones sobre la capa
   */
  constructor(protected override layerOptionsService: LayerOptionService) {
    super(layerOptionsService);
  }

  /**
   * Se ajusta el valor de activacion del toggle switch y el valor de la transparencia
   */
  ngOnInit(): void {
    if (this.layer) {
      this.toggleSwitchValue =
        this.layer.isActivated ?? this.layer.checked ?? false;
      this.sliderValue = this.layer.transparencyValue ?? 0;
      this.isVisibleLayer = this.toggleSwitchValue;
      this.lastActivatedValue = false;
    }
  }

  /**
   * Metodo que se suscribe a los camnbios en la capa para desactivar el toggle switch cuando se desseleccionan todas las capas
   * @param changes cambios en la capa
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['layer'] && this.layer) {
      this.toggleSwitchValue =
        this.layer.isActivated ?? this.layer.checked ?? false;
      this.sliderValue = this.layer.transparencyValue ?? 0;
      if (this.lastActivatedValue && this.layer.isActivated) {
        this.isVisibleButtonList = true;
      } else {
        this.isVisibleButtonList = false;
        this.lastActivatedValue = false;
      }
    }
  }

  /**
   * Muestra/Oculta la barra de opciones de la capa (metadatos y mostrar/ocultar capa en el mapa)
   */
  onshowOrOcultMoreOptions(): void {
    this.isVisibleButtonList = !this.isVisibleButtonList;
    this.lastActivatedValue = !this.lastActivatedValue;
  }

  /**
   * Alterna la visibilidad de la capa en el mapa
   */
  toggleLayer(): void {
    if (this.layer) {
      if (this.isVisibleLayer) {
        this.onTurnOffLayer(this.layer);
        this.isVisibleLayer = false;
      } else {
        this.onTurnOnLayer(this.layer);
        this.isVisibleLayer = true;
      }
    }
  }

  /**
   * Alterna la activacion/eliminacion de la capa en el mapa
   * @param event evento del ToggleSwitch
   */

  addOrDeleteLayer(event: boolean): void {
    if (!this.layer) return;
    this.onChangeActivatedValue(this.layer, event);
    if (event) {
      this.isVisibleLayer = true;
    } else {
      this.sliderValue = 0;
      this.isVisibleLayer = false;
      this.isVisibleButtonList = false;
    }
  }
}
