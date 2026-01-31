import { Component } from '@angular/core';
// Modelo de estado relacionado con el mapa
import { MapState } from '@app/core/interfaces/store/map.model';
// Acciones del store que modifican la interfaz de usuario
import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';
// Componente de búsqueda de dirección
import { BuscarDireccionComponent } from '@app/widget/buscarDireccion/components/buscar-direccion/buscar-direccion.component';
// Servicio de store (NgRx) para la gestión de estado global
import { Store } from '@ngrx/store';
// Botón de PrimeNG
import { Button } from 'primeng/button';
// Componente de barra de escala
import { BarraEscalaComponent } from '@app/widget/barraEscala/components/barra-escala/barra-escala.component';
// Componente de coordenadas de la vista
import { ViewCoordsComponent } from '@app/widget/viewCoords/components/view-coords/view-coords.component';

import { BackgroundStyleComponent } from '@app/shared/utils/background-style/backgroundStyle';
import { TooltipModule } from 'primeng/tooltip';

/**
 * @class CricBottombarComponent
 * @extends BackgroundStyleComponent
 * @description
 * Componente visual que representa la **barra inferior** del visor geográfico CRIC.
 *
 * Su propósito principal es ofrecer acceso rápido a herramientas auxiliares del visor, como:
 * - Búsqueda de dirección (`BuscarDireccionComponent`)
 * - Escala del mapa (`BarraEscalaComponent`)
 * - Coordenadas de la vista (`ViewCoordsComponent`)
 * - Botones de acciones rápidas (ej. imprimir o identificar elementos)
 *
 * Además, este componente se integra con el **Store (NgRx)** para interactuar con el estado
 * global de la aplicación, despachando acciones que abren widgets específicos.
 *
 * @date 16-10-2025
 * @version 1.0.0
 * @author
 * Carlos Muñoz — IGAC (javier.munoz@igac.gov.co)
 *
 * @example
 * ```html
 * <!-- Ejemplo de uso en el layout principal -->
 * <app-cric-bottombar></app-cric-bottombar>
 * ```
 */
@Component({
  selector: 'app-cric-bottombar', // Selector usado en el template HTML
  standalone: true,
  imports: [
    // Declaración de componentes hijos que se usan dentro del template
    BuscarDireccionComponent,
    Button,
    BarraEscalaComponent,
    ViewCoordsComponent,
    TooltipModule,
  ],
  templateUrl: './cric-bottombar.component.html', // Vista asociada al componente
  styleUrl: './cric-bottombar.component.scss', // Estilos específicos del componente
})
export class CricBottombarComponent extends BackgroundStyleComponent {
  /**
   * @constructor
   * @param {Store<MapState>} store
   * Servicio del Store de NgRx tipado con `MapState`.
   * Permite despachar acciones globales que modifican el estado de la interfaz
   * o activan módulos específicos del visor (como ExportarMapa o Identify).
   *
   * @remarks
   * Este constructor también llama al `super()` de la clase base
   * {@link BackgroundStyleComponent}, que aplica estilos de fondo comunes
   * a los componentes del visor.
   */
  constructor(private store: Store<MapState>) {
    super();
  }

  /**
   * @method onToggleImprimir
   * @description
   * Abre el módulo de **ExportarMapa3** dentro del visor.
   *
   * Despacha la acción `SetSingleComponentWidget` al Store de NgRx,
   * estableciendo `"ExportarMapa3"` como el componente activo en la interfaz.
   *
   * Si el componente ya estaba abierto, se vuelve a montar (refresca su instancia),
   * garantizando que el usuario siempre vea la versión actualizada del widget.
   *
   * @returns {void}
   */
  onToggleImprimir(): void {
    this.store.dispatch(SetSingleComponentWidget({ nombre: 'ExportarMapa3' }));
  }

  /**
   * @method onToggleIdentificar
   * @description
   * Abre el módulo de **Identificación (Identify)** en el visor geográfico.
   *
   * Despacha la acción `SetSingleComponentWidget` al Store,
   * configurando `"Identify"` como el componente único visible
   * en la interfaz de usuario.
   *
   * @returns {void}
   */
  onToggleIdentificar(): void {
    this.store.dispatch(SetSingleComponentWidget({ nombre: 'Identify' }));
  }
}
