import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { GeoConsultasService } from '@app/shared/services/geoConsultas/geo-consultas.service';
import { WorkareaDropdownSelectComponent } from '@app/shared/components/workarea-dropdown-select/workarea-dropdown-select.component';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { Subscription } from 'rxjs';
import { LoadingDataMaskWithOverlayComponent } from '@app/shared/components/loading-data-mask-with-overlay/loading-data-mask-with-overlay.component';
import { MessageService, ScrollerOptions } from 'primeng/api';
import { Select, SelectModule } from 'primeng/select';
import { ScrollerLazyLoadEvent } from 'primeng/scroller';
import { FloatLabel } from 'primeng/floatlabel';

/**
 * Componente encargado de consultar las capas seleccionadas
 * desde la tabla de contenido. Permite, a través de menús
 * desplegables (dropdowns), seleccionar una capa, elegir uno
 * de sus atributos, obtener los valores únicos asociados a
 * dicho atributo y emitirlos para que puedan ser utilizados
 * por otros componentes.
 *
 * @author Carlos Alberto Aristizabal Vargas y Heidy Paola Lopez Sanchez
 */

@Component({
  selector: 'app-consulta-capas',
  standalone: true,
  imports: [
    FormsModule,
    SelectModule,
    ButtonModule,
    CommonModule,
    ReactiveFormsModule,
    WorkareaDropdownSelectComponent,
    LoadingDataMaskWithOverlayComponent,
    Select,
    FloatLabel,
  ],
  templateUrl: './consulta-capas.component.html',
  styleUrl: './consulta-capas.component.scss',
})
export class ConsultaCapasComponent implements OnInit, OnDestroy {
  capaSeleccionada: CapaMapa | undefined;
  // Emisores de eventos para comunicar con el componente padre
  @Output() capaActualizada = new EventEmitter<{
    label: string;
    value: string;
    name: string;
    urlServicioWFS: string;
  }>();
  @Output() atributoActualizado = new EventEmitter<{
    name: string;
    value: string;
  }>();
  @Output() valorActualizado = new EventEmitter<{
    name: string;
    value: string;
  }>();
  @Output() tipoConsultaSeleccionada = new EventEmitter<
    'simple' | 'avanzada'
  >();

  // Datos para las capas y atributos seleccionados
  currentLayerStore: LayerStore[] = [];
  capasDropdowm: { label: string; value: string; name: string }[] = [];
  attributeValues: { name: string; value: string }[] = [];
  attributeValueOptions: { name: string; value: string }[] = [];

  // Variables de selección (Layer, Atributo, Valor)
  selectedLayer:
    | { label: string; value: string; name: string; urlServicioWFS: string }
    | undefined = undefined;
  selectedAttribute: { name: string; value: string } | null = null;
  selectedValue: { name: string; value: string } | null = null;

  // Mensaje de error en caso de no encontrar atributos o valores
  mensajeSinAtributos = '';
  atributosDisponibles = false;
  valoresDisponibles = false;
  // Colección de suscripciones para limpiarlas en ngOnDestroy
  private subscriptions = new Subscription();
  formConsulta: FormGroup;

  //loading para las consultas
  loaderContenidoEsVisible = false;

  // Opciones del Virtual Scroll Lazy
  options: ScrollerOptions = {
    delay: 250,
    showLoader: true,
    lazy: true,
    onLazyLoad: (event: ScrollerLazyLoadEvent) => this.onLazyLoad(event),
  };
  loadLazyTimeout: ReturnType<typeof setTimeout> | undefined;
  constructor(
    private fb: FormBuilder, // Utilidad para construir formularios reactivos
    private GeoConsultasService: GeoConsultasService, // Servicio personalizado para consultas WFS
    private messageService: MessageService // Servicio para mostrar mensajes de notificación
  ) {
    // Inicialización del formulario reactivo con tres controles:
    this.formConsulta = this.fb.group({
      // Control para la capa seleccionada, obligatorio
      selectedLayer: [null, Validators.required],

      // Control para el atributo seleccionado, obligatorio
      selectedAttribute: new FormControl<{
        name: string;
        value: string;
      } | null>(null, Validators.required),

      // Control para el valor seleccionado, obligatorio
      selectedValue: new FormControl<{ name: string; value: string } | null>(
        null,
        Validators.required
      ),
    });
  }

  ngOnInit(): void {
    // Al inicializar el componente, se suscribe a los cambios en el control 'selectedLayer'
    this.formConsulta
      .get('selectedLayer')
      ?.valueChanges.subscribe(layerSeleccionada => {
        if (layerSeleccionada) {
          this.procesarSeleccion(layerSeleccionada);
        }
      });
  }

  ngOnDestroy(): void {
    // Limpieza de suscripciones al destruir el componente para evitar fugas de memoria
    this.subscriptions.unsubscribe();
  }

  /**
   * Método para guardar las capas recibidas.
   * @param layers Lista de capas (LayerStore[]) que se almacena en `currentLayerStore`.
   */
  guardarLayerStore(layers: LayerStore[]): void {
    this.currentLayerStore = layers;
  }

