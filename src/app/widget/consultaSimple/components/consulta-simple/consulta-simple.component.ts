import { Component, ViewChild } from '@angular/core';
import { BotonesConsultaComponent } from '@app/shared/components/botones-consulta/botones-consulta.component';
import { ConsultaCapasComponent } from '@app/shared/components/consulta-capas/components/consulta-capas/consulta-capas.component';
import { GeoConsultasService } from '@app/shared/services/geoConsultas/geo-consultas.service';
import { UrlWFSService } from '@app/shared/services/urlWFS/url-wfs.service';
import { XmlFilterGeneratorService } from '@app/shared/services/XmlFilterGenerator/xml-filter-generator.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

/**
 * Componente para realizar consultas simples sobre un servicio WFS.
 * Permite seleccionar capas, atributos y valores, y ejecutar consultas geográficas.
 * Los resultados de la consulta se muestran en una tabla de atributos.
 *
 * @author Heidy Paola Lopez Sanchez
 */
@Component({
  selector: 'app-consulta-simple',
  standalone: true,
  imports: [ConsultaCapasComponent, ToastModule, BotonesConsultaComponent],
  providers: [GeoConsultasService, UrlWFSService, XmlFilterGeneratorService],
  templateUrl: './consulta-simple.component.html',
  styleUrls: ['./consulta-simple.component.scss'],
})
export class ConsultaSimpleComponent {
  // Referencia al componente hijo ConsultaCapas
  @ViewChild(ConsultaCapasComponent)
  consultaCapasComponent!: ConsultaCapasComponent;

  // Referencia al componente hijo BotonesConsulta
  @ViewChild(BotonesConsultaComponent)
  botonesConsultaComponent!: BotonesConsultaComponent;

  constructor(
    private geoConsultasService: GeoConsultasService, // Servicio para ejecutar consultas geográficas
    private messageService: MessageService // Servicio para mostrar mensajes de notificación
  ) {}

  /**
   * Método que se ejecuta al presionar el botón de ejecutar consulta.
   * Realiza validaciones de los campos seleccionados y ejecuta la consulta WFS.
   */
  onEjecutarConsulta(): void {
    console.log('Ejecutando consulta simple...');
    if (this.consultaCapasComponent.formConsulta.invalid) {
      this.consultaCapasComponent.onvalidarCampos();
      return;
    }
    // Activar el estado de carga en el botón
    this.botonesConsultaComponent.loading = true;

    // Obtener los valores seleccionados desde el componente de capas
    const capa = this.consultaCapasComponent.selectedLayer;
    const atributo = this.consultaCapasComponent.selectedAttribute;
    const valor = this.consultaCapasComponent.selectedValue;
    console.log('valor seleccionada:', valor);

    // Validar que se haya seleccionado una capa con URL válida
    if (!capa || !capa.urlServicioWFS) {
      this.messageService.add({
        severity: 'error',
        summary: 'La capa no es válida',
        detail: 'Debe seleccionar una capa válida con un servicio WFS.',
        sticky: true,
      });
      this.botonesConsultaComponent.loading = false;
      return;
    }

    // Validar que se haya seleccionado un atributo y un valor
    if (!atributo || !valor) {
      this.botonesConsultaComponent.loading = false;
      return;
    }

    // Extraer nombre interno de la capa
    const capaConsultar = capa.name;

    // Construcción de expresión de consulta con el formato: atributo = 'valor'
    const expression = `${atributo.value} = '${valor.value}'`;

    // Ejecutar la consulta al servicio WFS con la capa, expresión y URL
    this.geoConsultasService
      .ejecutarConsulta(capa.urlServicioWFS, capaConsultar, expression)
      .then(xml => {
        console.log('transformando geojson');
        // Transformar respuesta XML a GeoJSON
        const geojson =
          this.geoConsultasService.transformarAFormatoGeoJSONData(xml);
        console.log('finalizado');
        // Mostrar resultados en la tabla de atributos
        this.geoConsultasService.mostrarResultadosEnTabla(capa.label, geojson);
        console.log('GeoJSON:', geojson);
        // Desactivar el estado de carga después de 5 segundos
        setTimeout(() => {
          this.botonesConsultaComponent.loading = false;
        }, 5000);
      })
      .catch(err => {
        // Mostrar error en consola
        this.messageService.add({
          severity: 'error',
          summary: 'Error durante la consulta',
          detail: err,
          sticky: true,
        });

        // Desactivar el estado de carga
        this.botonesConsultaComponent.loading = false;
      });
  }

  /**
   * Método que limpia los campos de selección de capa, atributo y valor.
   * Invoca el método correspondiente del componente hijo.
   */
  onLimpiarCampos(): void {
    this.consultaCapasComponent.onLimpiarCampos();
    this.geoConsultasService.cerrarTabla();
  }
}
