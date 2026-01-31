import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnInit,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { EscalaService } from '@app/widget/barraEscala/services/escala.service';

/**
 * Componente encargado de renderizar la escala gráfica de OpenLayers.
 * Recibe el tipo de escala ('scaleline' o 'scalebar') y la muestra en un contenedor.
 * @author [Heidy Paola Lopez Sanchez ]
 */

@Component({
  selector: 'app-escala',
  imports: [],
  templateUrl: './escala.component.html',
  styleUrl: './escala.component.scss',
})
export class EscalaComponent implements OnInit, OnChanges {
  /** Tipo de escala: puede cambiar dinámicamente entre 'scaleline' y 'scalebar' */
  @Input() scaleType: 'scaleline' | 'scalebar' = 'scaleline';

  /** Contenedor HTML donde se insertará la barra de escala */
  @ViewChild('scaleLineContainer', { static: true })
  scaleLineContainer!: ElementRef<HTMLDivElement>;

  /**
   * Constructor que inyecta el servicio de escalas para inicializar y actualizar controles.
   */
  constructor(private escalaService: EscalaService) {}

  /**
   * Inicializa la barra de escala al cargar el componente.
   */
  ngOnInit(): void {
    this.initScaleControl();
  }

  /**
   * Detecta cambios en los @Input y actualiza el control si cambia el tipo de escala.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scaleType'] && !changes['scaleType'].firstChange) {
      this.initScaleControl();
    }
  }

  /**
   * Crea control de escala.
   */
  private initScaleControl(): void {
    this.escalaService.initScaleLineControl(
      this.scaleLineContainer,
      this.scaleType
    );
  }
}
