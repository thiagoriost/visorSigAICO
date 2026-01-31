import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { Comunidades } from '@app/core/interfaces/auth/Comunidad';
import { ContentTableDirectusSearchService } from '@app/core/services/content-table-directus-search/content-table-directus-search.service';

@Component({
  selector: 'app-linea-negra-logos-comunidades',
  imports: [ImageModule, CommonModule],
  templateUrl: './logos-comunidades.component.html',
  styleUrl: './logos-comunidades.component.scss',
})
export class LogosComunidadesComponent implements OnInit {
  @Input() fondo = false;

  comunidades: Comunidades[] = [];
  constructor(private comunidadesConsulta: ContentTableDirectusSearchService) {}

  ngOnInit(): void {
    this.cargarComunidades();
  }

  async cargarComunidades(): Promise<void> {
    const response = await this.comunidadesConsulta.consultarComunidades();
    this.comunidades = response.data ?? [];
    console.log('Comunidades cargadas:', this.comunidades);
  }

  /** Devuelve color solo si fondo=true */
  getColor(comunidad: Comunidades): string {
    return this.fondo ? comunidad.Color_Primario : 'transparent';
  }

  /** Construye la URL del logo desde directus */
  getLogoUrl(idAsset: string | null): string {
    if (!idAsset) {
      return ''; // o una imagen por defecto si la deseas
    }

    return `https://dev-sigansestral.igac.gov.co/cms-admin/assets/${idAsset}`;
  }
}
