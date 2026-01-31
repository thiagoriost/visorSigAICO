import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { WorkareaDropdownSelectComponent } from '@app/shared/components/workarea-dropdown-select/workarea-dropdown-select.component';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClientJsonpModule } from '@angular/common/http';
import { IntersectionRestService } from '../../services/intersection-rest.service';
import { IntersectionServiceService } from '../../services/intersection-service.service';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { CommonModule } from '@angular/common';
import { LoadingDataMaskWithOverlayComponent } from '@app/shared/components/loading-data-mask-with-overlay/loading-data-mask-with-overlay.component';
import { MessageModule } from 'primeng/message';
import { Subscription } from 'rxjs';

/**
 * Componente principal encargado de gestionar la interfaz de usuario para realizar intersecciones espaciales entre capas.
 *
 * Funcionalidades clave:
 * - Renderiza un formulario reactivo para la selección de capas base, destino y nombre de la capa resultante.
 * - Permite al usuario seleccionar un área espacial (bounding box) sobre el mapa.
 * - Llama a los servicios necesarios para realizar la operación de intersección.
 * - Gestiona el feedback visual: loaders, mensajes de error, y mensajes de éxito.
 *
 * Este componente es el punto de entrada para que el usuario configure y dispare una operación de intersección espacial.
 *
 * @date 2025-06-16
 * @author Sergio Alonso Mariño Duque y Heidy Paola Lopez Sanchez
 */

@Component({
  selector: 'app-interseccion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    WorkareaDropdownSelectComponent,
    ToastModule,
    HttpClientJsonpModule,
    CommonModule,
    LoadingDataMaskWithOverlayComponent,
    MessageModule,
  ],
  providers: [MessageService],
  templateUrl: './interseccion.component.html',
  styleUrl: './interseccion.component.scss',
})
export class InterseccionComponent implements OnInit, OnDestroy {
  // Formulario reactivo para seleccionar capas y nombre de salida
  interseccionForm!: FormGroup;

