import { Component, Input, OnInit } from '@angular/core';
import { CoordinateScaleLineComponent } from '../../coordinate-scale-line/coordinate-scale-line.component';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { MiniMapComponent } from '@app/widget/miniMap/components/mini-map/mini-map.component';

/**
 * @description
 * Componente principal que define la estructura y funcionalidad del footer
 * del visor AISO. Incluye la selección de mapas base, mini-mapa y línea de escala de coordenadas.
 * Adapta su presentación según el tamaño de pantalla (desktop o móvil).
 *
 * @autor Heidy Paola Lopez Sanchez
 */

@Component({
  selector: 'app-aiso-footer',
  imports: [CoordinateScaleLineComponent, MiniMapComponent],
  templateUrl: './aiso-footer.component.html',
  styleUrl: './aiso-footer.component.css',
})
export class AisoFooterComponent implements OnInit {
  @Input() isSmallScreen = false; //variable para determinar si la resolucion de pantalla es de tipo movil
  mapasBaseOptions: { label: string; value: MapasBase }[] = []; //Opciones de mapas base disponibles
  selectedBaseMap: MapasBase = MapasBase.ESRI_STANDARD; //Mapa base seleccionado por defecto

  /**
   * @description
   * Servicio encargado de gestionar los mapas base.
   * Permite obtener todas las opciones de mapas base disponibles.
   *
   * @param mapaBaseService Servicio de mapas base
   */
  constructor(private mapaBaseService: MapaBaseService) {}

  /**
   * @description
   * Método del ciclo de vida de Angular que se ejecuta al inicializar el componente.
   * - Carga todas las opciones de mapas base desde el servicio.
   */
  ngOnInit(): void {
    this.mapasBaseOptions = this.mapaBaseService.getAllMapOptions();
  }
}
