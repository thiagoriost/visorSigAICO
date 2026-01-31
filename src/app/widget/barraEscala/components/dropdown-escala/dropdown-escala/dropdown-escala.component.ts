import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Escala } from '@app/widget/barraEscala/interface/escala';
import { EscalaService } from '@app/widget/barraEscala/services/escala.service';
import { Observable, of } from 'rxjs';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';

/**
 * @description
 * Componente que muestra un dropdown (menú desplegable) con la lista de escalas disponibles
 * para el mapa. Permite al usuario seleccionar una escala y notifica al servicio `EscalaService`
 * para actualizar la escala activa.
 * @author [Heidy Paola Lopez Sanchez ]
 */

@Component({
  selector: 'app-dropdown-escala',
  standalone: true,
  imports: [SelectModule, CommonModule, FormsModule, Tooltip],
  templateUrl: './dropdown-escala.component.html',
  styleUrl: './dropdown-escala.component.scss',
})
export class DropdownEscalaComponent implements OnInit {
  /**
   * Observable que contiene la lista de escalas disponibles.
   * Se utiliza en la plantilla para poblar el menú desplegable.
   */
  escalas$!: Observable<Escala[]>;

  /**
   * Observable que representa la escala actualmente seleccionada.
   * Permite mantener la sincronización visual con el estado global del servicio.
   */
  escalaSelected$!: Observable<Escala>;

  /**
   * @constructor
   * Inyecta el servicio `EscalaService` que maneja la lógica de las escalas del mapa.
   * @param escalaService Servicio encargado de la gestión de escalas.
   */
  constructor(private escalaService: EscalaService) {}

  ngOnInit(): void {
    // Inicializa el servicio de escalas
    this.escalaService.inicializarEscala(10, 300);

    // Carga la lista de escalas como Observable
    this.escalas$ = of(this.escalaService.getEscalas());

    // Escucha la escala seleccionada actual
    this.escalaSelected$ = this.escalaService.escalaSelected$;
  }

  // Evento disparado al cambiar la selección
  onChangeEscala(event: SelectChangeEvent): void {
    const escalaSeleccionada = event.value as Escala;
    this.escalaService.onChangeEscala(escalaSeleccionada);
  }
}
