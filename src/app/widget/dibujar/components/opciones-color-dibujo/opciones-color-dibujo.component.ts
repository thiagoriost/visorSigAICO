import { Component, OnDestroy, OnInit } from '@angular/core';
import { Input, OnChanges, SimpleChanges } from '@angular/core';
import { DibujarService } from '@app/widget/dibujar/services/dibujar/dibujar.service';
import { CommonModule } from '@angular/common';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { Subscription } from 'rxjs';
import { Medicion } from '@app/widget/medicion/interfaces/medicion.interface';
import { ColorCombination } from '@app/widget/dibujar/interfaces/dibujar.colorCombination';
import { ButtonModule } from 'primeng/button';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ColorPickerChangeEvent } from 'primeng/colorpicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
/**
 * Componente de previsualización para manejar la interacción con herramientas de dibujo y medición.
 * Permite al usuario seleccionar colores, transparencias y unidades de medición,
 * y mostrar resultados de medición de áreas y longitudes.
 *
 * En la versión 2.0
 * AJuste de errores en duplicacion de informacion y presenatcion de componentes Hexadecimal parametrizable
 *
 * @author Carlos Alberto Aristizabal Vargas
 * @collaborator Sergio Mariño Duque
 * @version 2.0
 * @since 2025-07-07
 */

