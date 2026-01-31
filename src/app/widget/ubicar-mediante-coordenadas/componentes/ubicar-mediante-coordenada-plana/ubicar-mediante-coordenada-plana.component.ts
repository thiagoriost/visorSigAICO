import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CoordenadaPlana } from '@app/widget/ubicar-mediante-coordenadas/interfaces/CoordenadaPlana';
import { OpenProfile } from '../../enums/OpenProfile';

/**
 * Componente que permite ubicar coordenadas cartesianas en el sistema EPSG:9377
 * @date 23-04-2025
 * @author Andres Fabian Simbaqueba Del Rio
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-ubicar-mediante-coordenada-plana',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputNumberModule,
    ButtonModule,
    SelectModule,
    CommonModule,
  ],
  providers: [],
  templateUrl: './ubicar-mediante-coordenada-plana.component.html',
  styleUrl: './ubicar-mediante-coordenada-plana.component.scss',
})
export class UbicarMedianteCoordenadaPlanaComponent
  implements OnInit, OnChanges
{
  coordenadaPlanaForm: FormGroup; //formulario
  isErrorOnForm = false; //variable para indicar si hay errores en el formulario

  @Output() coordinateEmitter: EventEmitter<CoordenadaPlana> =
    new EventEmitter<CoordenadaPlana>();

  @Input() openProfile: OpenProfile = OpenProfile.LOCATING;
  openingProfiles = OpenProfile;

  @Input() coordenada: CoordenadaPlana | null = null;

  /**
   * Crea una instancia del componente
   * @param {FormBuilder} formBuilder  constructor del formulario
   * @param {LocateCoordinateService} locateCoordinateService servicio para ubicar mapas
   * @param {Store<MapState>} store store para obtener la proyeccion del mapa
   * @param messageService servicio para mostrar mensajes
   */
  constructor(private formBuilder: FormBuilder) {
    this.coordenadaPlanaForm = this.formBuilder.group({});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['coordenada']) {
      this.coordenadaPlanaForm
        .get('este')
        ?.setValue(this.coordenada?.este, { emitEvent: false });
      this.coordenadaPlanaForm
        .get('norte')
        ?.setValue(this.coordenada?.norte, { emitEvent: false });
    }
  }

  ngOnInit(): void {
    this.coordenadaPlanaForm = this.formBuilder.group({
      este: [
        this.coordenada?.este ?? null,
        [
          Validators.required,
          Validators.min(3681461.16),
          Validators.max(5683149.09),
          Validators.maxLength(11),
        ],
        [],
      ],
      norte: [
        this.coordenada?.norte ?? null,
        [
          Validators.required,
          Validators.min(1080616.36),
          Validators.max(3307327.96),
          Validators.maxLength(11),
        ],
        [],
      ],
    });
  }

  /**
   * metodo que se ejecuta al accionar el boton buscar
   */
  onLocatePoint() {
    if (this.coordenadaPlanaForm.valid) {
      this.isErrorOnForm = false;
      const coordenada: CoordenadaPlana = this.coordenadaPlanaForm
        .value as CoordenadaPlana;
      this.coordinateEmitter.emit(coordenada);
    } else {
      this.coordenadaPlanaForm.markAllAsTouched();
      this.isErrorOnForm = true;
    }
  }

  /**
   * Metodo para obtener los errores de los campos de un formulario
   * @param campo nombre del campo
   * @returns mensaje de error
   */
  getErrorCampo(campo: string): string {
    let answer = '';
    const isTouched = this.coordenadaPlanaForm.controls[campo].touched;
    if (isTouched) {
      const errors = this.coordenadaPlanaForm.controls[campo].errors || {};
      for (const key of Object.keys(errors)) {
        switch (key) {
          case 'required':
            answer = 'Este campo es requerido';
            break;
          case 'maxlength':
            answer = 'Se ha excedido de la longitud máxima requerida.';
            break;
          case 'minlenght':
            answer = `Mínimo ${errors['minlength'].requiredLength} caracteres.`;
            break;
          case 'pattern':
            answer = 'El texto no cumple las restricciones de entrada';
            break;
          case 'min':
            answer = `El valor no puede ser inferior a  ${errors['min'].min}`;
            break;
          case 'max':
            answer = `El valor no puede ser superior a  ${errors['max'].max}`;
            break;
          default:
            answer = 'Error desconocido';
            break;
        }
      }
    }
    return answer;
  }
}
