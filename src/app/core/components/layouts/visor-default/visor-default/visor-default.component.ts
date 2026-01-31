import { Component } from '@angular/core';
// ===== COMPONENTS =====
import { MapComponent } from '@app/core/components/map/map.component';
import { PanelComponent } from '@app/core/components/panel/panel.component';

/**
 * Componente con el layout por defecto del visor
 * organiza los componentes principales sobre el mapa
 *
 * @autor Juan Carlos Valderrama González
 */
@Component({
  selector: 'app-visor-default',
  standalone: true,
  imports: [MapComponent, PanelComponent],
  templateUrl: './visor-default.component.html',
  styleUrl: './visor-default.component.scss',
})
export class VisorDefaultComponent {}
