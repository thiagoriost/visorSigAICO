import { Component, Input, OnInit } from '@angular/core';
import { ResultIdentifyWMSQuery } from '@app/widget/identify/interfaces/ResultIdentifyQuery';
import { ResultPairs } from '@app/widget/identify/interfaces/ResultPairs';
import { TableModule } from 'primeng/table';
import { ProcessPropertiesFeatureService } from '../../services/process-properties-feature/process-properties-feature.service';
import { ImageListRendererComponent } from '../image-list-renderer/image-list-renderer.component';
import { NgClass } from '@angular/common';

/**
 * Componente para mostrar los resultados de seleccionar una geometria
 * @date 2025/10/08
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-result-v2',
  imports: [TableModule, ImageListRendererComponent, NgClass],
  providers: [ProcessPropertiesFeatureService],
  templateUrl: './result-v2.component.html',
  styleUrl: './result-v2.component.scss',
})
export class ResultV2Component implements OnInit {
  @Input({ required: true }) result: ResultIdentifyWMSQuery | null = null;
  @Input() textColorClassForRows = 'text-black-alpha-90'; //clase para el color del texto de las filas
  @Input() textColorClassForTitles = 'text-black-alpha-80'; //clase para el color del texto de los headers de la tabla
  @Input() textColorImageRendererText = 'text-black'; //clase para el color del texto del componente que renderiza las imagenes
  @Input() emptyListMessageImageRenderer =
    'No se encontraron imágenes para mostrar'; //mensaje para mostrar cuando la lista de imagenes esta vacia
  resultArray: ResultPairs[] = []; //array de key-value-type
  resultImages: string[] = []; //array de URLS

  constructor(
    private processPropertiesFeatureService: ProcessPropertiesFeatureService
  ) {}

  /**
   * Invoca al servicio para procesar el feature
   * Obtiene los datos procesados desde el servicio y los renderiza
   */
  ngOnInit(): void {
    this.processPropertiesFeatureService.convertObjectToArray(this.result);
    this.resultArray = this.processPropertiesFeatureService.resultArray;
    this.resultImages = this.processPropertiesFeatureService.resultImages;
  }
}
