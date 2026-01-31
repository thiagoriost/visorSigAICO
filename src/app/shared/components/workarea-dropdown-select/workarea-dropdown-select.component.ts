import { CommonModule } from '@angular/common';
import {
  Component,
  forwardRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormsModule,
  ControlValueAccessor,
  FormGroup,
  NG_VALUE_ACCESSOR,
  FormControl,
  NgControl,
  Validator,
  AbstractControl,
  ValidationErrors,
  NG_VALIDATORS,
} from '@angular/forms';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { MapState } from '@app/core/interfaces/store/map.model';
import { selectWorkAreaLayerList } from '@app/core/store/map/map.selectors';
import { Store } from '@ngrx/store';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { Subject, takeUntil } from 'rxjs';

/**
 * Componente reutilizable que contiene un dropdown para seleccionare un
 * elemento de una lista desplegable
 * Los atributos datakey y optionLabel dependen de la estructura T y se
 * deben inyectar de acuerdo con la tipificacion de la lista
 * @date 12-05-2025
 * @author Andres Fabian Simbaqueba Del Rio
 * @template T  corresponde al tipo de dato de la lista que se quiere inyectar
 * Utiliza la interface ControlValueAccesor que permite reutilizar componentes y trabajarlos con formularios reactivos
 */
@Component({
  selector: 'app-workarea-dropdown-select',
  standalone: true,
  imports: [SelectModule, CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WorkareaDropdownSelectComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => WorkareaDropdownSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './workarea-dropdown-select.component.html',
  styleUrl: './workarea-dropdown-select.component.scss',
})
export class WorkareaDropdownSelectComponent
  implements ControlValueAccessor, Validator, OnInit, OnDestroy
{
  // Título opcional que aparece encima del select
  @Input() title = '';

  // Lista de elementos a mostrar en el dropdown
  @Input() layerList: CapaMapa[] = [];

  // Atributo único usado como `dataKey` por PrimeNG para identificar elementos
  @Input({ required: true }) dataKey = '';

  // Si `true`, muestra un check visual al seleccionar un ítem
  @Input({ required: true }) checkmark = false;

  // Atributo de `layerList` que se mostrará como etiqueta visible en el dropdown
  @Input({ required: true }) optionLabel: Extract<keyof CapaMapa, string> =
    '' as Extract<keyof CapaMapa, string>;

  // Placeholder por defecto
  @Input({ required: true }) placeholder = '';

  // Muestra un spinner de carga
  @Input() loading = false;

  // Mensaje a mostrar si no hay elementos
  @Input() emptyMessage = '';

  // Filtro de tipo de servicio (por ejemplo, WFS o WMS) — aún no implementado aquí
  @Input() filtroServicio!: string;

  public ngControl: NgControl | null = null;

  // Valor seleccionado actualmente en el dropdown
  value: CapaMapa | null = null;

  // Estado de deshabilitado para el control
  isDisabled = false;

  // Referencia opcional para usar el componente en formularios anidados
  form!: FormGroup;

  // Sujeto para controlar y limpiar suscripciones
  private destroy$ = new Subject<void>();

  constructor(
    private mapStore: Store<MapState>,
    private injector: Injector
  ) {}

  /**
   * Función que Angular Forms usará para actualizar el modelo del formulario
   */
  private onChange: (value: CapaMapa | null) => void = () => {
    // Será reemplazada por Angular Forms
  };

  /**
   * Getter para acceder al control asociado al formulario
   */
  get control(): FormControl | null {
    return this.ngControl?.control as FormControl;
  }

  /**
   * Función que Angular Forms usará para marcar el control como "tocado"
   */
  onTouched: () => void = () => {
    // Será reemplazada por Angular Forms
  };

  /**
   * Validador que devuelve `{ required: true }` si el valor es nulo
   */
  validate(control: AbstractControl): ValidationErrors | null {
    return control.value ? null : { required: true };
  }

  /**
   * Asigna el valor al componente desde el exterior (ControlValueAccessor)
   */
  writeValue(value: CapaMapa | null): void {
    this.value = value;
  }

  /**
   * Registra función de cambio (ControlValueAccessor)
   */
  registerOnChange(fn: (value: CapaMapa | null) => void): void {
    this.onChange = fn;
  }

  /**
   * Registra función para evento "tocado" (ControlValueAccessor)
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Habilita o deshabilita el componente desde el exterior
   */
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  /**
   * Se ejecuta cuando se selecciona un nuevo elemento en el dropdown
   */
  onSelectObject(event: SelectChangeEvent) {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
  }

  /**
   * Se ejecuta cuando el componente se destruye.
   * Se encarga de limpiar suscripciones abiertas.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa el componente. Configura el `ControlValueAccessor`
   * y se suscribe al store para obtener la lista de capas disponibles.
   */
  ngOnInit(): void {
    const control = this.injector.get(NgControl, null);
    if (control != null) {
      control.valueAccessor = this;
      this.ngControl = control;
    }

    this.mapStore
      .select(selectWorkAreaLayerList)
      .pipe(takeUntil(this.destroy$))
      .subscribe(workAreaList => {
        if (workAreaList) {
          this.layerList = this.convertLayerStoreListToCapaMapaList(
            workAreaList,
            this.filtroServicio
          );
        }
      });
  }

  /**
   * Método que transforma una lista de capas del store
   * en una lista de capas mapa, con opción a filtrar.
   *
   * @param layerStoreList Lista de capas del store
   * @param tipoFiltro Opcional. Tipo de filtro para el servicio ('wfs', 'wms', etc.).
   *                   Si no se especifica, devuelve todas las capas.
   * @returns Lista de capas mapa filtrada y ordenada alfabéticamente por título.
   */
  convertLayerStoreListToCapaMapaList(
    layerStoreList: LayerStore[],
    filtro?: string
  ): CapaMapa[] {
    let layerList: CapaMapa[] = [];

    if (layerStoreList && layerStoreList.length > 0) {
      layerList = layerStoreList
        .map(layerStore => layerStore.layerDefinition)
        .filter(capa => {
          if (!filtro) {
            return true; // sin filtro devuelve todo
          }
          // Filtro dinámico según el tipo
          switch (filtro.toLowerCase()) {
            case 'wfs':
              return capa.urlServicioWFS != null && capa.urlServicioWFS !== '';
            default:
              return true; // si el filtro no es reconocido, devuelve todo
          }
        });

      layerList.sort((a, b) => a.titulo.localeCompare(b.titulo));
    }

    return layerList;
  }
}
