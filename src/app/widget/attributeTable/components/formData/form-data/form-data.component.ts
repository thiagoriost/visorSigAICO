import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

// Componentes y modelos propios
import { AttributeTableData } from '@app/widget/attributeTable/interfaces/geojsonInterface';
import { MapActions } from '@app/core/store/map/map.actions';
import { MapState } from '@app/core/interfaces/store/map.model';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';

/**
 * Componente encargado de enviar datos de geometrías a través de un formulario
 * hacia el Store de NgRx para que otros componentes puedan utilizarlos.
 *
 * Incluye validación de campos y control de visibilidad de widgets.
 *
 * @author Heidy Paola Lopez Sanchez
 */
@Component({
  selector: 'app-form-data',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CheckboxModule,
    ButtonModule,
    DialogModule,
    CommonModule,
  ],
  templateUrl: './form-data.component.html',
  styleUrl: './form-data.component.scss',
})
export class FormDataComponent implements OnInit {
  formGroup!: FormGroup; // Definimos el formulario
  visible = false; // Controla la visibilidad de las opciones para exportar
  Geometrias = `{
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "id": 1,
          "nombre": "Cundinamarca",
          "capital": "Bogotá",
          "poblacion": 2878123
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [-74.6167, 5.4167],
              [-74.75, 5.0],
              [-74.5, 4.75],
              [-74.25, 4.5],
              [-73.9167, 4.5833],
              [-73.8333, 4.75],
              [-73.9167, 5.0],
              [-74.1667, 5.25],
              [-74.6167, 5.4167]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "id": 2,
          "nombre": "Antioquia",
          "capital": "Medellín",
          "poblacion": 6338973
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [-75.5, 7.5],
              [-75.75, 7.25],
              [-75.5, 7.0],
              [-75.0, 6.75],
              [-74.75, 6.5],
              [-74.75, 6.75],
              [-75.0, 7.0],
              [-75.25, 7.25],
              [-75.5, 7.5]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "id": 3,
          "nombre": "Atlántico",
          "capital": "Barranquilla",
          "poblacion": 2506487
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [-74.9167, 10.75],
              [-75.0, 10.5833],
              [-74.75, 10.4167],
              [-74.5, 10.3333],
              [-74.5, 10.5],
              [-74.75, 10.5833],
              [-74.9167, 10.75]
            ]
          ]
        }
      }
    ]
  }`;
  constructor(
    private formBuilder: FormBuilder, // Servicio para construir formularios reactivos
    private userInterfaceService: UserInterfaceService, // Servicio para gestionar la visibilidad de widgets
    private store: Store<MapState> // NgRx Store para despachar acciones con datos del mapa
  ) {}

  /**
   * Método que se ejecuta cuando se inicializa el componente.
   *
   * PASO A PASO:
   *  Se crea un formulario reactivo con validaciones.
   *  El formulario incluye:
   *    - 'titulo': campo texto obligatorio.
   *    - 'geojson': campo obligatorio que espera una cadena JSON.
   *    - 'visible': campo booleano obligatorio que controla la visibilidad.
   */
  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      titulo: ['', Validators.required], // Campo obligatorio para el título.
      geojson: [this.Geometrias, Validators.required], // Campo obligatorio para el GeoJSON.
      visible: [false, Validators.required], // Campo obligatorio para controlar visibilidad.
    });
  }

  /**
   * Envía los datos del formulario al Store para ser usados por la tabla de atributos.
 
   */
  sendDataStore(): void {
    if (!this.formGroup.valid) {
      this.formGroup.markAllAsTouched();
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    const formData = this.formGroup.value;

    try {
      const parsedGeojson = JSON.parse(formData.geojson);
      let geojsonParaEnviar;

      if (
        parsedGeojson?.type === 'FeatureCollection' &&
        Array.isArray(parsedGeojson.features)
      ) {
        geojsonParaEnviar = parsedGeojson;
      } else if (
        parsedGeojson?.type === 'Feature' &&
        parsedGeojson.geometry &&
        parsedGeojson.properties
      ) {
        geojsonParaEnviar = {
          type: 'FeatureCollection',
          features: [parsedGeojson],
        };
      } else {
        throw new Error(
          'Estructura GeoJSON inválida: se esperaba Feature o FeatureCollection'
        );
      }

      const data: AttributeTableData = {
        titulo: formData.titulo,
        geojson: geojsonParaEnviar,
        visible: !!formData.visible,
      };

      this.store.dispatch(
        MapActions.setWidgetAttributeTableData({
          widgetId: 'tabla-atributos',
          data: data,
        })
      );

      this.userInterfaceService.cambiarVisibleWidget('attributeTable', true);
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
      alert(
        'Error al procesar los datos. Asegúrate de que el GeoJSON sea válido.'
      );
    }
  }
}
