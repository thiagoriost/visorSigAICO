/**
 * Componente para generar un área de buffer a partir de una capa geoespacial seleccionada por el usuario.
 *
 * Permite seleccionar una capa del mapa, definir una distancia y unidad, y ejecutar una operación
 * de selección espacial con buffer. El resultado se muestra en la tabla de atributos.
 *
 * Utiliza OpenLayers para la interacción con el mapa y realiza peticiones WFS a través del servicio BufferAreaService.
 *
 * @author Carlos Alberto Aristizabal Vargas
 * @date 19-05-2025
 * @version 1.0.0
 */

import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { FloatLabel } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { MapActions } from '@app/core/store/map/map.actions';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { BufferAreaService } from '@app/widget/bufferArea/services/buffer-area.service';
import { AttributeTableData } from '@app/widget/attributeTable/interfaces/geojsonInterface';
import { WorkareaDropdownSelectComponent } from '@app/shared/components/workarea-dropdown-select/workarea-dropdown-select.component';

@Component({
  selector: 'app-buffer-area',
  standalone: true,
  imports: [
    FormsModule,
    SelectModule,
    ButtonModule,
    CommonModule,
    InputNumberModule,
    MessageModule,
    WorkareaDropdownSelectComponent,
    ReactiveFormsModule,
    FloatLabel,
  ],
  providers: [MessageService],
  templateUrl: './buffer-area.component.html',
  styleUrl: './buffer-area.component.scss',
})
export class BufferAreaComponent implements OnDestroy {
  //Emisor de estado de procesamiento
  @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Lista de unidades de distancia disponibles para el buffer. */
  unidadDistancia = [
    { name: 'Metros', code: 'm' },
    { name: 'Kilómetros', code: 'km' },
    { name: 'Millas', code: 'mi' },
    { name: 'Millas Náuticas', code: 'nmi' },
  ];

  /** Indica si la operación está en curso. */
  isLoading = false;
  filtroServicio = 'wfs'; //variable para filtrar capas de tipo WFS
  // Formulario
  formBufferSelection: FormGroup = new FormGroup({
    layer: new FormControl(null, [Validators.required]),
    distance: new FormControl(null, [Validators.required]),
    unit: new FormControl(null, [Validators.required]),
    geometriaSeleccionada: new FormControl(null, [Validators.required]),
  });

  constructor(
    private store: Store,
    private bufferService: BufferAreaService,
    private userInterfaceService: UserInterfaceService,
    private messageService: MessageService
  ) {}

  /**
   * Destruye las suscripciones activas al destruir el componente.
   */
  ngOnDestroy(): void {
    this.limpiar();
  }

  /**
   * Limpia el formulario, las selecciones y el resultado de la tabla de atributos.
   */
  limpiar(): void {
    this.bufferService.limpiarDibujoBuffer();
    this.formBufferSelection.get('geometriaSeleccionada')?.setValue(null);
  }

  /**
   * Convierte una distancia de una unidad a metros.
   *
   * @param distancia Valor de la distancia.
   * @param unidadDistancia Unidad de la distancia.
   * @returns Distancia convertida en metros.
   */
  public convertirDistancia(
    distancia: number,
    unidadDistancia: string
  ): number {
    switch (unidadDistancia) {
      case 'km':
        return distancia * 1000; // Convertir kilómetros a metros
      case 'm':
        return distancia; // Ya está en metros, no hace falta conversión
      case 'mi':
        return distancia * 1609.34; // Convertir millas a metros
      case 'nmi':
        return distancia * 1852; // Convertir millas náuticas a metros
      default:
        console.warn(
          `Unidad de distancia no reconocida: ${unidadDistancia}, se usa valor sin convertir.`
        );
        return distancia;
    }
  }

