import { Component, Input, OnInit } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { ImageModule } from 'primeng/image';
import { ScrollPanelModule } from 'primeng/scrollpanel';

//==========Interfaces==========
import { ResultIdentifyWMSQuery } from '@app/widget/identify/interfaces/ResultIdentifyQuery';
import { ResultPairs } from '@app/widget/identify/interfaces/ResultPairs';
import { ProcessPropertiesFeatureService } from '../../services/process-properties-feature/process-properties-feature.service';
import { ImageListRendererComponent } from '../image-list-renderer/image-list-renderer.component';

/**
 * @description Componente para mostrar los resultados de la consulta de identificacion de WMS
 * @author Andres Fabian Simbaqueba del Rio <<anfasideri@hotmail.com>>
 * @date 23/12/2024
 * @class ResultComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-result',
  standalone: true,
  imports: [
    DividerModule,
    ImageModule,
    ScrollPanelModule,
    ImageListRendererComponent,
  ],
  providers: [ProcessPropertiesFeatureService],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss',
})
export class ResultComponent implements OnInit {
  @Input({ required: true }) result: ResultIdentifyWMSQuery | null = null;
  resultArray: ResultPairs[] = []; //array de key-value-type
  resultImages: string[] = []; //array de imagenes

  constructor(
    private processPropertiesFeatureService: ProcessPropertiesFeatureService
  ) {}
  ngOnInit(): void {
    this.processPropertiesFeatureService.convertObjectToArray(this.result);
    this.resultArray = this.processPropertiesFeatureService.resultArray;
    this.resultImages = this.processPropertiesFeatureService.resultImages;
  }
}
