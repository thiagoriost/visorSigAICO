import { Component } from '@angular/core';
import { BotonConfigModel } from '@app/widget-ui/components/botoneraVertical/interfaces/boton-config.model';
// ****** COMPONENTS ******
import { BotoneraVerticalComponent } from '@app/widget-ui/components/botoneraVertical/components/botonera-vertical/botonera-vertical.component';
// ****** STORE ******
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { Store } from '@ngrx/store';
import {
  SetSingleComponentWidget,
  AbrirOverlayWidget,
} from '@app/core/store/user-interface/user-interface.actions';
// ***** SERVICES *****
import { AppConfigService } from '@app/core/services/app-config/app-config.service';

/**
 * @description Componente del menu flotante para visor de OPIAC
 * @author Juan Carlos Valderrama Gonzalez
 */
@Component({
  selector: 'app-floating-menu',
  standalone: true,
  imports: [BotoneraVerticalComponent],
  templateUrl: './floating-menu.component.html',
  styleUrl: './floating-menu.component.scss',
})
export class FloatingMenuComponent {
  // Opciones del menu - id son los nombres de los widgets en user-interface.service
  menuOpciones: BotonConfigModel[] = [
    {
      id: 'DescargarManual',
      icono: 'pi pi-question',
      texto: 'Ayuda',
    },
    {
      id: 'herramientas',
      icono: 'ICON-VISOR-OPIAC_EDICION',
      texto: 'Herramientas',
      opciones: [
        {
          id: 'Buffer',
          icono: 'ICON-VISOR-OPIAC_BUFFER',
          texto: 'Área de influencia (Buffer)',
        },
        { id: 'Dibujar', icono: 'ICON-VISOR-OPIAC_DIBUJAR', texto: 'Dibujar' },
        {
          id: 'Intersección',
          icono: 'ICON-VISOR-OPIAC_INTERSECCION',
          texto: 'Intersección',
        },
        { id: 'Medicion', icono: 'ICON-VISOR-OPIAC_MEDIR', texto: 'Medir' },
        {
          id: 'UbicarMedianteCoordenadas',
          icono: 'ICON-VISOR-OPIAC_UBICAR-COORDENADA',
          texto: 'Ubicar coordenada',
        },
      ],
    },
    {
      id: 'consulta',
      icono: 'ICON-VISOR-OPIAC_BUSCAR',
      texto: 'Consulta',
      opciones: [
        {
          id: 'ConsultaSimple',
          icono: 'ICON-VISOR-OPIAC_CONSULTA-SIMPLE',
          texto: 'Consulta simple',
        },
        {
          id: 'ConsultaAvanzada',
          icono: 'ICON-VISOR-OPIAC_CONSULTA-AVANZADA',
          texto: 'Consulta avanzada',
        },
        {
          id: 'Identify',
          icono: 'ICON-VISOR-OPIAC_IDENTIFICAR',
          texto: 'Identificar',
        },
        {
          id: 'SeleccionEspacial',
          icono: 'ICON-VISOR-OPIAC_SELECCION-ESPACIAL',
          texto: 'Selección espacial',
        },
        {
          id: 'ExportarMapa2',
          icono: 'ICON-VISOR-OPIAC_SALIDA-GRAFICA',
          texto: 'Salida gráfica',
        },
      ],
    },
    {
      id: 'Geoportal',
      icono: 'pi pi-chart-bar',
      texto: 'Datos y Cifras',
    },
  ];

  constructor(
    private userInterfaceStore: Store<{ userInterface: UserInterfaceState }>,
    private appConfigService: AppConfigService
  ) {}

  /**
   * Gestion de evento de seleccion en menu
   * Dispara una mutacion en el store para que el widget WindowSingleComponentRender
   * muestre el widget seleccionado
   * @param event
   */
  onSeleccion(event: { botonId: string; opcionId: string }) {
    // Si el opcionId es ExportarMapa2  se debe abrir como overlayWidget
    if (event.opcionId === 'ExportarMapa2') {
      this.userInterfaceStore.dispatch(
        AbrirOverlayWidget({ nombre: event.opcionId, estado: false })
      );
      setTimeout(() => {
        this.userInterfaceStore.dispatch(
          AbrirOverlayWidget({ nombre: event.opcionId, estado: true })
        );
      }, 200);
      return;
    }
    // Si el opcionId es Geoportal , se debe obtener de la configuracion geoportalUrl y abrir en un nuevo tab del navegador esta pagina
    if (event.opcionId === 'Geoportal') {
      window.open(this.appConfigService.get<string>('geoportalUrl'), '_blank');
      return;
    }
    // dispara mutacion en el store
    this.userInterfaceStore.dispatch(
      SetSingleComponentWidget({ nombre: event.opcionId })
    );
  }
}
