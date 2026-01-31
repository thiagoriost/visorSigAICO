import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MedicionService } from '@app/widget/medicion/services/medicion.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Medicion } from '@app/widget/medicion/interfaces/medicion.interface';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Componente principal para la medición de áreas y longitudes.
 *
 * Permite la selección de unidades de medida para áreas y longitudes, realiza conversiones de unidades
 * y muestra el resultado de la medición calculado.
 *
 * @author Carlos Alberto Aristizabal Vargas
 * @date 26-12-2024
 * @version 1.0.2
 */

/**
 * Componente para realizar mediciones de áreas y longitudes en diferentes unidades.
 */
@Component({
  selector: 'app-medicion-ppal',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule,
    FormsModule,
    CardModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
  ],
  templateUrl: './medicion-ppal.component.html',
  styleUrls: ['./medicion-ppal.component.scss'],
  providers: [],
})
export class MedicionPpalComponent implements OnInit, OnDestroy {
  /**
   * Resultado de la medición calculada.
   * @type {string | undefined}
   */
  resultado: string | undefined;

  /**
   * Modo de medición actualmente activo.
   * Puede ser 'area' o 'longitud'.
   * @type {'area' | 'longitud'}
   */
  modoActivo: 'area' | 'longitud' | null = null;

  /**
   * Último valor de área medido en metros cuadrados.
   * @private
   * @type {number | null}
   */
  private lastAreaEnM2: number | null = null;

  /**
   * Último valor de longitud medido en metros.
   * @private
   * @type {number | null}
   */
  private lastLongitudEnM: number | null = null;

  /**
   * Lista de unidades de medida para área.
   * @type {Medicion[]}
   */
  medicionArea: Medicion[] = [];

  /**
   * Lista de unidades de medida para longitud.
   * @type {Medicion[]}
   */
  medicionLongitud: Medicion[] = [];

  /**
   * Unidad de medida seleccionada para área.
   * @type {Medicion | undefined}
   */
  selectedArea: Medicion | undefined;

  /**
   * Unidad de medida seleccionada para longitud.
   * @type {Medicion | undefined}
   */
  selectedLongitud: Medicion | undefined;

  /**
   * Subject para manejar la destrucción de suscripciones.
   * @private
   * @type {Subject<void>}
   */
  public destroy$ = new Subject<void>();

  /**
   * Servicio para realizar las mediciones.
   * @type {MedicionService}
   */
  mapService: MedicionService;

  /**
   * Constructor que inyecta el servicio de medición.
   * @param {MedicionService} medicionService - Servicio para manejar las mediciones.
   */
  constructor(private medicionService: MedicionService) {
    this.mapService = medicionService;
  }

  /**
   * Inicializa el componente, define las unidades de medida por defecto y se suscribe a los resultados.
   */
  ngOnInit() {
    this.medicionArea = [
      { name: 'Metros Cuadrados', code: 'm2' },
      { name: 'Kilómetros Cuadrados', code: 'km2' },
      { name: 'Héctareas', code: 'ha' },
      { name: 'Millas Cuadradas', code: 'sqmi' },
    ];

    this.medicionLongitud = [
      { name: 'Metros', code: 'm' },
      { name: 'Kilómetros', code: 'km' },
      { name: 'Millas', code: 'mi' },
      { name: 'Millas Náuticas', code: 'nmi' },
    ];

    this.selectedArea = this.selectedArea || this.medicionArea[1]; // Kilómetros Cuadrados por defecto
    this.selectedLongitud = this.selectedLongitud || this.medicionLongitud[1]; // Kilómetros por defecto

    // Suscripción a los resultados calculados por el servicio
    this.medicionService.longitudSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe(longitudEnMetros =>
        this.updateLongitudResult(longitudEnMetros)
      );

    this.medicionService.areaSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe(areaEnMetrosCuadrados =>
        this.updateAreaResult(areaEnMetrosCuadrados)
      );
  }

  /**
   * Limpia las suscripciones cuando el componente es destruido.
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.medicionService.limpiarMedicion();
  }

  /**
   * Llama al servicio para seleccionar un área.
   * Cambia el modo activo a 'area' y desactiva la interacción de longitud.
   */
  selectArea() {
    if (this.modoActivo === 'area') {
      // Si ya está activo, al hacer clic se desactiva
      this.limpiezaGeometria();
    } else {
      // Si no está activo, se activa modo 'area'
      this.modoActivo = 'area';
      this.medicionService.removeInteractions();
      this.medicionService.limpiarMedicion();
      this.medicionService.addInteraction('Polygon');
    }
  }

