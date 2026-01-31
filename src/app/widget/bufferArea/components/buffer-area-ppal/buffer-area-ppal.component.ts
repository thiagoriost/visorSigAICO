/**
 * Componente principal para la generación de áreas de buffer a partir de coordenadas geográficas o selección manual.
 *
 * Permite al usuario seleccionar el método de ubicación (por coordenadas o por selección en el mapa),
 * definir una distancia y unidad de medida, y generar un área de influencia (buffer) sobre el mapa.
 *
 * Este componente sirve de contenedor y punto de integración para los subcomponentes `BufferAreaComponent` y
 * `UbicarMedianteCoordenadasComponent`. Además, se encarga de validar los datos de entrada y
 * ejecutar la lógica para generar el buffer a través del servicio `BufferAreaCoordenadaService`.
 *
 * Utiliza PrimeNG para los controles de UI como dropdowns, botones y campos numéricos,
 * y está construido con Angular como componente standalone.
 *
 * @author Carlos Alberto Aristizabal Vargas
 * @date 19-06-2025
 * @version 1.0.0
 */

import { AfterContentInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RadioButton } from 'primeng/radiobutton';
import { BufferAreaComponent } from '@app/widget/bufferArea/components/buffer-area/buffer-area.component';
import { BufferAreaLocationComponent } from '@app/widget/bufferArea/components/buffer-area-location/buffer-area-location.component';
import { BufferAreaCoordenadaService } from '@app/widget/bufferArea/services/buffer-area-coordenada.service';
import { LoadingDataMaskWithOverlayComponent } from '@app/shared/components/loading-data-mask-with-overlay/loading-data-mask-with-overlay.component';

@Component({
  selector: 'app-buffer-area-ppal',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    BufferAreaComponent,
    RadioButton,
    BufferAreaLocationComponent,
    LoadingDataMaskWithOverlayComponent,
  ],
  templateUrl: './buffer-area-ppal.component.html',
  styleUrl: './buffer-area-ppal.component.scss',
})
export class BufferAreaPpalComponent implements AfterContentInit {
  /**
   * Constructor que inyecta el servicio responsable de generar el buffer desde coordenadas.
   * @param bufferAreaCoordenadaService Servicio para el manejo del buffer por coordenadas.
   */
  constructor(
    private bufferAreaCoordenadaService: BufferAreaCoordenadaService
  ) {}
  ngAfterContentInit(): void {
    this.metodoSeleccionado = this.metodosUbicacion[1];
  }

  // Indica si el se esta procesando el buffer
  isLoading = false;

  /**
   * Método seleccionado por el usuario para ubicar el punto de origen del buffer.
   * Puede ser 'coordenadas' o 'seleccion'.
   */
  metodoSeleccionado: {
    label: string;
    value: 'coordenadas' | 'seleccion';
  } | null = null;

  /**
   * Métodos disponibles para ubicar el buffer en el mapa.
   */
  metodosUbicacion: {
    label: string;
    value: 'coordenadas' | 'seleccion';
  }[] = [
    { label: 'Ubicar por coordenadas', value: 'coordenadas' },
    { label: 'Ubicar por selección espacial', value: 'seleccion' },
  ];

  /**
   * @description Setea el estado de carga
   * @param loading boolean
   */
  setLoading(loading: boolean) {
    this.isLoading = loading;
  }
}
