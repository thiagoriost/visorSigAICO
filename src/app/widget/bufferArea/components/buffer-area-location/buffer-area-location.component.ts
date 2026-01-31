import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
// **** PRIME NG ****
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
// **** COMPONENTS ****
import { UbicarMedianteCoordenadasComponent } from '@app/widget/ubicar-mediante-coordenadas/componentes/ubicar-mediante-coordenadas/ubicar-mediante-coordenadas.component';
// ***** SERVICES ****
import { BufferAreaCoordenadaService } from '@app/widget/bufferArea/services/buffer-area-coordenada.service';
// ***** INTERFACES ****
import { CoordenadaGeografica } from '@app/widget/ubicar-mediante-coordenadas/interfaces/CoordenadaGeografica';

/**
 * @description Componente para generar buffer sobre una ubicación seleccionada en el mapa, con widget de ubicación mediante coordenada.
 * @author Carlos Alberto Aristizabal Vargas y Juan Carlos Valderrama Gonzalez
 */
@Component({
  selector: 'app-buffer-area-location',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    FloatLabel,
    InputNumberModule,
    UbicarMedianteCoordenadasComponent,
  ],
  templateUrl: './buffer-area-location.component.html',
  styleUrl: './buffer-area-location.component.scss',
})
export class BufferAreaLocationComponent {
  //Emisor de estado de procesamiento
  @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Formulario
  formBufferLocation: FormGroup = new FormGroup({
    unit: new FormControl(null, [Validators.required]),
    distance: new FormControl(null, [Validators.required]),
    location: new FormControl(null, [Validators.required]),
  });

  /** Lista de unidades de distancia disponibles para el buffer. */
  unidadDistancia = [
    { name: 'Metros', code: 'm' },
    { name: 'Kilómetros', code: 'km' },
    { name: 'Millas', code: 'mi' },
    { name: 'Millas Náuticas', code: 'nmi' },
  ];

  constructor(
    private bufferAreaCoordenadaService: BufferAreaCoordenadaService
  ) {}

  /**
   * @Description setea la coordenada en el formulario
   * @param coordinate Coordenada obtenida del componente ubicar mediante coordenadas - CoordenadaGeografica
   */
  setLocation(coordinate: CoordenadaGeografica) {
    this.formBufferLocation.get('location')?.setValue(coordinate);
    // Dispara la validación del formulario
    this.onSubmit();
  }

  /**
   * @description Metodo que se ejecuta al enviar el formulario   *
   */
  onSubmit() {
    // Verificar si el formulario es invalido y mostrar errores
    if (this.formBufferLocation.invalid) {
      this.formBufferLocation.markAllAsTouched();
      // Recorrer todos los controles del formulario y marcarlos como dirty, adicionando clase ng-dirty
      Object.values(this.formBufferLocation.controls).forEach(control => {
        control.markAsDirty();
      });
      return;
    }

    this.loading.emit(true);
    // Construye una coordenada segura y normalizada
    const coordenadaSegura = {
      id: this.formBufferLocation.value.location.id ?? 'temporal-id',
      latitud: this.formBufferLocation.value.location.latitud,
      longitud: this.formBufferLocation.value.location.longitud,
      tipoGrado: this.formBufferLocation.value.location.tipoGrado,
    };

    // Llama al servicio para dibujar el buffer con los parámetros proporcionados
    this.bufferAreaCoordenadaService
      .dibujarBufferDesdeCoordenada(
        coordenadaSegura,
        this.formBufferLocation.value.distance,
        this.formBufferLocation.value.unit
      )
      .then(() => {
        console.log('Petición de buffer finalizada exitosamente.');
      })
      .catch(error => {
        console.error('Error al realizar la petición de buffer:', error);
      })
      .finally(() => {
        setTimeout(() => {
          this.loading.emit(false);
        }, 800);
      });
  }
}
