import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { CommonModule } from '@angular/common';
import { LayerItemBaseDirective } from '@app/shared/directives/layer-item-base/layer-item-base.directive';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';

/**
 * Componete que contiene el item de la capa con el toggle switch, el nombre y el boton de opciones
 * @date 13-08-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-layer-item-v4',
  standalone: true,
  imports: [
    ToggleSwitchModule,
    SliderModule,
    ButtonModule,
    PopoverModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './layer-item-v4.component.html',
  styleUrl: './layer-item-v4.component.scss',
})
export class LayerItemV4Component
  extends LayerItemBaseDirective
  implements OnInit, OnChanges
{
  @Input({ required: true }) layer: CapaMapa | undefined = undefined; //Capa
  @Input() textColor: string | null = null; //color del texto
  @Input() fontSizeLeafLayer:
    | 'text-xs'
    | 'text-sm'
    | 'text-base'
    | 'text-lg'
    | 'text-xl'
    | 'text-2xl'
    | 'text-3xl'
    | 'text-4xl'
    | 'text-5xl'
    | 'text-6xl'
    | 'text-7xl'
    | 'text-xl' = 'text-base'; //indica el tamaño del texto para las capas tipo hoja

  @Input() fontSizeParentLayer:
    | 'text-xs'
    | 'text-sm'
    | 'text-base'
    | 'text-lg'
    | 'text-xl'
    | 'text-2xl'
    | 'text-3xl'
    | 'text-4xl'
    | 'text-5xl'
    | 'text-6xl'
    | 'text-7xl'
    | 'text-xl' = 'text-2xl'; //indica el tamaño del texto para las capas tipo padre

  @Input() fontSizeTransparencyText:
    | 'text-xs'
    | 'text-sm'
    | 'text-base'
    | 'text-lg'
    | 'text-xl'
    | 'text-2xl'
    | 'text-3xl'
    | 'text-4xl'
    | 'text-5xl'
    | 'text-6xl'
    | 'text-7xl'
    | 'text-xl' = 'text-sm'; //indica el tamaño del texto para las capas tipo hoja
  @Input() severityButton:
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'help'
    | 'primary'
    | 'secondary'
    | 'contrast'
    | null
    | undefined = 'contrast';
  isActivated = false; //Variable para indicar si la capa fue activada, muestra el slider
  transparencyLevel = 0; //nivel de transparencia de la capa

  constructor(protected override layerOptionsService: LayerOptionService) {
    super(layerOptionsService);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['layer'] && this.layer) {
      this.isActivated = this.layer.isActivated ?? this.layer.checked ?? false;
      //this.transparencyLevel = this.layer.transparency ?? 0;
    }
  }

  ngOnInit(): void {
    if (this.layer) {
      this.isActivated = this.layer.isActivated ?? this.layer.checked ?? false;
      this.transparencyLevel = this.layer.transparencyValue ?? 0;
    }
  }

  updateActivatedValue(layer: CapaMapa, state: boolean) {
    this.transparencyLevel = 0;
    this.onChangeActivatedValue(layer, state);
  }
}