  // Controla la visibilidad del loader durante la ejecución
  loaderContenidoEsVisible = false;

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private intersectionRestService: IntersectionRestService,
    private intersectionServiceService: IntersectionServiceService,
    private messageService: MessageService
  ) {}

  /**
   * Inicializa el formulario reactivo al cargar el componente.
   * Configura las validaciones necesarias y gestiona la validación cruzada
   * para evitar que se seleccione la misma capa como base y destino.
   */
  ngOnInit(): void {
    // Inicializa el formulario con los campos requeridos y sus respectivas validaciones
    this.interseccionForm = this.fb.group({
      layerBase: [
        null,
        [Validators.required, this.capaNoIgualA('layerDestino')],
      ], // No puede ser igual a layerDestino
      layerDestino: [
        null,
        [Validators.required, this.capaNoIgualA('layerBase')],
      ], // No puede ser igual a layerBase
      outputLayerName: ['', Validators.required], // Nombre de la capa resultante (obligatorio)
      areaSeleccion: [null, Validators.required], // Área de selección (obligatoria)
    });
    // Validación cruzada: al cambiar layerBase, se fuerza revalidación de layerDestino
    this.subscriptions.add(
      this.interseccionForm.get('layerBase')?.valueChanges.subscribe(() => {
        if (this.interseccionForm.get('layerDestino')?.value) {
          this.interseccionForm
            .get('layerDestino')
            ?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
      })
    );
    // Validación cruzada: al cambiar layerDestino, se fuerza revalidación de layerBase
    this.subscriptions.add(
      this.interseccionForm.get('layerDestino')?.valueChanges.subscribe(() => {
        if (this.interseccionForm.get('layerBase')?.value) {
          this.interseccionForm
            .get('layerBase')
            ?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
      })
    );
  }

  /**
   * Validador personalizado que asegura que `control` y `controlNameToCompare`
   * no hagan referencia a la misma capa geográfica (es decir, que sus IDs sean diferentes).
   *
   * @param controlNameToCompare Nombre del control con el que se va a comparar.
   * @returns Una función validadora que devuelve un error si ambas capas son iguales.
   */
  capaNoIgualA(controlNameToCompare: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // Si no existe el formulario padre, no se puede comparar → sin error
      if (!control.parent) return null;
      // Obtener el control con el que se desea comparar
      const controlToCompare = control.parent.get(controlNameToCompare);
      if (!controlToCompare) return null;
      // Validar si ambos controles tienen valor y si sus IDs coinciden
      if (
        control.value &&
        controlToCompare.value &&
        control.value.id === controlToCompare.value.id
      ) {
        // Si las capas son iguales, retorna un error personalizado
        return { mismaCapa: true };
      }
      return null;
    };
  }

  /**
   * Limpia la selección espacial y resetea estados al destruir el componente.
   */

  ngOnDestroy(): void {
    this.intersectionServiceService.clearBoxSelection();
    this.interseccionForm?.reset();
    this.loaderContenidoEsVisible = false;
    this.subscriptions.unsubscribe();
  }

  /**
   * Activa la herramienta de selección espacial (bounding box).
   * Solo se activa si el formulario contiene capas válidas para base y destino.
   */

  startBoxSelection(): void {
    // Verifica si las capas 'layerBase' y 'layerDestino' son válidas
    const baseValido = this.interseccionForm.get('layerBase')?.valid;
    const destinoValido = this.interseccionForm.get('layerDestino')?.valid;
    // Si alguna de las capas no es válida, se marcan como tocadas para mostrar errores
    if (!baseValido || !destinoValido) {
      this.interseccionForm.get('layerBase')?.markAsTouched();
      this.interseccionForm.get('layerDestino')?.markAsTouched();
      return;
    }
    // Si ambas capas son válidas, se activa la herramienta de selección espacial
    this.intersectionServiceService.startBoxSelection();
    // Marca en el formulario que se ha iniciado la selección de área
    this.interseccionForm.get('areaSeleccion')?.setValue(true);
  }

  /**
   * Limpia la selección de área espacial activa.
   * Desactiva la herramienta de selección y actualiza el formulario.
   */
  clearSelection(): void {
    // Llama al servicio para limpiar la selección de caja espacial
    this.intersectionServiceService.clearBoxSelection();
    // Actualiza el formulario para indicar que no hay selección activa
    this.interseccionForm.get('areaSeleccion')?.setValue(null);
  }

  /**
   * Ejecuta el flujo completo de intersección espacial entre dos capas seleccionadas:
   * - Valida el formulario y la selección del área.
   * - Verifica que ambas capas estén definidas.
   * - Obtiene las geometrías en formato GeoJSON desde cada capa.
   * - Envía los datos al backend para calcular la intersección.
   * - Procesa el resultado, crea la nueva capa generada y la añade al mapa.
   * - Muestra mensajes de éxito o error según corresponda.
   */

  onSubmit(): void {
    // 1. Validar si el formulario está completamente diligenciado
    if (this.interseccionForm.valid) {
      // 2. Obtener las capas base y destino desde el formulario
      const base: CapaMapa = this.interseccionForm.get('layerBase')?.value;
      const dest: CapaMapa = this.interseccionForm.get('layerDestino')?.value;
      // 3. Obtener el nombre deseado para la nueva capa generada por intersección
      const name = this.interseccionForm.value.outputLayerName as string;
      // 4. Mostrar un indicador visual (loader/spinner) mientras se procesa
      this.loaderContenidoEsVisible = true;
      // 5. Obtener las geometrías de ambas capas en formato GeoJSON (de forma paralela)
      Promise.all([
        this.intersectionServiceService.getGeoJsonFromLayer(base),
        this.intersectionServiceService.getGeoJsonFromLayer(dest),
      ])
        // 6. Una vez obtenidas ambas geometrías, enviarlas al backend para realizar la intersección espacial
        .then(([g1, g2]) => this.intersectionRestService.intersect(g1, g2))
        // 7. Procesar la respuesta del backend y crear la nueva capa generada
        .then((result: FeatureCollection<Geometry, GeoJsonProperties>) => {
          // Crear la definición de la nueva capa con un ID único
          const derivedDef: CapaMapa = {
            id: `intersect_${base.id}_${dest.id}_${Date.now()}`, // ID generado dinámicamente
            titulo: name, // Título especificado por el usuario
            leaf: true, // Marca como capa hoja (sin subcapas)
            tipoServicio: 'FILE', // Tipo interno que indica que es una capa generada dinámicamente
          };
          // Enviar el resultado al servicio para procesarlo y mostrarlo en el mapa
          this.intersectionServiceService.intersectionResult(
            result,
            name,
            derivedDef
          );
          // 8. Ocultar el indicador de carga y limpiar la selección del área
          this.loaderContenidoEsVisible = false;
          this.clearSelection();
        })
        // 9. En caso de error durante el proceso, mostrar un mensaje de error al usuario
        .catch(err => {
          this.messageService.add({
            severity: 'error',
            summary: 'Intersección',
            detail:
              err.message || 'Error inesperado al ejecutar la intersección.',
          });
          // Ocultar el loader incluso si hay error
          this.loaderContenidoEsVisible = false;
        });
    } else {
      // Si el formulario no es válido, se marcan todos los campos como "tocados" para mostrar errores
      this.interseccionForm.markAllAsTouched();
      return;
    }
  }
  /**
   * Devuelve el mensaje de error correspondiente a un campo del formulario,
   * basado en las validaciones configuradas para dicho campo.
   *
   * @param campo Nombre del control dentro del formulario `interseccionForm`.
   * @returns Un mensaje de error en texto si el campo tiene errores, o una cadena vacía si no los tiene.
   */

  getErrorCampo(campo: string): string {
    const control = this.interseccionForm.get(campo);
    // Si el control no existe, no tiene errores, o aún no ha sido tocado o modificado, no se muestra error
    if (!control || !control.errors || (!control.dirty && !control.touched))
      return '';
    const errors = control.errors;
    // Iterar sobre los errores del control y devolver el mensaje correspondiente
    for (const error in errors) {
      switch (error) {
        case 'required':
          return 'Este campo es requerido.';
        case 'mismaCapa':
          return 'La capa base y la capa destino no pueden ser la misma.';
        default:
          return 'Campo inválido.';
      }
    }
    // Si no se encuentra un error conocido, retorna cadena vacía
    return '';
  }
}
