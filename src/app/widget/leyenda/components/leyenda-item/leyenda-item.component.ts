import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';

/**
 * Componente encargado de renderizar un ítem individual de la leyenda para una capa.
 *
 * Este componente recibe como entrada una capa (`LayerStore`) con su respectiva URL de leyenda WMS
 * y se encarga de visualizar tanto el título de la capa como la imagen correspondiente a su leyenda.
 *
 * Es utilizado por el componente `LeyendaComponent` para mostrar una lista completa de leyendas
 * asociadas a las capas activas del mapa.
 *
 * Funcionalidades principales:
 * - Muestra el nombre o título de la capa.
 * - Renderiza la imagen de la leyenda desde una URL WMS (`GetLegendGraphic`).
 * - Permite ser reutilizado para cualquier capa que implemente `LayerStore` con una `leyendaUrl`.
 *
 * Dependencias:
 * - `ImageModule`: De PrimeNG, utilizado para mostrar la imagen con mejoras visuales.
 * - `CommonModule`: Para compatibilidad con directivas de Angular como `*ngIf`, `*ngFor`, etc.
 *
 * @input capa - Objeto que contiene la definición de la capa y su URL de leyenda.
 *
 * @example
 * <app-leyenda-item [capa]="capaConLeyenda"></app-leyenda-item>
 *
 * @author Carlos Alberto Aristizábal Vargas
 * @date 19-05-2025
 * @version 1.0.0
 */
@Component({
  selector: 'app-leyenda-item',
  standalone: true,
  imports: [CommonModule, ImageModule],
  templateUrl: './leyenda-item.component.html',
  styleUrls: ['./leyenda-item.component.scss'],
})
export class LeyendaItemComponent {
  /**
   * Capa que contiene la información para mostrar la leyenda, incluyendo la URL de la imagen WMS.
   */
  @Input() capa!: LayerStore & { leyendaUrl?: string };
}