  /**
   * Retorna un mensaje de error personalizado según el contenido del error.
   * @param error Error capturado
   * @returns Mensaje amigable para el usuario
   */
  public getErrorMessage(error: Error): string {
    const mensaje = error.message || '';

    if (
      mensaje.includes('Failed to fetch') ||
      mensaje.includes('NetworkError')
    ) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión a Internet o intenta más tarde.';
    }

    if (mensaje.includes('NullPointerException')) {
      return 'Ocurrió un problema al procesar la geometría. Verifica que los datos sean válidos.';
    }

    if (mensaje.includes('400') || mensaje.includes('Bad Request')) {
      return 'La solicitud no es válida. Verifica los datos ingresados.';
    }

    if (mensaje.includes('500') || mensaje.includes('Internal Server Error')) {
      return 'El servidor encontró un error inesperado. Intenta nuevamente más tarde.';
    }

    return 'Ocurrió un error al procesar la solicitud. Intenta nuevamente.';
  }

  /**
   * @description Gestiona el evento submit del formulario - valida e inicia generación del buffer
   * @returns void
   */
  async onSubmit() {
    // Verificar si el formulario es invalido y mostrar errores
    if (this.formBufferSelection.invalid) {
      this.formBufferSelection.markAllAsTouched();
      // Recorrer todos los controles del formulario y marcarlos como dirty, adicionando clase ng-dirty
      Object.values(this.formBufferSelection.controls).forEach(control => {
        control.markAsDirty();
      });
      return;
    }
    // Activar estado de carga (spinner o similar)
    this.isLoading = true;
    this.loading.emit(this.isLoading);
    this.generarBuffer();
  }

  /**
   * @description Procesa datos crudos de respuesta de buffer y los pasa a la tabla de atributos
   * @param datos Datos crudos
   * @returns void
   */
  private processBufferResponse(datos: AttributeTableData[]): void {
    // Combinar todos los resultados en uno solo para la tabla de atributos
    const datosCombinados: AttributeTableData = {
      titulo: 'Área de influencia (Buffer)',
      geojson: {
        type: 'FeatureCollection',
        features: datos.flatMap(d => d.geojson.features),
      },
      visible: true,
    };
    // Despachar acción para cargar datos combinados en la tabla
    this.store.dispatch(
      MapActions.setWidgetAttributeTableData({
        widgetId: 'tabla-atributos',
        data: datosCombinados,
      })
    );
    // Forzar cierre de la tabla
    //TODO: Revisar con Carlos Javier este comportamiento
    this.userInterfaceService.cambiarVisibleWidget('attributeTable', false);
    // Mostrar la tabla de atributos
    setTimeout(() => {
      this.userInterfaceService.cambiarVisibleWidget('attributeTable', true);
    }, 500);
  }

  async seleccionarAreaBuffer() {
    try {
      const geometriaSeleccionada =
        await this.bufferService.iniciarDibujoBuffer();
      // adicionar geometria a FormControl
      this.formBufferSelection
        .get('geometriaSeleccionada')
        ?.setValue(geometriaSeleccionada);
    } catch (error) {
      console.error('Error al seleccionar área de buffer:', error);
    } finally {
      this.isLoading = false;
      this.loading.emit(this.isLoading);
    }
  }

  async generarBuffer() {
    try {
      const formValue = this.formBufferSelection.value;
      const distanciaMetros = this.convertirDistancia(
        formValue.distance,
        formValue.unit
      );

      const resultados = await this.bufferService.generarBufferDesdeGeometria(
        formValue.geometriaSeleccionada,
        formValue.layer.nombre,
        formValue.layer.urlServicioWFS,
        distanciaMetros
      );

      this.processBufferResponse(resultados);
      // Limpiar seleccion de geometria
      this.limpiar();
    } catch (error) {
      console.error('Error al generar buffer:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error en generación',
        detail: this.getErrorMessage(error as Error),
        sticky: true,
      });
    } finally {
      setTimeout(() => {
        this.isLoading = false;
        this.loading.emit(this.isLoading);
      }, 1500);
    }
  }
}
