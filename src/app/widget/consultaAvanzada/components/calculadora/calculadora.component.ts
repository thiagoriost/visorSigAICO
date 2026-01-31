import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Componente para construir expresiones lógicas de filtrado a partir de atributos,
 * operadores y valores de una capa geográfica, y convertir dichas expresiones en filtros XML compatibles con el estándar OGC para ser utilizados en consultas WFS.
 * Permite ingresar una URL y obtener las capas disponibles en el WMS.
 * @author Heidy Paola Lopez Sanchez
 */
@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [
    ButtonModule,
    FormsModule,
    CommonModule,
    TextareaModule,
    FloatLabel,
    TooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './calculadora.component.html',
  styleUrl: './calculadora.component.scss',
})
export class CalculadoraComponent implements OnChanges {
  // Recibe el atributo seleccionado de la capa para generar la expresión
  @Input() atributo: { name: string; value: string } | null = null;

  // Recibe el valor que se usará en la expresión lógica
  @Input() valor: { name: string; value: string } | null = null;

  @Input() isRoundedButton = true; //indica si los botones son redondeados
  @Input() isRaisedButton = true; // indica si ñlos botones son

  formCalculadora: FormGroup;

  // Lista de operadores lógicos y de comparación disponibles para la expresión
  operators = [
    '=',
    '<>',
    '>',
    '<',
    '>=',
    '<=',
    'And',
    'Or',
    'Like',
    'Null',
    'Not',
    'Is',
  ];

  constructor(private fb: FormBuilder) {
    // Utilidad para construir formularios reactivos
    this.formCalculadora = this.fb.group({
      // Control para la capa seleccionada, obligatorio
      expresion: ['', Validators.required],
    });
  }
  /**
   * Este método se ejecuta cada vez que las entradas de los atributos o valores cambian.
   * Actualiza la expresión agregando el atributo y valor seleccionados.
   * @param changes Los cambios en las propiedades de entrada
   */
  ngOnChanges(changes: SimpleChanges): void {
    const control = this.formCalculadora.get('expresion');
    let expresionActual = control?.value || '';

    if (changes['atributo'] && this.atributo) {
      expresionActual += ` ${this.atributo.value} `;
    }

    if (changes['valor'] && this.valor) {
      expresionActual += ` '${this.valor.value}' `;
    }

    control?.setValue(expresionActual);
  }

  /**
   * Inserta un texto (operador o valor) en la posición del cursor en el área de texto.
   * Esto permite construir dinámicamente la expresión lógica.
   * @param text El texto que se insertará en la expresión
   * @param textarea El área de texto en donde se insertará el texto
   */
  insertText(text: string, textarea: HTMLTextAreaElement): void {
    const control = this.formCalculadora.get('expresion');
    const expresionActual = control?.value || '';

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const before = expresionActual.substring(0, start);
    const after = expresionActual.substring(end);

    const nuevaExpresion = before + ` ${text} ` + after;
    control?.setValue(nuevaExpresion);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length + 2;
    }, 0);
  }

  /**
   * Limpia el contenido de la expresión, restableciendo el campo de texto.
   * Este método se utiliza, al hacer clic en el botón "Limpiar".
   */
  onLimpiarCampos(): void {
    this.formCalculadora.reset();
  }
}
