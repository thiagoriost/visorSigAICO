import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapLayerManagerService } from '@app/core/services/map-layer-manager/map-layer-manager.service';
import { ButtonModule } from 'primeng/button';

import { PrimeNG } from 'primeng/config';
import { ToastModule } from 'primeng/toast';

/**
 * Componente raíz de la aplicación del Visor Geográfico Estándar.
 *
 * Este componente standalone actúa como el punto de entrada principal de la aplicación,
 * configurando los servicios base, las bibliotecas de UI (PrimeNG) y el enrutamiento.
 * Proporciona la estructura fundamental para el visor geográfico y gestiona la
 * configuración inicial de la interfaz de usuario.
 *
 * @example
 * ```html
 * <!-- Bootstrap de la aplicación en main.ts -->
 * bootstrapApplication(AppComponent, appConfig);
 * ```
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, ToastModule],
  providers: [MapLayerManagerService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  /** Título principal de la aplicación del visor geográfico */
  title = 'visor-geografico-estandar-2024';

  /** Subtítulo o identificador secundario de la aplicación */
  Wubtitle = '44';

  /**
   * Constructor del componente principal de la aplicación.
   *
   * Inyecta las dependencias necesarias para la configuración global de PrimeNG
   * y la gestión de capas del mapa geográfico.
   *
   * @param primeng - Servicio de configuración global de PrimeNG para establecer
   *                  opciones de UI como efectos ripple, temas y localización.
   * @param mapLayerManageService - Servicio para la gestión de capas del mapa,
   *                                incluyendo la carga, visualización y manipulación
   *                                de capas geográficas.
   */
  constructor(
    private primeng: PrimeNG,
    private mapLayerManageService: MapLayerManagerService
  ) {}

  /**
   * Hook de inicialización del ciclo de vida de Angular.
   *
   * Se ejecuta una vez después de que Angular haya inicializado todas las
   * propiedades vinculadas a datos del componente. Configura las opciones
   * globales de PrimeNG, específicamente habilitando el efecto ripple para
   * mejorar la experiencia de usuario con retroalimentación visual en las
   * interacciones.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * // Este método se ejecuta automáticamente por Angular
   * // No es necesario llamarlo manualmente
   * ```
   */
  ngOnInit(): void {
    this.primeng.ripple.set(true);
  }
}
