import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { Select } from 'primeng/select';
import { LoadingDataMaskWithOverlayComponent } from '@app/shared/components/loading-data-mask-with-overlay/loading-data-mask-with-overlay.component';

interface City {
  name: string;
  code: string;
}
@Component({
  selector: 'app-patrones',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    FloatLabel,
    ToastModule,
    CardModule,
    LoadingDataMaskWithOverlayComponent,
    Select,
  ],
  providers: [MessageService],
  templateUrl: './patrones.component.html',
  styleUrl: './patrones.component.scss',
})
export class PatronesComponent {
  erroresVisibles = false;

  iconosOpiac = [
    'ICON-VISOR-OPIAC_ACERCAR',
    'ICON-VISOR-OPIAC_AJUSTES',
    'ICON-VISOR-OPIAC_ALEJAR',
    'ICON-VISOR-OPIAC_AYUDA',
    'ICON-VISOR-OPIAC_BUFFER',
    'ICON-VISOR-OPIAC_BUSCAR',
    'ICON-VISOR-OPIAC_CAPA-ABIERTA',
    'ICON-VISOR-OPIAC_CAPA-CERRADA',
    'ICON-VISOR-OPIAC_CARPETA',
    'ICON-VISOR-OPIAC_CERRAR',
    'ICON-VISOR-OPIAC_COLOMBIA',
    'ICON-VISOR-OPIAC_CONSULTA-AVANZADA',
    'ICON-VISOR-OPIAC_CONSULTA-SIMPLE',
    'ICON-VISOR-OPIAC_DESPLEGAR',
    'ICON-VISOR-OPIAC_DIBUJAR',
    'ICON-VISOR-OPIAC_EDICION',
    'ICON-VISOR-OPIAC_IDENTIFICAR',
    'ICON-VISOR-OPIAC_INFO',
    'ICON-VISOR-OPIAC_INTERSECCION',
    'ICON-VISOR-OPIAC_MEDIR',
    'ICON-VISOR-OPIAC_MINIMIZAR',
    'ICON-VISOR-OPIAC_SALIDA-GRAFICA',
    'ICON-VISOR-OPIAC_SELECCION-ESPACIAL',
    'ICON-VISOR-OPIAC_UBICAR-COORDENADA',
  ];

  loaderContenidoEsVisible = false;

  loaderFullScreenEsVisible = false;

  cities: City[] | undefined = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' },
  ];

  constructor(private messageService: MessageService) {}

  /**
   * Cambia el estado de visibilidad de los errores en el formulario
   */
  mostrarErrores() {
    this.erroresVisibles = !this.erroresVisibles;
  }

  /**
   * Muestra un mensaje de error en pantalla simulando un fallo al realizar una
   * petición HTTP externa.
   */
  mostrarMensajeFalloRequest() {
    this.messageService.add({
      severity: 'error',
      summary: 'Procesamiento Intersección',
      detail: 'Servidor no responde',
      sticky: true,
    });
  }

  /**
   * Copia el texto al portapapeles
   *
   * @param texto Texto a copiar
   */
  copiarTexto(texto: string) {
    navigator.clipboard.writeText(texto).then(() => {
      console.log('Texto copiado:', texto);
    });
  }

  /**
   * Muestra el loader por 5 segundos
   * Version contenida
   */
  mostrarLoader() {
    this.loaderContenidoEsVisible = true;
    // en 5 segundos se oculta el loader
    setTimeout(() => {
      this.loaderContenidoEsVisible = false;
    }, 5000);
  }

  /**
   * Muestra el loader por 5 segundos
   * Version Full Screen
   */
  mostrarLoaderFullScreen() {
    this.loaderFullScreenEsVisible = true;
    // en 5 segundos se oculta el loader
    setTimeout(() => {
      this.loaderFullScreenEsVisible = false;
    }, 5000);
  }
}
