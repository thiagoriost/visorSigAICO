import { Component } from '@angular/core';
// ==== COMPONENTS ====
import { VisorDefaultComponent } from '@app/core/components/layouts/visor-default/visor-default/visor-default.component';

/**
 * Página de inicio del visor
 *
 * @author Juan Carlos Valderrama González
 */

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [VisorDefaultComponent],
  templateUrl: './index-page.component.html',
  styleUrl: './index-page.component.scss',
})
export class IndexPageComponent {}
