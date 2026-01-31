import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BuscarDireccionService } from '@app/widget/buscarDireccion/services/buscar-direccion.service';
import { Direccion } from '@app/widget/buscarDireccion/interfaces/direccion.interface';
import { AutoCompleteEvent } from '@app/widget/buscarDireccion/interfaces/autoCompleteEvent.interface';
import { CommonModule } from '@angular/common';

/**
 * Componente encargado de realizar la búsqueda de direcciones y gestionar la interacción con el mapa.
 * Utiliza el servicio `BuscarDireccionService` para obtener sugerencias de direcciones en función del texto ingresado
 * por el usuario. Permite seleccionar una dirección de la lista de sugerencias y realizar acciones asociadas a la dirección seleccionada,
 * como centrar el mapa o hacer zoom en la ubicación de la dirección seleccionada.
 * @author Carlos Alberto Aristizabal Vargas
 * @date 02-04-2025
 * @version 1.0.1
 */

@Component({
  selector: 'app-buscar-direccion', // Selector HTML del componente
  standalone: true, // Define que el componente es independiente
  imports: [CommonModule, FormsModule, AutoCompleteModule], // Módulos necesarios para el funcionamiento del componente
  providers: [BuscarDireccionService],
  templateUrl: './buscar-direccion.component.html', // Plantilla del componente
  styleUrls: ['./buscar-direccion.component.scss'], // Estilos del componente
})
export class BuscarDireccionComponent {
  // Parametro de entrada que define sí se muestra o no el ícono de búsqueda
  @Input() isVisibleIconSearch = false;
  // Propiedad para almacenar el elemento seleccionado del autocompletado
  selectedItem: Direccion | null = null;

  // Propiedad para definir el texto del placeholder del autocompletado
  @Input() placeholder = 'Selecciona una dirección';

  // Parámetro de entrada que define si se muestra o no el dropdown en el autocompletado
  @Input() dropdown = 'true';

  // Parámetro de entrada que define el ícono que se muestra antes del texto en el autocompletado
  @Input() prependIcon: string | undefined;

  // Lista de elementos filtrados basada en la búsqueda del usuario
  filteredItems: Direccion[] = [];

  // Inyección del servicio BuscarDireccionService para manejar las búsquedas
  constructor(private buscarDireccionService: BuscarDireccionService) {
    this.buscarDireccionService.direccionSugerida.subscribe(results => {
      this.filteredItems = results;
    });
  }

  /**
   * Filtra las direcciones basadas en el texto ingresado por el usuario
   * @param event Evento emitido por el componente de autocompletado cuando el usuario escribe
   */
  filterItems(event: AutoCompleteEvent): void {
    const query = event.query; // Recupera el texto ingresado por el usuario

    // Si el texto ingresado tiene al menos un carácter, procede a realizar la búsqueda
    if (query && query.length >= 3) {
      // Llama al servicio para obtener las sugerencias de direcciones basadas en la consulta
      this.buscarDireccionService.buscarDireccionPorTexto(query);
    } else {
      // Si no hay texto ingresado, limpiar las sugerencias
      this.filteredItems = [];
    }
  }

  /**
   * Método que se ejecuta cuando el usuario selecciona una dirección del autocompletado
   */
  onDireccionSeleccionada(): void {
    // Verifica si hay un elemento seleccionado
    if (this.selectedItem) {
      // Llama al servicio para realizar alguna acción con la dirección seleccionada
      this.buscarDireccionService.buscarDireccionSeleccionada(
        this.selectedItem
      );
    }
  }

  /** Devuelve padding solo si hay ícono al inicio */
  get inputStyleClass(): string {
    return this.prependIcon ? 'pl-3' : '';
  }
}
