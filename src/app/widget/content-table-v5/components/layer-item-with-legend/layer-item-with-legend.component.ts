import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { SliderModule } from 'primeng/slider';
import { LayerItemBaseDirective } from '@app/shared/directives/layer-item-base/layer-item-base.directive';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { MapLegendService } from '@app/core/services/map-legend-service/map-legend.service';

/**
 * Componente que renderiza una capa con las opciones disponibles y la leyenda de la capa
 * @date 29-08-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-layer-item-with-legend',
  imports: [
    ButtonModule,
    TooltipModule,
    ImageModule,
    CommonModule,
    PopoverModule,
    FormsModule,
    SliderModule,
  ],
  providers: [MapLegendService],
  templateUrl: './layer-item-with-legend.component.html',
  styleUrl: './layer-item-with-legend.component.scss',
})
export class LayerItemWithLegendComponent
  extends LayerItemBaseDirective
  implements OnInit, OnDestroy
{
  @Input() layer: LayerStore | undefined = undefined; //Capa del store
  @Input() isLegendVisible = false; //variable para indicar si la leyenda es visible o colapsada
  @Input() ocultLayerIcon = 'pi pi-eye-slash'; // icono para ocultar la capa
  @Input() showLayerIcon = 'pi pi-eye'; // icono para mostrar la capa
  @Input() setTransparencyIcon = 'pi pi-sliders-h'; // icono para generar trasnparencia de la capa
  @Input() showMetadataIcon = 'pi pi-file-o'; // icono para mostrar metadatos de la capa
  @Input() showLegendIcon = 'pi pi-palette'; // icono para mostrar la leyenda la capa
  @Input() deleteLayerIcon = 'pi pi-times'; // icono para eliminar la capa
  @Input() textColor: string | null = null; //color para el texto del titulo de la capa
  @Input() isTextButton = true; //indica si el boton es tipo texto o lleva fondo
  @Input() isRoundedButton = false; //indica si el boton es redondeado
  legendUrl: string | null = null; // url de leyenda

  isVisibleLayer = false; // indica si la capa esta activa
  transparencyValue = 0; //representa el valor de la transparencia

  constructor(
    protected override layerOptionsService: LayerOptionService,
    private mapLegendService: MapLegendService
  ) {
    super(layerOptionsService);
  }

  /**
   * Se construye el formulario para el slider y se obtiene la URL de la leyenda para cargar la imagen
   */
  ngOnInit(): void {
    if (this.layer) {
      this.legendUrl = this.mapLegendService.obtenerURLLeyendaDeCapa(
        this.layer
      );
      this.isVisibleLayer = this.layer.isVisible;
      this.transparencyValue =
        this.layer.transparencyLevel !== 0
          ? 100 - this.layer.transparencyLevel
          : 0;
    }
  }
  /**
   * Se ajusta el valor de la URL de leyenda
   */
  ngOnDestroy(): void {
    this.legendUrl = null;
  }

  /**
   * Se ejecuta para cambiar el valor de la visibilidad de la leyenda
   */
  onChangeLegendVisibility() {
    this.isLegendVisible = !this.isLegendVisible;
  }

  /**
   * Metodo para obtener el titulo de la capa
   * si el origen es externo se le adiciona (E) al titulo
   * @param layer defincion de la capa
   * @returns titulo de la capa
   */
  getLayerTitle(layer: LayerStore): string {
    const origin = layer?.layerDefinition?.origin;
    const titulo = layer?.layerDefinition?.titulo ?? '';
    return origin === 'external' ? `(E) ${titulo}` : titulo;
  }
}
