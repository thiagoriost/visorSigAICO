import { Injectable } from '@angular/core';
import { Preset } from '@primeng/themes/types';
import { PrimeNG } from 'primeng/config';
import { definePreset, palette } from '@primeng/themes';
import { Comunidades } from '@app/core/interfaces/auth/Comunidad';
import { BasePreset } from '@projects/linea-negra/assets/preset';

/**
 * Servicio encargado de gestionar los temas de la aplicación (estilos del proyecto)
 * @date 2025/11/04
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Injectable({ providedIn: 'root' })
export class AppThemeService {
  constructor(private primengConfig: PrimeNG) {}

  /**
   * Aplica el tema dinámico según los colores de la comunidad.
   * Si no hay datos de comunidad, aplica el BasePreset por defecto.
   * @param comunidad comunidad autenticada
   */
  applyDynamicTheme(comunidad?: Comunidades): void {
    const preset = comunidad ? this.buildDynamicPreset(comunidad) : BasePreset;
    this.primengConfig.theme.set({
      preset: preset,
      options: {
        darkModeSelector: false,
      },
    });
  }

  /**
   * Crea un preset dinámico basado en los colores de la comunidad.
   * @param community comunidad
   * @returns prset construido con los colores de la comunidad
   */
  buildDynamicPreset(community: Comunidades): Preset {
    return definePreset(BasePreset, {
      semantic: {
        primary: this.generatePalette(community.Color_Primario),
        secondary: this.generatePalette(community.Color_Secundario),
        text: {
          color: '#000000',
        },
        colorScheme: {
          text: { color: '#000000' },
        },
      },
    });
  }

  /**
   * Genera una paleta de colores en base a un color
   * @param color color principal de la paleta
   * @returns arreglo con los colores de la paleta
   */
  generatePalette(color: string): Record<string, string> {
    return palette(color);
  }
}