@Component({
  selector: 'app-opciones-color-dibujo',
  standalone: true,
  imports: [
    CommonModule,
    SliderModule,
    FormsModule,
    InputNumberModule,
    ButtonModule,
    ColorPickerModule,
    ToggleSwitchModule,
    SelectModule,
  ],
  templateUrl: './opciones-color-dibujo.component.html',
  styleUrl: './opciones-color-dibujo.component.scss',
})
export class OpcionesColorDibujoComponent
  implements OnInit, OnDestroy, OnChanges
{
  /** Mostrar el valor hexadecimal */
  mostrarCodigoHex = false;

  /** Color de relleno por defecto. */
  fillColor = '#ffffff';

  /** Color de contorno por defecto. */
  strokeColor = '#ffcc33';

  /** Grosor del contorno por defecto. */
  strokeWidth = 2;

  /** Lista de colores disponibles para el contorno. */
  strokeColors: string[] = [
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#00ffff',
  ];

  /** Transparencia por defecto (100% opaco). */
  transparency = 100;

  // Propiedades para la medición

  /** Resultado de la medición de longitud. */
  resultadoLongitud?: string;

  /** Resultado de la medición de área. */
  resultadoArea?: string;

  /** Opciones disponibles para la medición de áreas. */
  medicionArea: Medicion[] = [];

  /** Opciones disponibles para la medición de longitudes. */
  medicionLongitud: Medicion[] = [];

  /** Unidad seleccionada para el cálculo del área. */
  selectedArea?: Medicion;

  /** Unidad seleccionada para el cálculo de la longitud. */
  selectedLongitud?: Medicion;

  /** Indica si se debe mostrar la medición de área en la interfaz. */
  mostrarArea = false;

  /** Indica si se debe mostrar la medición de distancia en la interfaz. */
  mostrarDistancia = false;

  // Variables para controlar la visibilidad de los switches
  mostrarSwitchDistancia = false;
  mostrarSwitchArea = false;

  /** Suscripción al servicio de medición de longitud. */
  private longitudSubscription?: Subscription;

  /** Suscripción al servicio de medición de área. */
  private areaSubscription?: Subscription;

  // Variables para controlar la visibilidad de los resultados
  showLongitud = false;
  showArea = false;

  /**
   * Define el tipo de geometría que se está utilizando.
   * Este valor determina si se deben mostrar las opciones de medición de distancia y/o área.
   * Valores posibles: 'Point', 'LineString', 'Polygon', etc.
   */
  @Input() tipoGeometria = '';

  // Combinaciones predefinidas de colores
  colorCombinations = [
    {
      fillColor: '#f39c12',
      strokeColor: '#8e44ad',
      strokeWidth: 5,
      transparency: 90,
    },
    {
      fillColor: '#3498db',
      strokeColor: '#e74c3c',
      strokeWidth: 3,
      transparency: 87,
    },
    {
      fillColor: '#1abc9c',
      strokeColor: '#e67e22',
      strokeWidth: 8,
      transparency: 96,
    },
    {
      fillColor: '#9b59b6',
      strokeColor: '#34495e',
      strokeWidth: 4,
      transparency: 35,
    },
    {
      fillColor: '#2ecc71',
      strokeColor: '#f39c12',
      strokeWidth: 6,
      transparency: 82,
    },
    {
      fillColor: '#16a085',
      strokeColor: '#2c3e50',
      strokeWidth: 9,
      transparency: 55,
    },
    {
      fillColor: '#f1c40f',
      strokeColor: '#d35400',
      strokeWidth: 7,
      transparency: 92,
    },
    {
      fillColor: '#2980b9',
      strokeColor: '#8e44ad',
      strokeWidth: 2,
      transparency: 10,
    },
    {
      fillColor: '#e74c3c',
      strokeColor: '#16a085',
      strokeWidth: 1,
      transparency: 88,
    },
    {
      fillColor: '#2c3e50',
      strokeColor: '#f39c12',
      strokeWidth: 10,
      transparency: 79,
    },
    {
      fillColor: '#8e44ad',
      strokeColor: '#e74c3c',
      strokeWidth: 6,
      transparency: 65,
    },
    {
      fillColor: '#34495e',
      strokeColor: '#3498db',
      strokeWidth: 3,
      transparency: 91,
    },
    {
      fillColor: '#16a085',
      strokeColor: '#e67e22',
      strokeWidth: 5,
      transparency: 77,
    },
    {
      fillColor: '#f39c12',
      strokeColor: '#8e44ad',
      strokeWidth: 4,
      transparency: 53,
    },
    {
      fillColor: '#1abc9c',
      strokeColor: '#34495e',
      strokeWidth: 6,
      transparency: 50,
    },
    {
      fillColor: '#e74c3c',
      strokeColor: '#f1c40f',
      strokeWidth: 2,
      transparency: 75,
    },
    {
      fillColor: '#9b59b6',
      strokeColor: '#16a085',
      strokeWidth: 8,
      transparency: 89,
    },
    {
      fillColor: '#34495e',
      strokeColor: '#2ecc71',
      strokeWidth: 1,
      transparency: 98,
    },
    {
      fillColor: '#8e44ad',
      strokeColor: '#2980b9',
      strokeWidth: 3,
      transparency: 25,
    },
  ];

  constructor(private dibujarService: DibujarService) {}

  ngOnInit() {
    // Inicialización de las unidades de medición de área
    this.medicionArea = [
      { name: 'Metros Cuadrados', code: 'm2' },
      { name: 'Kilómetros Cuadrados', code: 'km2' },
      { name: 'Héctareas', code: 'ha' },
      { name: 'Millas Cuadradas', code: 'sqmi' },
    ];

    // Inicialización de las unidades de medición de longitud
    this.medicionLongitud = [
      { name: 'Metros', code: 'm' },
      { name: 'Kilómetros', code: 'km' },
      { name: 'Millas', code: 'mi' },
      { name: 'Millas Náuticas', code: 'nmi' },
    ];

    // Selección por defecto para área y longitud
    this.selectedArea = this.medicionArea[1]; // Kilómetros Cuadrados por defecto
    this.selectedLongitud = this.medicionLongitud[1]; // Kilómetros por defecto

    // Suscripciones a los servicios de medición
    this.longitudSubscription = this.dibujarService.longitudSubject.subscribe(
      longitudEnMetros => {
        this.updateLongitudResult(longitudEnMetros);
      }
    );

    this.areaSubscription = this.dibujarService.areaSubject.subscribe(
      areaEnMetrosCuadrados => {
        this.updateAreaResult(areaEnMetrosCuadrados);
      }
    );
  }

  ngOnDestroy() {
    // Asegurarse de que las suscripciones se cancelen para evitar fugas de memoria
    if (this.longitudSubscription) {
      this.longitudSubscription.unsubscribe(); // Liberamos la suscripción a longitud
    }

    if (this.areaSubscription) {
      this.areaSubscription.unsubscribe(); // Liberamos la suscripción a área
    }

    // Eliminar la interacción de dibujo al destruir el componente
    this.dibujarService.removeDrawingInteraction(); // Eliminar la interacción de dibujo

    //elimiar las geometrias del mapa al destruir el componente
    this.dibujarService.clearAllGeometries();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tipoGeometria']) {
      this.actualizarSwitchesPorGeometria();
    }
  }

  /**
   * Limpia los resultados de medición de longitud y área.
   */
  limpiarResultados(): void {
    this.resultadoLongitud = undefined;
    this.resultadoArea = undefined;
  }

  /**
   * Activa la herramienta de medición de área (Polígono).
   */
  selectArea() {
    this.limpiarResultados(); // Limpiar resultados previos
    if (this.selectedArea) {
      this.dibujarService.addInteraction('Polygon'); // Activar la herramienta de polígonos para área
    }
  }

  /**
   * Activa la herramienta de medición de longitud (Línea).
   */
  selectLongitud() {
    this.limpiarResultados(); // Limpiar resultados previos
    this.dibujarService.addInteraction('LineString'); // Activar la herramienta de línea para longitud
  }

  /**
   * Actualiza el resultado de la medición de longitud según la unidad seleccionada.
   */
  public updateLongitudResult(longitudEnMetros: number) {
    if (this.selectedLongitud) {
      let longitudConvertida: number;
      switch (this.selectedLongitud.code) {
        case 'm':
          longitudConvertida = longitudEnMetros;
          break;
        case 'km':
          longitudConvertida = longitudEnMetros / 1000;
          break;
        case 'mi':
          longitudConvertida = longitudEnMetros / 1609.34;
          break;
        case 'nmi':
          longitudConvertida = longitudEnMetros / 1852;
          break;
        default:
          longitudConvertida = longitudEnMetros;
      }

      const texto = `Distancia: ${longitudConvertida.toFixed(2)} ${this.selectedLongitud.name.toLowerCase()}`;
      this.resultadoLongitud = this.mostrarDistancia ? texto : '';

      this.dibujarService.textoLongitud = this.resultadoLongitud || '';
      this.dibujarService.mostrarDistancia = this.mostrarDistancia;
    }
  }

  /**
   * Actualiza el resultado de la medición de área según la unidad seleccionada.
   */
  public updateAreaResult(areaEnMetrosCuadrados: number) {
    if (this.selectedArea) {
      let areaConvertida: number;
      let unidadFormateada: string;

      switch (this.selectedArea.code) {
        case 'm2':
          areaConvertida = areaEnMetrosCuadrados;
          unidadFormateada = 'metros cuadrados';
          break;
        case 'km2':
          areaConvertida = areaEnMetrosCuadrados / 1_000_000;
          unidadFormateada = 'kilómetros cuadrados';
          break;
        case 'ha':
          areaConvertida = areaEnMetrosCuadrados / 10_000;
          unidadFormateada = 'hectáreas';
          break;
        case 'sqmi':
          areaConvertida = areaEnMetrosCuadrados / 2_589_988;
          unidadFormateada = 'millas cuadradas';
          break;
        default:
          areaConvertida = areaEnMetrosCuadrados;
          unidadFormateada = this.selectedArea.name.toLowerCase();
      }

      const texto = `Área: ${areaConvertida.toFixed(2)} ${unidadFormateada}`;
      this.resultadoArea = this.mostrarArea ? texto : '';

      this.dibujarService.textoArea = this.resultadoArea || '';
      this.dibujarService.mostrarArea = this.mostrarArea;
    }
  }

  /**
   * Selección de combinación de colores predefinida
   */
  selectPredefinedCombination(combination: ColorCombination): void {
    this.fillColor = combination.fillColor;
    this.strokeColor = combination.strokeColor;
    this.strokeWidth = combination.strokeWidth;
    this.transparency = combination.transparency;

    // Aplica la transparencia inicial desde la combinación predefinida
    const alpha = this.transparency / 100;
    this.dibujarService.updateFillColor(this.hexToRgba(this.fillColor, alpha));
    this.dibujarService.updateStrokeColor(this.strokeColor); // Asegura que el contorno se actualice también
    this.dibujarService.updateStrokeWidth(this.strokeWidth); // Asegura que el grosor del contorno se mantenga
  }

  /**
   * Maneja el cambio de color de relleno.
   */
  onFillColorChange(event: ColorPickerChangeEvent): void {
    // Asegurarse de que event.value sea un string
    if (typeof event.value === 'string') {
      this.fillColor = event.value;
      this.dibujarService.updateFillColor(this.fillColor);
    } else {
      console.warn('El valor del color no es un string válido:', event.value);
    }
  }

  /**
   * Maneja el cambio de color de contorno.
   */
  onStrokeColorChange(event: ColorPickerChangeEvent): void {
    this.dibujarService.updateStrokeColor(this.strokeColor);
    if (typeof event.value === 'string') {
      this.strokeColor = event.value;
      this.dibujarService.updateFillColor(this.strokeColor);
    } else {
      console.warn('El valor del color no es un string válido:', event.value);
    }
  }

  /**
   * Maneja el cambio en el grosor del contorno.
   */
  onStrokeWidthChange(event: number): void {
    this.strokeWidth = event; // El evento es el valor directamente
    this.dibujarService.updateStrokeWidth(this.strokeWidth);
  }

  /**
   * Maneja el cambio de transparencia en el color de relleno.
   */
  onTransparencyChange(event: number): void {
    // Actualiza el valor de transparencia con el valor recibido
    this.transparency = event;

    // Calcula el alpha (transparencia en formato 0-1)
    const alpha = this.transparency / 100;

    // Convierte el color hexadecimal a RGBA con la nueva transparencia
    const updatedFillColor = this.hexToRgba(this.fillColor, alpha);

    // Envía el nuevo color al servicio para actualizar el color de relleno
    this.dibujarService.updateFillColor(updatedFillColor);
  }

  /**
   *Convierte un color hexadecimal a RGBA con transparencia.
   */
  hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /**
   *Obtiene el color de relleno con transparencia aplicada.
   */
  get fillColorWithTransparency(): string {
    const alpha = this.transparency / 100; // Normaliza la transparencia (0-1)
    return this.hexToRgba(this.fillColor, alpha); // Devuelve el color con la transparencia aplicada
  }
  //Llamar al servicio para deshacer el último dibujo
  deshacerDibujo(): void {
    this.dibujarService.deshacerDibujo();
  }

  //Llamar al servicio para recuperar el último dibujo eliminado
  recuperarDibujo(): void {
    this.dibujarService.recuperarDibujo();
  }

  /**
   * Elimina el dibujo actual.
   */
  eliminarDibujo(): void {
    this.dibujarService.borrarDibujo();
  }

  /**
   * Verifica si hay acciones de dibujo que se pueden deshacer.
   * Este método se usa para habilitar o deshabilitar el botón "Deshacer".
   *
   * @returns true si hay acciones disponibles para deshacer; false en caso contrario.
   */
  puedeDeshacer(): boolean {
    return this.dibujarService.puedeDeshacer();
  }

  /**
   * Verifica si hay acciones de dibujo que se pueden recuperar.
   * Este método se usa para habilitar o deshabilitar el botón "Recuperar".
   *
   * @returns true si hay acciones disponibles para recuperar; false en caso contrario.
   */
  puedeRecuperar(): boolean {
    return this.dibujarService.puedeRecuperar();
  }

  /**
   * Actualiza los switches de visualización de mediciones según el tipo de geometría seleccionada.
   * Activa o desactiva los controles para mostrar mediciones de distancia y/o área.
   */
  actualizarSwitchesPorGeometria(): void {
    switch (this.tipoGeometria) {
      case 'Point':
        this.mostrarSwitchDistancia = false;
        this.mostrarSwitchArea = false;
        break;
      case 'Line':
      case 'LineString':
      case 'LineAlzada':
        this.mostrarSwitchDistancia = true;
        this.mostrarSwitchArea = false;
        break;
      case 'Polygon':
      case 'Circle':
      case 'Extension':
      case 'Triangle':
      case 'HanddrawPolygon':
        this.mostrarSwitchDistancia = true;
        this.mostrarSwitchArea = true;
        break;
      default:
        this.mostrarSwitchDistancia = false;
        this.mostrarSwitchArea = false;
    }
  }
}
