import { Component, OnInit } from '@angular/core';
import { MapState } from '@app/core/interfaces/store/map.model';
import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { SpeedDialModule } from 'primeng/speeddial';
import { BuscarDireccionComponent } from '@app/widget/buscarDireccion/components/buscar-direccion/buscar-direccion.component';
import { BarraEscalaComponent } from '@app/widget/barraEscala/components/barra-escala/barra-escala.component';
import { MiniMapV2Component } from '@app/widget/miniMap_v2/components/mini-map-v2/mini-map-v2.component';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { environment } from 'environments/environment';

/**
 * @class MobileCricBottombarComponent
 * @implements OnInit
 * @description
 * Componente **móvil** del visor CRIC que actúa como **barra de navegación inferior**.
 *
 * Este componente reemplaza la barra inferior cuando el visor se utiliza
 * en dispositivos con pantallas pequeñas (móviles o tablets).
 *
 * Su objetivo principal es **mejorar la usabilidad móvil**, ofreciendo accesos directos
 * a las funcionalidades principales del visor:
 * - Salida gráfica (Imprimir)
 * - Identificar elementos geográficos
 * - Mostrar la leyenda de capas
 *
 * Además, integra componentes informativos como:
 * - `BuscarDireccionComponent` (búsqueda geográfica)
 * - `BarraEscalaComponent` (escala cartográfica)
 * - `MiniMapV2Component` (mini mapa de orientación)
 *
 * @date 16-10-2025
 * @version 1.0.0
 * @author
 * Carlos Muñoz — IGAC (javier.munoz@igac.gov.co)
 *
 * @example
 * ```html
 * <!-- Ejemplo de uso en un layout móvil -->
 * <app-mobile-cric-bottombar></app-mobile-cric-bottombar>
 * ```
 */
@Component({
  selector: 'app-mobile-cric-bottombar',
  standalone: true,
  imports: [
    SpeedDialModule,
    BuscarDireccionComponent,
    BarraEscalaComponent,
    MiniMapV2Component,
  ],
  templateUrl: './mobile-cric-bottombar.component.html',
  styleUrl: './mobile-cric-bottombar.component.scss',
})
export class MobileCricBottombarComponent implements OnInit {
  /**
   * @property {MenuItem[] | null} items
   * @description
   * Lista de elementos del menú flotante (SpeedDial) que contienen
   * los accesos directos a las funciones principales del visor.
   *
   * Se inicializa durante el ciclo `ngOnInit()`.
   *
   * @default null
   */
  items: MenuItem[] | null = null;

  /**
   * @property {MapasBase} baseMiniMap
   * @description
   * Capa base por defecto del mini mapa inferior.
   * Se obtiene desde el archivo de configuración `environment`.
   *
   * @example
   * ```ts
   * baseMiniMap = environment.map.baseLayer as MapasBase;
   * ```
   */
  baseMiniMap = environment.map.baseLayer as MapasBase; //Mapa base por defecto

  /**
   * @constructor
   * @param store {Store<MapState>} - Inyección del **Store de NgRx** tipado con `MapState`.
   * Permite despachar acciones que modifican el estado global de la interfaz.
   *
   * @example
   * ```ts
   * this.store.dispatch(SetSingleComponentWidget({ nombre: 'Identify' }));
   * ```
   */
  constructor(private store: Store<MapState>) {}

  /**
   * @method ngOnInit
   * @description
   * Inicializa el componente definiendo los **ítems del menú SpeedDial**.
   * Cada ítem está asociado a un comando que ejecuta una acción específica en el visor.
   */
  ngOnInit() {
    this.items = [
      {
        icon: 'pi cric-imprimir',
        label: 'Salida gráfica',
        command: () => {
          this.onToggleImprimir();
        },
      },
      {
        icon: 'pi cric-identificar',
        label: 'Identificar',
        command: () => {
          this.onToggleIdentificar();
        },
      },
      {
        icon: 'pi pi-palette',
        label: 'Leyenda',
        command: () => {
          this.onToggLeyenda();
        },
      },
    ];
  }

  /**
   * @method onToggleImprimir
   * @description
   * Activa el módulo de **Salida Gráfica** en el visor.
   *
   * - Despacha la acción `SetSingleComponentWidget` con el nombre `"ExportarMapa3"`.
   * - Muestra el componente de exportación de mapas como widget activo.
   *
   * @example
   * ```ts
   * this.onToggleImprimir(); // Abre el módulo ExportarMapa3
   * ```
   */
  onToggleImprimir(): void {
    this.store.dispatch(SetSingleComponentWidget({ nombre: 'ExportarMapa3' }));
  }

  /**
   * @method onToggleIdentificar
   * @description
   * Activa el módulo de **Identificación de elementos geográficos**.
   *
   * - Despacha la acción `SetSingleComponentWidget` con el nombre `"Identify"`.
   * - Permite al usuario seleccionar y consultar información de elementos del mapa.
   *
   * @example
   * ```ts
   * this.onToggleIdentificar(); // Activa el módulo Identify
   * ```
   */
  onToggleIdentificar(): void {
    this.store.dispatch(SetSingleComponentWidget({ nombre: 'Identify' }));
  }

  /**
   * @method onToggLeyenda
   * @description
   * Activa el módulo de **Leyenda de capas** dentro del visor.
   *
   * - Despacha la acción `SetSingleComponentWidget` con el nombre `"Leyenda V2"`.
   * - Permite al usuario visualizar la simbología de las capas activas en el mapa.
   *
   * @example
   * ```ts
   * this.onToggLeyenda(); // Muestra la leyenda actual
   * ```
   */
  onToggLeyenda(): void {
    this.store.dispatch(SetSingleComponentWidget({ nombre: 'Leyenda V2' }));
  }
}
