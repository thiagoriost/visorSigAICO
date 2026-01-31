import { Component, Input, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SliderModule } from 'primeng/slider';
import { LayerAction } from '@app/core/interfaces/enums/LayerAction.enum';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LayerItemBaseDirective } from '@app/shared/directives/layer-item-base/layer-item-base.directive';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';
import { PopoverModule } from 'primeng/popover';
/**
 * @description Compoente que contiene la tarjeta de la capa con los botones disponibles
 * @author Andres Fabian Simbaqueba del Rio <<anfasideri@hotmail.com>>
 * @date 03/12/2024
 * @class LayerComponent
 */
@Component({
  selector: 'app-layer',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    SliderModule,
    CommonModule,
    FormsModule,
    PopoverModule,
  ],
  providers: [],
  templateUrl: './layer.component.html',
  styleUrl: './layer.component.scss',
})
export class LayerComponent extends LayerItemBaseDirective implements OnInit {
  @Input({ required: true }) layer: LayerStore | undefined = undefined; //parametro de entrada ---> capa del store: para construir la tarjeta con los botones
  @Input() isTitleBold = false; //indica si el titulo de la capa es de tipo bold o normal
  layerActions = LayerAction; //opciones sobre las capas
  isLoading = false; // indica si se está cargando la capa
  transparencyValue = 0; //variable para ngModel del slider de transparencia

  /**
   * Metodo constructor
   * @param formBuilder builder de formularios
   */
  constructor(protected override layerOptionsService: LayerOptionService) {
    super(layerOptionsService);
  }

  /**
   * Realiza una animación de carga por tres segundos
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
    this.load();
    if (this.layer) {
      this.transparencyValue =
        this.layer.transparencyLevel !== 0
          ? 100 - this.layer.transparencyLevel
          : 0;
    }
  }

  /**
   * Obtiene el nombre de la capa, si ees de origen eexterno le agrega (E) al final
   * @param layer capa
   * @returns titulo de la capa
   */
  getTitleOfLayer(layer: LayerStore): string {
    const titulo = layer?.layerDefinition?.titulo ?? 'Sin título';
    const origin = layer?.layerDefinition?.origin;

    return origin === 'external' ? `${titulo} (E)` : titulo;
  }
}
