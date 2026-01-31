import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerItemV3Component } from '@app/widget/content-table-version-3/components/layer-item-v3/layer-item-v3.component';
import { BackgroundStyleComponent } from '@app/shared/utils/background-style/backgroundStyle';

/**
 * Componente encargado de renderizar las capas de manera recursiva
 * @date 29-07-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-layer-tree',
  standalone: true,
  imports: [CommonModule, LayerItemV3Component],
  templateUrl: './layer-tree.component.html',
  styleUrl: './layer-tree.component.scss',
})
export class LayerTreeComponent
  extends BackgroundStyleComponent
  implements OnChanges
{
  @Input() layer: CapaMapa | undefined = undefined; //definicion de la capa
  @Input() isExpanded = true; //indica si el componente inicia expandido o colapsado
  @Input() isFilteringResult = false; //variable que indica si se esta haciendo filtro sobre la lista de capas
  @Input() iconsColor: string | null = null;
  @Input() layerItemIconsColor: string | null = null; //color para los iconos de la capa
  @Input() titleColor: string | null = null; //color para el titulo de la capa
  @Input() showMetadataIcon = 'pi pi-code'; //icono para mostrar metadatos
  @Input() turnOffLayerIcon = 'pi pi-eye-slash'; //icono patra ocultar la capa
  @Input() turnOnLayerIcon = 'pi pi-eye'; //icono para mostrar la capa
  @Input() moreOptionsIcon = 'pi pi-ellipsis-v'; //icono para las opciones de la capa
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
  private initialExpanded!: boolean; // guarda el valor inicial de isExpanded

  /**
   * Se crea la instancia del componente
   * Se hace el constructor de la directiva
   */
  constructor() {
    super();
  }
  /**
   * Valida cambios en la capa
   * @param changes cambios
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialExpanded === undefined) {
      this.initialExpanded = this.isExpanded;
    }
    if (changes['isFilteringResult']) {
      if (this.isFilteringResult) {
        this.isExpanded = true;
      } else {
        this.isExpanded = this.initialExpanded;
      }
    }
  }

  /**
   * Cambia el valor de expandido/colapsado
   */
  onToggle(): void {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Obtiene la clase que se aplica a los iconos del toggle
   * @returns clase a aplicar al texto del arbol
   * @readonly metodo de solo lectura
   */
  get dynamicClass(): string {
    if (this.iconsColor === null) {
      return this.appliedClass === 'bg-primary-500'
        ? 'text-color'
        : 'primary-color';
    }
    return this.iconsColor;
  }
}
