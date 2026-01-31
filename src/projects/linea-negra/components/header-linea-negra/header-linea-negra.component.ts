import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LogosComunidadesComponent } from '../logos-comunidades/logos-comunidades.component';
import { Image } from 'primeng/image';

/**
 * Componente que contiene el encabezado para el SIG de la linea negra
 * @date 22-09-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-header-linea-negra',
  imports: [CommonModule, LogosComunidadesComponent, Image],
  templateUrl: './header-linea-negra.component.html',
  styleUrl: './header-linea-negra.component.scss',
})
export class HeaderLineaNegraComponent {
  @Input() urlImagenLogo = 'assets/images/linea-negra-icon.svg'; //url del logo para el header
  @Input() titleHeader: string | null = null; // Título del header
  @Input() isMobile = false;
  @Input() isAuthenticatedUser = false; //indica si existe un usuario autenticado
  imagePath = 'assets/images/logo_texto_sig_ln_blanco.png'; // URL del logo SIG ANCESTRAL DE LA LINEA NEGRA
}
