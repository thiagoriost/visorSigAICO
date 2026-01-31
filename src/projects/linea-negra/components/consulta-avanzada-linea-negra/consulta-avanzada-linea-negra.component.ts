import { Component } from '@angular/core';
import { ConsultaAvanzadaComponent } from '@app/widget/consultaAvanzada/components/consulta-avanzada/consulta-avanzada.component';

/**
 * Componente que encapsula el widget de consulta avanzada para dale estilos
 * redondeados a los botones
 * @date 03-10-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-consulta-avanzada-linea-negra',
  imports: [ConsultaAvanzadaComponent],
  templateUrl: './consulta-avanzada-linea-negra.component.html',
  styleUrl: './consulta-avanzada-linea-negra.component.scss',
})
export class ConsultaAvanzadaLineaNegraComponent {
  isRoundedButton = false; //indica si los botones de la calculadora son redondeados
  isRaisedButton = true; //indica si el boton tiene sombra sobre el fondo del componente
}
