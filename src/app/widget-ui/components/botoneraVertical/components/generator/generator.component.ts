import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';

import { FormControl } from '@angular/forms';
import { BotonConfigModel } from '../../interfaces/boton-config.model';

import { BotoneraVerticalComponent } from '../botonera-vertical/botonera-vertical.component';

const EJEMPLO_JSON = `[
  {
    "id": "herramientas",
    "icono": "pi pi-pencil",
    "texto": "Herramientas",
    "opciones": [
      { "id": "buffer", "icono": "pi pi-map", "texto": "Área de influencia (Buffer)" },
      { "id": "dibujar", "icono": "pi pi-pencil", "texto": "Dibujar" },
      { "id": "interseccion", "icono": "pi pi-adjust", "texto": "Intersección" },
      { "id": "medir", "icono": "pi pi-ruler", "texto": "Medir" },
      { "id": "ubicar-coordenada", "icono": "pi pi-map-marker", "texto": "Ubicar coordenada" }
    ]
  },
  {
    "id": "consulta",
    "icono": "pi pi-search",
    "texto": "Consulta",
    "opciones": [
      { "id": "consulta-simple",    "icono": "pi pi-search",       "texto": "Consulta simple" },
      { "id": "consulta-avanzada",  "icono": "pi pi-filter",       "texto": "Consulta avanzada" },
      { "id": "identificar",        "icono": "pi pi-info-circle",  "texto": "Identificar" },
      { "id": "seleccion-espacial", "icono": "pi pi-th-large",     "texto": "Selección espacial" },
      { "id": "salida-grafica",     "icono": "pi pi-image",        "texto": "Salida gráfica" }
    ]
  }
]`;

/**
 * Componente encargado generar el componente de la botonera vertical generica
 * @date 12-06-2025
 * @author Sergio Alonso Mariño Duque
 */
@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Textarea,
    ButtonModule,
    Select,
    BotoneraVerticalComponent,
  ],
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss'], // Estilos del componente
})
export class GeneratorComponent {
  /** JSON string que pega el usuario */
  jsonControl = new FormControl<string>(EJEMPLO_JSON, { nonNullable: true });
  /** Error al parsear JSON */
  errorMsg: string | null = null;
  /** Configuración de la botonera a pasar al componente */
  botones: BotonConfigModel[] = [];

  /**
   * Tamaño de los botones de la botonera para el ejemplo.
   * Valores permitidos: 'small' | 'large' | 'default'
   */
  size: 'small' | 'large' | 'default' = 'default';

  /**
   * Opciones disponibles para el selector de tamaño
   */
  sizeOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Small', value: 'small' },
    { label: 'Large', value: 'large' },
  ];

  /** Al pulsar “Generar”: parsea y actualiza `botones` */
  generate() {
    this.errorMsg = null;
    try {
      const data = JSON.parse(this.jsonControl.value) as BotonConfigModel[];
      // Validar estructura mínima
      if (!Array.isArray(data)) throw new Error('Debe ser un array de botones');
      this.botones = data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'JSON inválido';
      this.errorMsg = message;
      this.botones = [];
    }
  }

  /** Reenvía el evento de la botonera */
  onSeleccion(event: { botonId: string; opcionId: string }) {
    console.log('Opción seleccionada:', event);
    // aquí podrías emitir hacia arriba si hace falta
  }
}
