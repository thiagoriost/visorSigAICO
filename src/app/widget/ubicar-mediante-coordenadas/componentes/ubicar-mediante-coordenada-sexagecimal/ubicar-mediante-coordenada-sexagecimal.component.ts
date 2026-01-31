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
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CoordenadaGeografica } from '@app/widget/ubicar-mediante-coordenadas/interfaces/CoordenadaGeografica';
import { LocateCoordinateService } from '../../services/locate-coordinate.service';
import { CoordenadaSexagecimal } from '../../interfaces/CoordenadaSexagecimal';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { OpenProfile } from '../../enums/OpenProfile';
import { DMS } from '../../interfaces/DMS';

/**
 * Componente para capturar coordenadas de tipo sexagecimal
 * (Grados, Minutos, Segundos)
 * @date 05-05-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-ubicar-mediante-coordenada-sexagecimal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputNumberModule,
    ButtonModule,
    SelectModule,
    CommonModule,
  ],
  providers: [LocateCoordinateService],
  templateUrl: './ubicar-mediante-coordenada-sexagecimal.component.html',
  styleUrl: './ubicar-mediante-coordenada-sexagecimal.component.scss',
})
export class UbicarMedianteCoordenadaSexagecimalComponent
  implements OnInit, OnChanges
{
  sexagesimalForm: FormGroup; //formulario
  @Output() coordinateEmitter: EventEmitter<CoordenadaGeografica> =
    new EventEmitter<CoordenadaGeografica>(); //emisor de coordenadas cuando se agregan

  longitudeHemisphereList: { name: string; value: string }[] = [];
  latitudeHemisphereList: { name: string; value: string }[] = [];
  isErrorOnForm = false; //variable para indicar si hay errores en el formulario
  @Input() openProfile: OpenProfile = OpenProfile.LOCATING;

  @Input() coordinate: CoordenadaGeografica | null = null;
  openingProfiles = OpenProfile;

  dmsLatitudeCoordinate: DMS | null = null;
  dmsLongitudeCoordinate: DMS | null = null;
  /**
   * Crear instancia del componente
   * @param formBuilder constructor de formularios
   * @param messageService servicio para mostrar mensajes
   */
  constructor(private formBuilder: FormBuilder) {
    this.sexagesimalForm = this.formBuilder.group({});
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['coordenada']) {
      this.dmsLatitudeCoordinate = this.convertirADMS(
        this.coordinate ? this.coordinate.latitud : 0,
        'latitud'
      );
      this.dmsLongitudeCoordinate = this.convertirADMS(
        this.coordinate ? this.coordinate.longitud : 0,
        'longitud'
      );

      this.sexagesimalForm
        .get('longitudeHemisphere')
        ?.setValue(this.dmsLongitudeCoordinate.direccion, {
          emitEvent: false,
        });

      this.sexagesimalForm
        .get('longitudeDegrees')
        ?.setValue(this.dmsLongitudeCoordinate.grados, {
          emitEvent: false,
        });

      this.sexagesimalForm
        .get('longitudeMinutes')
        ?.setValue(this.dmsLongitudeCoordinate.minutos, {
          emitEvent: false,
        });

      this.sexagesimalForm
        .get('longitudeSeconds')
        ?.setValue(this.dmsLongitudeCoordinate.segundos, {
          emitEvent: false,
        });

      this.sexagesimalForm
        .get('latitudeHemisphere')
        ?.setValue(this.dmsLatitudeCoordinate.direccion, {
          emitEvent: false,
        });

      this.sexagesimalForm
        .get('latitudeDegrees')
        ?.setValue(this.dmsLatitudeCoordinate.grados, {
          emitEvent: false,
        });

      this.sexagesimalForm
        .get('latitudeMinutes')
        ?.setValue(this.dmsLatitudeCoordinate.minutos, {
          emitEvent: false,
        });

      this.sexagesimalForm
        .get('latitudeSeconds')
        ?.setValue(this.dmsLatitudeCoordinate.segundos, {
          emitEvent: false,
        });
    }
  }

  /**
   * Metodo que se ejecuta al iniciar el componente
   */
  ngOnInit(): void {
    if (this.coordinate) {
      this.dmsLatitudeCoordinate = this.convertirADMS(
        this.coordinate.latitud,
        'latitud'
      );
      this.dmsLongitudeCoordinate = this.convertirADMS(
        this.coordinate.longitud,
        'longitud'
      );
    }

    this.sexagesimalForm = this.formBuilder.group({
      longitudeHemisphere: [
        this.dmsLongitudeCoordinate
          ? this.dmsLongitudeCoordinate.direccion
          : 'O',
        [Validators.required],
        [],
      ],
      longitudeDegrees: [
        this.dmsLongitudeCoordinate?.grados ?? null,
        [Validators.required, Validators.min(0), Validators.max(180)],
        [],
      ],
      longitudeMinutes: [
        this.dmsLongitudeCoordinate?.minutos ?? 0,
        [Validators.min(0), Validators.max(59)],
        [],
      ],
      longitudeSeconds: [
        this.dmsLongitudeCoordinate?.segundos ?? 0,
        [Validators.min(0)],
        [],
      ],
      latitudeHemisphere: [
        this.dmsLatitudeCoordinate
          ? this.dmsLatitudeCoordinate?.direccion
          : 'N',
        [Validators.required],
        [],
      ],
      latitudeDegrees: [
        this.dmsLatitudeCoordinate?.grados ?? null,
        [Validators.required, Validators.min(0), Validators.max(90)],
        [],
      ],
      latitudeMinutes: [
        this.dmsLatitudeCoordinate?.minutos ?? 0,
        [Validators.min(0), Validators.max(59)],
        [],
      ],
      latitudeSeconds: [
        this.dmsLatitudeCoordinate?.segundos ?? 0,
        [Validators.min(0)],
        [],
      ],
    });
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
   * Metodo que se ejeucuta cuando se acciona el boton BUSCAR
   * Valida que el formulario sea valido sino muestra mensaje de error
   * transforma los campos Grados, MInutos y Segundos de la longitud y latitud en
   * dos coordenadas decinmales y la envia al componente padre
   */
  onSubmit() {
    if (this.sexagesimalForm.valid) {
      this.isErrorOnForm = false;
      const latitudeHemisphere =
        this.sexagesimalForm.get('latitudeHemisphere')?.value;
      const longitudeHemisphere = this.sexagesimalForm.get(
        'longitudeHemisphere'
      )?.value;
      const longitudeDegrees =
        this.sexagesimalForm.get('longitudeDegrees')?.value;
      const longitudeMinutes =
        this.sexagesimalForm.get('longitudeMinutes')?.value;
      const longitudeSeconds =
        this.sexagesimalForm.get('longitudeSeconds')?.value;
      const latitudeDegrees =
        this.sexagesimalForm.get('latitudeDegrees')?.value;
      const latitudeMinutes =
        this.sexagesimalForm.get('latitudeMinutes')?.value;
      const latitudeSeconds =
        this.sexagesimalForm.get('latitudeSeconds')?.value;
      const sexagecimalCoordinate: CoordenadaSexagecimal = {
        latitudeDegrees:
          latitudeHemisphere === 'S' ? -latitudeDegrees : latitudeDegrees,
        latitudeMinutes: latitudeMinutes,
        latitudeSeconds: latitudeSeconds,
        longitudeDegrees:
          longitudeHemisphere === 'O' ? -longitudeDegrees : longitudeDegrees,
        longitudeMinutes: longitudeMinutes,
        longitudeSeconds: longitudeSeconds,
      };
      if (sexagecimalCoordinate) {
        const longitude = this.convertDGSToCoordinate(
          sexagecimalCoordinate.longitudeDegrees,
          sexagecimalCoordinate.longitudeMinutes,
          sexagecimalCoordinate.longitudeSeconds
        );
        const latitude = this.convertDGSToCoordinate(
          sexagecimalCoordinate.latitudeDegrees,
          sexagecimalCoordinate.latitudeMinutes,
          sexagecimalCoordinate.latitudeSeconds
        );
        const coordenada: CoordenadaGeografica = {
          longitud: longitude,
          latitud: latitude,
          tipoGrado: 'sexagecimal',
        };
        this.coordinateEmitter.emit(coordenada);
      }
    } else {
      this.sexagesimalForm.markAllAsTouched();
      this.isErrorOnForm = true;
    }
  }

  /**
   * Metodo para convertir grados, minutos y segundos a coordenada con
   * punto decimal
   * @param degrees grados de la coordenada
   * @param minutes minutos de la coordenada
   * @param seconds segundos de la coordenada
   * @returns coordenada en formato decimal
   */
  convertDGSToCoordinate(
    degrees: number,
    minutes: number,
    seconds: number
  ): number {
    const decimalCoordinate = Math.abs(degrees) + minutes / 60 + seconds / 3600;
    return degrees < 0
      ? this.truncDecimal(-decimalCoordinate, 4)
      : this.truncDecimal(decimalCoordinate, 4);
  }

  /**
   * Metodo para truncar decimales
   * @param valor valor a ser truncado
   * @param decimales cantidad de digitos decimales
   * @returns numero truncado con x cantidad de decimales
   */
  truncDecimal(valor: number, decimales: number): number {
    const factor = Math.pow(10, decimales);
    return Math.trunc(valor * factor) / factor;
  }

  /**
   * Metodo para obtener los errores de los campos de un formulario
   * @param campo nombre del campo
   * @returns mensaje de error
   */
  getErrorCampo(campo: string): string {
    let answer = '';
    const isTouched = this.sexagesimalForm.controls[campo].touched;
    if (isTouched) {
      const errors = this.sexagesimalForm.controls[campo].errors || {};
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

  /**
   * Metodo para convertir una coordenada geografica en Grados,Minutos, Segundos y direccion
   * @param decimal coordenada en formato decimal
   * @param isLatitud variable para indicar que la coordenada es de la latitud
   * @returns objeto con los datos de grados,minutos, segundos y dirección
   */
  convertirADMS(decimal: number, eje: 'latitud' | 'longitud'): DMS {
    const valorAbsoluto = Math.abs(decimal);
    const grados = Math.floor(valorAbsoluto);
    const minutosDecimal = (valorAbsoluto - grados) * 60;
    const minutos = Math.floor(minutosDecimal);
    const segundos = +(60 * (minutosDecimal - minutos));

    return {
      grados,
      minutos,
      segundos: parseFloat(segundos.toFixed(2)),
      direccion:
        eje === 'latitud'
          ? decimal >= 0
            ? 'N'
            : 'S'
          : decimal <= 0
            ? 'O'
            : 'E',
    };
  }
}