  /**
   * Llama al servicio para seleccionar una longitud.
   * Cambia el modo activo a 'longitud' y desactiva la interacción de área.
   */
  selectLongitud() {
    if (this.modoActivo === 'longitud') {
      // Si ya está activo, al hacer clic se desactiva
      this.limpiezaGeometria();
    } else {
      // Si no está activo, se activa modo 'longitud'
      this.modoActivo = 'longitud';
      this.medicionService.removeInteractions();
      this.medicionService.limpiarMedicion();
      this.medicionService.addInteraction('LineString');
    }
  }

  /**
   * Actualiza el resultado de la medición de longitud.
   * @param {number} longitudEnMetros - Longitud en metros.
   */
  updateLongitudResult(longitudEnMetros: number) {
    this.lastLongitudEnM = longitudEnMetros;
    if (this.selectedLongitud) {
      const longitudConvertida = this.convertirLongitud(
        longitudEnMetros,
        this.selectedLongitud.code
      );
      const unidadLongitud =
        this.medicionLongitud.find(
          unit => unit.code === this.selectedLongitud?.code
        )?.name || '';
      this.resultado = `${longitudConvertida.toFixed(2)} ${unidadLongitud}`;
    }
  }

  /**
   * Actualiza el resultado de la medición de área.
   * @param {number} areaEnMetrosCuadrados - Área en metros cuadrados.
   */
  updateAreaResult(areaEnMetrosCuadrados: number) {
    this.lastAreaEnM2 = areaEnMetrosCuadrados;
    if (this.selectedArea) {
      const { areaConvertida } = this.convertirArea(
        areaEnMetrosCuadrados,
        this.selectedArea.code
      );
      const unidadArea =
        this.medicionArea.find(unit => unit.code === this.selectedArea?.code)
          ?.name || '';
      this.resultado = `${areaConvertida.toFixed(2)} ${unidadArea}`;
    }
  }

  /**
   * Convierte una longitud en metros a otra unidad.
   * @param {number} longitudEnMetros - Longitud en metros.
   * @param {string} unidad - Unidad a la que se desea convertir la longitud.
   * @returns {number} La longitud convertida.
   */
  private convertirLongitud(longitudEnMetros: number, unidad: string): number {
    switch (unidad) {
      case 'm':
        return longitudEnMetros;
      case 'km':
        return longitudEnMetros / 1000;
      case 'mi':
        return longitudEnMetros / 1609.34;
      case 'nmi':
        return longitudEnMetros / 1852;
      default:
        return longitudEnMetros;
    }
  }

  /**
   * Convierte un área en metros cuadrados a otra unidad.
   * @param {number} areaEnMetrosCuadrados - Área en metros cuadrados.
   * @param {string} unidad - Unidad a la que se desea convertir el área.
   * @returns {{ areaConvertida: number, unidadFormateada: string }} Área convertida y su unidad formateada.
   */
  private convertirArea(
    areaEnMetrosCuadrados: number,
    unidad: string
  ): { areaConvertida: number; unidadFormateada: string } {
    let areaConvertida: number;
    let unidadFormateada: string;
    switch (unidad) {
      case 'm2':
        areaConvertida = areaEnMetrosCuadrados;
        unidadFormateada = 'm²';
        break;
      case 'km2':
        areaConvertida = areaEnMetrosCuadrados / 1_000_000;
        unidadFormateada = 'km²';
        break;
      case 'ha':
        areaConvertida = areaEnMetrosCuadrados / 10_000;
        unidadFormateada = 'ha';
        break;
      case 'sqmi':
        areaConvertida = areaEnMetrosCuadrados / 2_589_988;
        unidadFormateada = 'sq mi';
        break;
      default:
        areaConvertida = areaEnMetrosCuadrados;
        unidadFormateada = 'm²';
        break;
    }
    return { areaConvertida, unidadFormateada };
  }

  /**
   * Limpia las geometrías y el estado actual de la medición en el mapa.
   */
  limpiezaGeometria() {
    this.medicionService.limpiarMedicion();
    this.modoActivo = null;
    this.resultado = '';
  }

  /**
   * Recalcula el resultado de la medición según el modo actual y
   * los valores guardados en lastAreaEnM2 y lastLongitudEnM.
   */
  recalcularResultado() {
    if (this.modoActivo === 'area' && this.lastAreaEnM2 !== null) {
      this.updateAreaResult(this.lastAreaEnM2);
    }

    if (this.modoActivo === 'longitud' && this.lastLongitudEnM !== null) {
      this.updateLongitudResult(this.lastLongitudEnM);
    }
  }
}
