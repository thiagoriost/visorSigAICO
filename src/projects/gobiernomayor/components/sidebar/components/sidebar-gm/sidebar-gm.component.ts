import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarLayoutGmComponent } from '../sidebar-layout-gm/sidebar-layout-gm.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ContentTableV4Component } from '@app/widget/content-table-v4/components/content-table-v4/content-table-v4.component';
import { DescargaManualComponent } from '@app/widget/ayuda/components/descarga-manual/descarga-manual.component';
import { environment } from '@projects/gobiernomayor/environments/environment';

type SideTab = 'capas' | 'ayuda';

/** Tipado mínimo del environment que usa este componente (sin any) */
interface Branding {
  logoUrl?: string;
  railPatternUrl?: string;
}
type GovMayorEnvironment = typeof environment & {
  branding?: Branding;
  exportMap: { logoUrl: string };
};
/** Alias tipado del environment para evitar `as any` */
const env = environment as GovMayorEnvironment;

@Component({
  selector: 'app-sidebar-gm',
  standalone: true,
  imports: [
    CommonModule,
    SidebarLayoutGmComponent,
    ButtonModule,
    TooltipModule,
    ContentTableV4Component,
    DescargaManualComponent,
  ],
  templateUrl: './sidebar-gm.component.html',
})
export class SidebarGmComponent {
  activeTab: SideTab = 'capas';

  /** Mostrar/ocultar la franja de logo interna (por defecto: OCULTO) */
  @Input() showHeaderLogo = false;

  /** === Dimensiones del rail y botones (ajustables) === */
  railWidth = 72;
  buttonBox = 48;
  indicatorOffset = -8;
  patternWidth = 64;

  buttonRadius = 8; // <-- esquinas cuadradas (ajústalo: 0, 4, 8, 10…)
  //  activeBridgeRadius = 8;     // <-- usa el mismo radio para el bridge (opcional)
  activeBridgeRadius = 12; // radio del rectángulo blanco

  /** === “Bridge” blanco cuando el tab está activo (efecto pegado) === */
  activeBridgeOverlap = 12; // cuánto se mete hacia el panel (left negativo)
  activeBridgeExtraW = 12; // ancho extra hacia la derecha
  activeBridgeExtraH = 8; // alto extra total (arriba/abajo)
  railScrollbarGutter = 12;

  primaryColor = 'var(--primary-color)';

  get logoUrl(): string {
    return env.branding?.logoUrl ?? env.exportMap.logoUrl;
  }

  get railPatternUrl(): string {
    return (
      env.branding?.railPatternUrl ??
      'assets/images/SIG_gobierno_mayor_Trama.png'
    );
  }

  get railPatternStyle(): Record<string, string> {
    const encoded = encodeURI(this.railPatternUrl);
    return {
      'background-image': `url("${encoded}")`,
      'background-repeat': 'repeat-y',
      'background-position': 'center top',
      'background-size': `${this.patternWidth}px auto`,
      opacity: '1',
    };
  }

  setTab(tab: SideTab): void {
    this.activeTab = tab;
  }

  isActive(tab: SideTab): boolean {
    return this.activeTab === tab;
  }
}