  /**
   * Procesa la selección de una capa, obtiene los atributos y emite los eventos correspondientes.
   * @param event Contiene la capa seleccionada por el usuario.
   */
  procesarSeleccion(selectedCapa: CapaMapa): void {
    this.loaderContenidoEsVisible = true; // Mostrar el loader al iniciar la consulta
    this.capaSeleccionada = selectedCapa;
    console.log('Procesando selección de capa:', selectedCapa);
    // Resetear las variables relacionadas con los atributos y valores
    this.atributosDisponibles = true;
    this.attributeValues = [];
    this.selectedAttribute = null;
    this.selectedValue = null;
    this.atributosDisponibles = false;
    this.attributeValueOptions = [];

    // Verificar si la capa tiene un servicio WFS válido
    if (!selectedCapa.urlServicioWFS) {
      // Manejo de errores al obtener los atributos
      this.messageService.add({
        severity: 'error',
        summary: 'Procesamiento Atributos',
        detail: 'La capa no tiene servicio WFS definido.',
        sticky: true,
      });
      this.atributosDisponibles = false;
      this.loaderContenidoEsVisible = false; // Ocultar el loader al finalizar la consulta
      return;
    }

    // Asignar la capa seleccionada a la variable `selectedLayer`
    this.selectedLayer = {
      label: selectedCapa.titulo,
      value: selectedCapa.id,
      name: selectedCapa.nombre ?? '',
      urlServicioWFS: selectedCapa.urlServicioWFS || '',
    };

    // Emitir el evento con la información de la capa seleccionada
    this.capaActualizada.emit({
      label: selectedCapa.titulo,
      value: selectedCapa.id,
      name: selectedCapa.nombre ?? '',
      urlServicioWFS: selectedCapa.urlServicioWFS || '',
    });
    // Obtener los atributos disponibles para la capa seleccionada
    this.GeoConsultasService.obtenerAtributosCapa(
      selectedCapa.urlServicioWFS,
      selectedCapa.nombre ?? ''
    )
      .then(xml => {
        // Parsear y procesar los atributos de la capa
        const atributos = this.GeoConsultasService.parseLayerAttributes(xml);
        this.attributeValues =
          atributos.length > 0
            ? atributos.map(attr => ({ name: attr.name, value: attr.name }))
            : [];

        console.log('Atributos obtenidos:', this.attributeValues);

        // Si no hay atributos disponibles, mostrar mensaje de error
        if (atributos.length === 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Procesamiento Atributos',
            detail: 'La capa no tiene atributos a consultar.',
            sticky: true,
          });
        }
        this.atributosDisponibles = false;
        this.loaderContenidoEsVisible = false; // Ocultar el loader al finalizar la consulta
      })
      .catch(() => {
        // Manejo de errores al obtener los atributos
        this.messageService.add({
          severity: 'error',
          summary: 'Procesamiento Atributos',
          detail: 'Error al obtener los atributos del servidor',
          sticky: true,
        });

        this.atributosDisponibles = false;
      });
  }

  /**
   * Consulta los valores del atributo seleccionado.
   * Este método se ejecuta cuando se selecciona un atributo en el menú desplegable.
   */
  onAttributeChange(): void {
    this.loaderContenidoEsVisible = true; // Mostrar el loader al iniciar la consulta
    // Resetear el valor seleccionado y las opciones de valores
    this.valoresDisponibles = true;
    this.selectedValue = null;
    this.attributeValueOptions = [];

    // Obtener el atributo seleccionado desde el formulario
    this.selectedAttribute = this.formConsulta.get('selectedAttribute')?.value;

    const capa = this.selectedLayer?.value;

    const atributo = this.selectedAttribute?.name;

    // Verificar que tanto `selectedLayer` como `selectedAttribute` no sean null
    if (capa && atributo) {
      const urlServicioWFS = this.capaSeleccionada?.urlServicioWFS;

      // Verificar si `urlServicioWFS` es válido
      if (!urlServicioWFS) {
        // Manejo de errores al obtener los atributos
        this.messageService.add({
          severity: 'error',
          summary: 'Procesamiento Atributos',
          detail: 'La capa no tiene servicio WFS definido.',
          sticky: true,
        });
        this.valoresDisponibles = false;
        this.loaderContenidoEsVisible = false; // Ocultar el loader al finalizar la consulta
        return;
      }

      this.GeoConsultasService.obtenerValoresAtributo(
        urlServicioWFS,
        this.capaSeleccionada?.nombre ?? '',
        atributo
      )
        .then(xml => {
          // Parsear y procesar los valores del atributo
          const valores = this.GeoConsultasService.parseAttributeValues(
            xml,
            atributo
          );
          // Si se encuentran valores, asignarlos y emitir el valor actualizado
          if (valores.length > 0) {
            this.attributeValueOptions = valores.map(val => ({
              name: val,
              value: val,
            }));
            this.valoresDisponibles = false;
          } else {
            // Si no se encuentran valores, mostrar mensaje de error
            // Manejo de errores al obtener los atributos
            this.messageService.add({
              severity: 'error',
              summary: 'Procesamiento Valores',
              detail:
                'No se encontraron valores para el atributo seleccionado.',
              sticky: true,
            });

            this.valoresDisponibles = false;
          }
          this.loaderContenidoEsVisible = false; // Ocultar el loader al finalizar la consulta
        })
        .catch(() => {
          // Manejo de errores al obtener los valores del atributo
          this.messageService.add({
            severity: 'error',
            summary: 'Procesamiento Valores',
            detail: 'Error al obtener valores del atributo.',
            sticky: true,
          });
          this.valoresDisponibles = false;
          this.loaderContenidoEsVisible = false; // Ocultar el loader al finalizar la consulta
        });
    } else {
      this.valoresDisponibles = false;
      this.loaderContenidoEsVisible = false; // Ocultar el loader al finalizar la consulta
    }

    // Emitir el atributo actualizado (si ya se ha seleccionado uno)
    if (this.selectedAttribute) {
      this.atributoActualizado.emit(this.selectedAttribute);
    }
  }

  /**
   * Maneja la selección de un valor dentro del formulario.
   *
   * Este método se llama cuando el usuario selecciona un valor desde el campo correspondiente
   * en el formulario. Obtiene el valor seleccionado desde el formulario reactivo y, si existe,
   * emite un evento con la información del valor.
   */
  onValueSelect(): void {
    // Obtener el valor seleccionado desde el formulario
    this.selectedValue = this.formConsulta.get('selectedValue')?.value;
    // Verificar si se seleccionó un valor válido
    if (this.selectedValue) {
      // Emitir el valor actualizado a través del EventEmitter correspondiente
      this.valorActualizado.emit(this.selectedValue);
    }
  }

  /**
   * Limpia todos los campos del formulario de consulta, así como las variables de selección actuales,
   * listas de atributos y valores, mensajes de error y banderas de estado.
   * También emite eventos hacia el componente padre para notificar que se han reiniciado las selecciones.
   */
  onLimpiarCampos(): void {
    // Resetear el formulario y las variables de selección
    this.formConsulta.reset();
    //Resetea la capa actual seleccionada
    this.selectedLayer = undefined;
    // Resetea el atributo seleccionado
    this.selectedAttribute = null;
    // Resetea el valor seleccionado
    this.selectedValue = null;
    // Limpiar las listas de atributos
    this.attributeValues = [];
    // Limpiar la lista de valores
    this.attributeValueOptions = [];
    // Limpiar mensajes de error
    this.mensajeSinAtributos = '';
    // Desactivar las banderas de atributos y valores disponibles
    this.atributosDisponibles = false;
    this.valoresDisponibles = false;

    // Emitir eventos para limpiar las selecciones en el componente padre
    this.capaActualizada.emit(undefined);
    this.atributoActualizado.emit(undefined);
    this.valorActualizado.emit(undefined);
  }

  /**
   * Valida visualmente todos los campos del formulario.
   * Marca cada campo como "tocado" para que se muestren los mensajes de error asociados,
   * en caso de que haya campos requeridos o inválidos sin completar.
   */
  onvalidarCampos() {
    const form = this.formConsulta;

    // Recorre todos los controles del formulario y los marca como "touched"
    Object.values(form.controls).forEach(control => control.markAsTouched());
  }

  /**
   * Maneja el evento de lazy load del Virtual Scroll.
   * Carga dinámicamente bloques de valores para el dropdown de valores del atributo.
   *
   * @param event Contiene la información de rango visible (first y last) que solicita el dropdown.
   */
  onLazyLoad(event: ScrollerLazyLoadEvent): void {
    // Activa la bandera de "cargando valores" para mostrar el loader en el dropdown
    this.valoresDisponibles = true;

    // Limpia cualquier timeout anterior para evitar solapamientos de carga
    if (this.loadLazyTimeout) {
      clearTimeout(this.loadLazyTimeout);
    }

    // Simula un retardo típico de backend
    this.loadLazyTimeout = setTimeout(
      () => {
        const { first = 0, last = 0 } = event;

        // 👉 Si la lista total de valores está vacía, no cargar nada
        if (this.attributeValueOptions.length === 0) {
          // Finaliza la bandera de carga y sale sin agregar elementos
          this.valoresDisponibles = false;
          return;
        }

        // Copia el estado actual de los valores cargados
        const items = [...this.attributeValueOptions];

        // Asegura que el rango no exceda el tamaño de la lista
        const safeLast = Math.min(last, this.attributeValueOptions.length);

        // Define el tamaño del lote por carga
        const batchSize = 100;
        const end = Math.min(first + batchSize, safeLast);

        // Carga sólo el bloque de elementos en el rango solicitado
        for (let i = first; i < end; i++) {
          if (!items[i]) {
            items[i] = this.attributeValueOptions[i];
          }
        }

        // Actualiza las opciones visibles
        this.attributeValueOptions = items;

        // Finaliza la bandera de carga
        this.valoresDisponibles = false;
      },
      Math.random() * 500 + 250
    );
  }
}
