import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { MessageModule } from 'primeng/message';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { MapLegendService } from '@app/core/services/map-legend-service/map-legend.service';
import { LeyendaItemComponent } from '@app/widget/leyenda/components/leyenda-item/leyenda-item.component';

/**
 * Componente responsable de mostrar la leyenda de las capas activas en el mapa.
 *
 * Este componente se suscribe al servicio `MapLegendService`, el cual proporciona
 * las capas activas junto con sus URLs de leyenda (obtenidas vía WMS `GetLegendGraphic`).
 * Cada leyenda se renderiza usando `LeyendaItemComponent`.
 *
 * Funcionalidades principales:
 * - Mostrar las leyendas de las capas visibles en el mapa.
 * - Manejo de errores para fallos al cargar las leyendas.
 * - Limpieza automática de suscripciones al destruir el componente.
 *
 * Dependencias:
 * - `MapLegendService`: Lógica centralizada para obtener capas con leyendas.
 * - `LeyendaItemComponent`: Visualización de cada entrada de leyenda.
 * - `primeng/image`, `primeng/message`: Mejoras visuales.
 * - `CommonModule`: Directivas estructurales básicas de Angular.
 *
 * @author Carlos Alberto Aristizábal Vargas
 * @date 27-06-2025
 * @version 2.0.0 - Refactor para usar `MapLegendService` y separar lógica de presentación.
 */
@Component({
  selector: 'app-leyenda',
  standalone: true,
  imports: [CommonModule, ImageModule, MessageModule, LeyendaItemComponent],
  templateUrl: './leyenda.component.html',
  styleUrls: ['./leyenda.component.scss'],
})
export class LeyendaComponent implements OnInit, OnDestroy {
  /**
   * Lista de capas activas con sus respectivas URLs de leyenda WMS.
   * Esta información es provista por el servicio `MapLegendService`.
   */
  capas: (LayerStore & { leyendaUrl?: string })[] = [];

  /**
   * Mensaje de error general que se muestra cuando alguna capa
   * no puede cargar su leyenda correctamente.
   */
  mensajeError: string | null = null;

  /**
   * Observable utilizado para cancelar automáticamente las suscripciones
   * cuando el componente es destruido, evitando fugas de memoria.
   */
  private destroy$ = new Subject<void>();

  /**
   * Constructor del componente.
   *
   * @param mapLegendService Servicio que provee las capas con sus leyendas listas para ser mostradas.
   */
  constructor(private mapLegendService: MapLegendService) {}

  /**
   * Hook del ciclo de vida de Angular que se ejecuta al inicializar el componente.
   * Se suscribe a las capas con leyenda y actualiza el estado del componente.
   */
  ngOnInit(): void {
    this.mapLegendService
      .obtenerCapasConLeyendas()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ capas, mensajeError }) => {
        this.capas = capas;
        this.mensajeError = mensajeError;
      });
  }

  /**
   * Hook del ciclo de vida de Angular que se ejecuta al destruir el componente.
   * Cancela todas las suscripciones activas para evitar fugas de memoria.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
