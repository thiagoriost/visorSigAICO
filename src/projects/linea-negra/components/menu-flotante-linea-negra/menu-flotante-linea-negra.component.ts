import { Component } from '@angular/core';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';
import { BotoneraVerticalComponent } from '@app/widget-ui/components/botoneraVertical/components/botonera-vertical/botonera-vertical.component';
import { BotonConfigModel } from '@app/widget-ui/components/botoneraVertical/interfaces/boton-config.model';
import { Store } from '@ngrx/store';

/**
 * Componente que contiene las opciones disponibles que se renderizarán en
 * el componente de botonera flotante
 * @date 22-09-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-menu-flotante-linea-negra',
  imports: [BotoneraVerticalComponent],
  templateUrl: './menu-flotante-linea-negra.component.html',
  styleUrl: './menu-flotante-linea-negra.component.scss',
})
export class MenuFlotanteLineaNegraComponent {
  menuOpciones: BotonConfigModel[] = [
    {
      id: 'BaseMap',
      icono: 'ln-maps',
      texto: 'Mapa base',
    },
    {
      id: 'ContentTable',
      icono: 'ln-capas',
      texto: 'Tabla de contenido',
    },
    {
      id: 'Leyenda',
      icono: 'ln-leyenda',
      texto: 'Leyenda',
    },
    {
      id: 'Identify',
      icono: 'ln-informacion',
      texto: 'Identificar',
    },
    {
      id: 'seleccionEspacial',
      icono: 'ln-consulta_avanzada',
      texto: 'Seleccion espacial',
    },
    { id: 'addData', icono: 'ln-add_data', texto: 'Añadir datos' },
    {
      id: 'Dibujar',
      icono: 'ln-dibujar',
      texto: 'Dibujar',
    },
    { id: 'medir', icono: 'ln-ruler', texto: 'Medir' },
    {
      id: 'ConsultaSimple',
      icono: 'ln-consulta_simple',
      texto: 'Consulta simple',
    },
    {
      id: 'ubicarCoordenada',
      icono: 'ln-world',
      texto: 'Ubicar coordenada',
    },
    {
      id: 'salidaGrafica',
      icono: 'pi pi-print',
      texto: 'Salida gráfica',
    },
    {
      id: 'ayuda',
      icono: 'pi pi-question',
      texto: 'Ayuda',
    },
  ];

  constructor(
    private userInterfaceStore: Store<{ userInterface: UserInterfaceState }>
  ) {}

  /**
   * Gestion de evento de seleccion en menu
   * Dispara una mutacion en el store para que el widget WindowSingleComponentRender
   * muestre el widget seleccionado
   * @param event
   */
  onSeleccion(event: { botonId: string; opcionId: string }) {
    // dispara mutacion en el store
    this.userInterfaceStore.dispatch(
      SetSingleComponentWidget({ nombre: event.opcionId })
    );
  }
}
