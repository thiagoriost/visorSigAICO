import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ViewCoordsService } from '../../services/view-coords.service';
import { CRSCode } from '../../interface/crs-code';
import { NgStyle } from '@angular/common';

/**
 * Componente que muestra las coordenadas del cursor sobre el mapa en formato
 * grados, minutos y segundos (DMS).
 * @author Heidy Paola Lopez Sanchez
 */

@Component({
  selector: 'app-view-coords',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './view-coords.component.html',
  styleUrl: './view-coords.component.scss',
})
export class ViewCoordsComponent implements OnChanges, OnInit {
  @Input() width = '18rem'; //indica el ancho del componente, sino se proporciona toma el qyue ya tiene por defecto
  @Input() crsCode: CRSCode = CRSCode.MAGNA;
  // Coordenadas
  lat = '';
  lon = '';

  /**
   * Inyecta los servicios necesarios para obtener el mapa y escuchar los movimientos del cursor.
   * @param viewCoordsService Servicio encargado de transformar y emitir las coordenadas.
   */
  constructor(private viewCoordsService: ViewCoordsService) {}

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente.
   * Se suscribe al evento de movimiento del cursor.
   */
  ngOnInit(): void {
    // Escuchar el movimiento del cursor sobre el mapa
    this.viewCoordsService.listenCursorCoordinates(this.crsCode, coords => {
      // Coordenadas transformadas según el CRS
      this.lon = `${coords.nameX}: ${coords.x}`;
      this.lat = `${coords.nameY}: ${coords.y}`;
    });
  }
  /** Detecta cambios en el código CRS y actualiza la escucha de coordenadas en consecuencia */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['crsCode'] && !changes['crsCode'].firstChange) {
      this.viewCoordsService.listenCursorCoordinates(this.crsCode, coords => {
        // Escuchar el movimiento del cursor sobre el mapa
        // Coordenadas transformadas según el CRS
        this.lon = `${coords.nameX}: ${coords.x}`;
        this.lat = `${coords.nameY}: ${coords.y}`;
      });
    }
  }
}
