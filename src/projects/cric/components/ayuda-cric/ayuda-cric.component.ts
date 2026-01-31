import { Component } from '@angular/core';
import { DescargaManualComponent } from '@app/widget/ayuda/components/descarga-manual/descarga-manual.component';

/**
 * @class AyudaCricComponent
 * @description
 * Componente principal del módulo de **Ayuda CRIC**.
 *
 * Este componente actúa como contenedor visual para presentar al usuario
 * el **manual de uso del visor** y otros recursos de ayuda relacionados
 * con la aplicación del **Visor Geográfico CRIC**.
 *
 * Su funcionalidad se basa en la composición del subcomponente
 * {@link DescargaManualComponent}, que permite la descarga directa del manual
 * de usuario en formato PDF u otros medios definidos.
 *
 * @date 02-10-2025
 * @version 1.0.0
 * @author
 * Carlos Muñoz — IGAC (carlos.munoz@igac.gov.co)
 *
 * @example
 * ```html
 * <!-- Ejemplo de uso básico -->
 * <app-ayuda-cric></app-ayuda-cric>
 * ```
 */
@Component({
  selector: 'app-ayuda-cric',
  standalone: true,
  imports: [DescargaManualComponent],
  providers: [],
  templateUrl: './ayuda-cric.component.html',
  styleUrl: './ayuda-cric.component.scss',
})
export class AyudaCricComponent {}
