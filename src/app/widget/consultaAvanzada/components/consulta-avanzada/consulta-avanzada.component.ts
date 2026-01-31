import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultaCapasComponent } from '@app/shared/components/consulta-capas/components/consulta-capas/consulta-capas.component';
import { CalculadoraComponent } from '../calculadora/calculadora.component';
import { BotonesConsultaComponent } from '@app/shared/components/botones-consulta/botones-consulta.component';
import { GeoConsultasService } from '@app/shared/services/geoConsultas/geo-consultas.service';
import { UrlWFSService } from '@app/shared/services/urlWFS/url-wfs.service';
import { XmlFilterGeneratorService } from '@app/shared/services/XmlFilterGenerator/xml-filter-generator.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

/**
 * Componente que permite realizar consultas avanzadas en un servicio WFS.
 * Facilita la selección de capas, atributos y valores, y la creación de expresiones de consulta.
 * Ejecuta consultas geográficas y muestra los resultados en una tabla de atributos.
 *
 * @author Heidy Paola Lopez Sanchez
 */
@Component({
  selector: 'app-consulta-avanzada',
  standalone: true,
  imports: [
    BotonesConsultaComponent,
    CalculadoraComponent,
    ConsultaCapasComponent,
    CommonModule,
    ToastModule,
  ],
  providers: [GeoConsultasService, UrlWFSService, XmlFilterGeneratorService],
  templateUrl: './consulta-avanzada.component.html',
  styleUrl: './consulta-avanzada.component.scss',
})
export class ConsultaAvanzadaComponent {
  @Input() isRoundedButton = true;
  @Input() isRaisedButton = true;
  // Referencia al componente hijo ConsultaCapasComponent para acceder a su estado y métodos
  @ViewChild(ConsultaCapasComponent)
  consultaCapasComponent!: ConsultaCapasComponent;

  // Referencia al componente hijo CalculadoraComponent para acceder a la expresión generada
  @ViewChild(CalculadoraComponent) calculadoraComponent!: CalculadoraComponent;

  // Referencia al componente hijo BotonesConsultaComponent para manejar el estado de carga
  @ViewChild(BotonesConsultaComponent)
  BotonesConsultaComponent!: BotonesConsultaComponent;

  // Capa seleccionada por el usuario
  selectedLayer: {
    label: string;
    value: string;
    name: string;
    urlServicioWFS: string;
  } | null = null;

  // Atributo seleccionado por el usuario
  selectedAttribute: { name: string; value: string } | null = null;

  // Valor seleccionado por el usuario
  selectedValue: { name: string; value: string } | null = null;

  // Inyección del servicio para ejecutar consultas WFS
  constructor(
    private geoConsultasService: GeoConsultasService,
    private messageService: MessageService, // Servicio para mostrar mensajes de notificación
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * Actualiza la capa seleccionada desde el componente hijo.
   * @param capa Capa seleccionada.
   */
  onCapaActualizada(
    capa: {
      label: string;
      value: string;
      name: string;
      urlServicioWFS: string;
    } | null
  ): void {
    this.selectedLayer = capa;
  }

  /**
   * Actualiza el atributo seleccionado desde el componente hijo.
   * @param atributo Atributo seleccionado.
   */
  onAtributoActualizado(
    atributo: { name: string; value: string } | null
  ): void {
    this.selectedAttribute = atributo;
  }

  /**
   * Actualiza el valor seleccionado desde el componente hijo.
   * @param valor Valor seleccionado.
   */
  onValorActualizado(valor: { name: string; value: string } | null): void {
    this.selectedValue = valor;
  }

  /**
   * Ejecuta la consulta WFS utilizando los parámetros seleccionados y la expresión construida.
   * Valida la entrada antes de enviar la solicitud.
   */
  onEjecutarConsulta(): void {
    if (
      this.consultaCapasComponent.formConsulta.invalid ||
      this.calculadoraComponent.formCalculadora.invalid
    ) {
      this.consultaCapasComponent.onvalidarCampos();
      this.calculadoraComponent.formCalculadora.markAllAsTouched();
      return;
    }
    // Muestra el estado de carga en el botón de consulta
    this.BotonesConsultaComponent.loading = true;

    // Obtiene la capa actualmente seleccionada desde el componente hijo
    const capa = this.consultaCapasComponent.selectedLayer;

    // Validación: se requiere una capa válida con URL
    if (!capa || !capa.urlServicioWFS) {
      this.messageService.add({
        severity: 'error',
        summary: 'La capa no es válida',
        detail: 'Debe seleccionar una capa válida con un servicio WFS.',
        sticky: true,
      });
      return;
    }

    // Almacena el nombre de la capa a consultar
    const capaConsultar = capa.name;

    // Ejecuta la consulta usando el servicio
    this.geoConsultasService
      .ejecutarConsulta(
        capa.urlServicioWFS, // URL del servicio WFS
        capaConsultar, // Nombre de la capa
        this.calculadoraComponent.formCalculadora.controls['expresion'].value // Expresión de filtrado
      )
      .then(xml => {
        // Transforma la respuesta XML en GeoJSON
        const geojson =
          this.geoConsultasService.transformarAFormatoGeoJSONData(xml);

        // Muestra los resultados en la tabla de atributos
        this.geoConsultasService.mostrarResultadosEnTabla(capa.label, geojson);

        // Finaliza el estado de carga del botón
        this.BotonesConsultaComponent.loading = false;
      })
      .catch(err => {
        // Maneja errores y muestra mensaje en pantalla
        this.messageService.add({
          severity: 'error',
          summary: 'Error durante la consulta avanzada',
          detail: err,
          sticky: true,
        });

        this.BotonesConsultaComponent.loading = false;
      });
  }

  /**
   * Limpia los campos y el estado de los componentes hijos.
   */
  onLimpiarCampos(): void {
    // Limpia los campos de selección de capa, atributo y valor
    this.consultaCapasComponent.onLimpiarCampos();
    // borra los resultados en la tabla de atributos
    this.geoConsultasService.cerrarTabla();
    // Limpia la expresión lógica en el componente de calculadora
    this.calculadoraComponent.onLimpiarCampos();
  }
}
