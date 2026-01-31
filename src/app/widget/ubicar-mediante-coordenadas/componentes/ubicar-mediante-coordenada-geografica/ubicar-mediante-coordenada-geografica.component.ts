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
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CoordenadaGeografica } from '../../interfaces/CoordenadaGeografica';
import { RadioButtonClickEvent, RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { UbicarMedianteCoordenadaSexagecimalComponent } from '../ubicar-mediante-coordenada-sexagecimal/ubicar-mediante-coordenada-sexagecimal.component';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { OpenProfile } from '../../enums/OpenProfile';

/**
 * Componete que permie ubicar coordenadas geograficas en el mapa
 * @date 22-04-2025
 * @author Andres Fabian Simbaqueba Del Rio
 * @implements {OnInit}
 */
@Component({
  selector: 'app-ubicar-mediante-coordenada-geografica',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RadioButtonModule,
    InputNumberModule,
    ButtonModule,
    ToastModule,
    UbicarMedianteCoordenadaSexagecimalComponent,
    SelectModule,
    CommonModule,
  ],
  providers: [],
  templateUrl: './ubicar-mediante-coordenada-geografica.component.html',
  styleUrl: './ubicar-mediante-coordenada-geografica.component.scss',
})
export class UbicarMedianteCoordenadaGeograficaComponent
  implements OnInit, OnChanges
{
  coordenadaGeograficaForm: FormGroup; //formulario para los campos del componente
  tipoGrado = ''; // variable para mostrar el mensaje de acuerdo con el tipo de grado seleccionado
  longitudeHemisphereList: { name: string; value: string }[] = [];
  latitudeHemisphereList: { name: string; value: string }[] = [];
  isErrorOnForm = false; //variable para indicar si hay errores en el formulario
  @Input() openProfile: OpenProfile = OpenProfile.LOCATING;

  @Input() coordenada: CoordenadaGeografica | null = null;
  openingProfiles = OpenProfile;

  @Output() coordinateEmitter: EventEmitter<CoordenadaGeografica> =
    new EventEmitter<CoordenadaGeografica>();
  /**
   * Crea una instancia del componente
   * @param {FormBuilder} formBuilder
   * @param {MessageService} messageService servicio para mostrar mensajes
   */
  constructor(private formBuilder: FormBuilder) {
    this.coordenadaGeograficaForm = this.formBuilder.group({});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['coordenada']) {
      this.coordenadaGeograficaForm
        .get('longitud')
        ?.setValue(Math.abs(this.coordenada?.longitud ?? 0), {
          emitEvent: false,
        });
      this.coordenadaGeograficaForm
        .get('hemisferioLongitud')
        ?.setValue(
          this.coordenada ? (this.coordenada?.longitud < 0 ? 'O' : 'E') : 'O',
          {
            emitEvent: false,
          }
        );

      this.coordenadaGeograficaForm
        .get('latitud')
        ?.setValue(Math.abs(this.coordenada?.latitud ?? 0), {
          emitEvent: false,
        });
      this.coordenadaGeograficaForm
        .get('hemisferioLatitud')
        ?.setValue(
          this.coordenada ? (this.coordenada?.latitud > 0 ? 'N' : 'S') : 'N',
          {
            emitEvent: false,
          }
        );
    }
  }

  /**
   * Metodo que se ejecuta al iniciar el componente
   * Se configura el formulario
   * Se obtiene la proyeccion del mapa
   */
  ngOnInit(): void {
    this.coordenadaGeograficaForm = this.formBuilder.group({
      longitud: [
        this.coordenada ? Math.abs(this.coordenada.longitud) : null,
        [
          Validators.required,
          Validators.minLength(5),
          Validators.min(0),
          Validators.max(180),
        ],
        [],
      ],
      hemisferioLongitud: [
        this.coordenada ? (this.coordenada.longitud < 0 ? 'O' : 'E') : 'O',
        [Validators.required],
        [],
      ],
      latitud: [
        this.coordenada ? Math.abs(this.coordenada.latitud) : null,
        [
          Validators.required,
          Validators.minLength(5),
          Validators.min(0),
          Validators.max(90),
        ],
        [],
      ],
      hemisferioLatitud: [
        this.coordenada ? (this.coordenada.latitud > 0 ? 'S' : 'N') : 'N',
        [Validators.required],
        [],
      ],
      tipoGrado: [
        'decimal',
        [Validators.required, Validators.minLength(5)],
        [],
      ],
    });
    this.tipoGrado = this.coordenadaGeograficaForm.get('tipoGrado')?.value;
    this.latitudeHemisphereList = [
      { name: 'Norte', value: 'N' },
      { name: 'Sur', value: 'S' },
    ];
    this.longitudeHemisphereList = [
      { name: 'Este', value: 'E' },
      { name: 'Oeste', value: 'O' },
    ];
  }

  /**
   * Metodo para emitir la coordenada geografica cuando se crea con tipo de grado sexagesimal
   * @param coordenada coordenada a ser emitida al componente padre
   */
  onEmitSexagecimalCoordinate(coordenada: CoordenadaGeografica): void {
    this.coordinateEmitter.emit(coordenada);
  }

  /**
   * Metodo que se ejeucuta cuando se acciona el boton BUSCAR
   * Valida que el formulario sea valido sino muestra mensaje de error
   * Captura los datos y los envia al componente padre para que se haga
   * la tranformacion y se agregue al mapa
   */
  onLocate(): void {
    if (this.coordenadaGeograficaForm.valid) {
      this.isErrorOnForm = false;
      const hemisferioLongitud =
        this.coordenadaGeograficaForm.get('hemisferioLongitud')?.value;
      const hemisferioLatitud =
        this.coordenadaGeograficaForm.get('hemisferioLatitud')?.value;
      const longitud = this.coordenadaGeograficaForm.get('longitud')?.value;
      const latitud = this.coordenadaGeograficaForm.get('latitud')?.value;
      const coordenada: CoordenadaGeografica = {
        latitud: hemisferioLatitud === 'S' ? -latitud : latitud,
        longitud: hemisferioLongitud === 'O' ? -longitud : longitud,
        tipoGrado: 'decimal',
      };
      this.coordinateEmitter.emit(coordenada);
    } else {
      this.coordenadaGeograficaForm.markAllAsTouched();
      this.isErrorOnForm = true;
    }
  }

  /**
   * Metodo que se ejecuta cuando se cambia la opcion seleccionada en el
   * componente del radioButton
   * @param event evento del radioButton
   */
  onChangeRadioButton(event: RadioButtonClickEvent): void {
    this.tipoGrado = event.value;
  }

  /**
   * Metodo para obtener los errores de los campos de un formulario
   * @param campo nombre del campo
   * @returns mensaje de error
   */
  getErrorCampo(campo: string): string {
    let answer = '';
    const isTouched = this.coordenadaGeograficaForm.controls[campo].touched;
    if (isTouched) {
      const errors = this.coordenadaGeograficaForm.controls[campo].errors || {};
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
