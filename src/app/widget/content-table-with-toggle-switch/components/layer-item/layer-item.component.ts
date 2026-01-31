import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LayerItemBaseDirective } from '@app/shared/directives/layer-item-base/layer-item-base.directive';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';

/**
 * Componente que muestra el titulo de la capa y un boton de apagar/prender
 * @date 17-06-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-layer-item',
  standalone: true,
  imports: [ToggleSwitchModule, FormsModule, CommonModule],
  providers: [],
  templateUrl: './layer-item.component.html',
  styleUrl: './layer-item.component.scss',
})
export class LayerItemComponent
  extends LayerItemBaseDirective
  implements OnInit, OnChanges
{
  @Input({ required: true }) layer: CapaMapa | undefined = undefined; //capa
  @Input() textColor: string | null = null; //color del texto
  @Input() isCenterTitleText = false; //indica si el texto está centrado o no (solo aplica para capas padre)

  isActivated = false; //indica si la capa está activada o no

  ngOnInit(): void {
    if (this.layer) {
      this.isActivated = this.layer.isActivated ?? this.layer.checked ?? false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['layer'] && this.layer) {
      this.isActivated = this.layer.isActivated ?? this.layer.checked ?? false;
      //this.transparencyLevel = this.layer.transparency ?? 0;
    }
  }
}
