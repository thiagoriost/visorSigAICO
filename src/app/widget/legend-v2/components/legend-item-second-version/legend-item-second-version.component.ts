import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { ImageModule } from 'primeng/image';
import { AccordionModule } from 'primeng/accordion';

/**
 * Componente que renderiza la leyenda de la capa
 * @date 29-07-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-legend-item-second-version',
  standalone: true,
  imports: [ImageModule, CommonModule, AccordionModule],
  providers: [],
  templateUrl: './legend-item-second-version.component.html',
  styleUrl: './legend-item-second-version.component.scss',
})
export class LegendItemSecondVersionComponent implements OnInit {
  @Input({ required: true }) layer:
    | (LayerStore & { leyendaUrl?: string })
    | undefined = undefined; //Capa con la URL de leyenda
  @Input() isCollapsedLegend = false; //variable para indicar si el panel incia colapsado
  isExpandedPanel = ''; //valor para indicar si el panel está colpasado o exapndido

  /**
   * Se valida el valor de la variable de colapsado del panel y se asigna el valor
   */
  ngOnInit(): void {
    this.isExpandedPanel = this.isCollapsedLegend ? '0' : '1';
  }
}
