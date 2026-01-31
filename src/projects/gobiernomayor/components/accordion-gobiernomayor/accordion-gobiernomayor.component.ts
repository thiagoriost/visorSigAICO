// accordion-gobiernomayor.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { DividerModule } from 'primeng/divider';
import { ContentTableV4Component } from '@app/widget/content-table-v4/components/content-table-v4/content-table-v4.component';

/**
 * Componente encargado de renderizar los elementos del componente central de la barra lateral del visor
 * @date 26-08-2025
 * @autor Sergio Alonso Mariño
 */
@Component({
  selector: 'app-accordion-gobiernomayor',
  standalone: true,
  imports: [
    AccordionModule,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    InputGroupModule,
    DividerModule,
    ContentTableV4Component, // <-- integrar la tabla de contenido
  ],
  templateUrl: './accordion-gobiernomayor.component.html',
})
export class AccordionGobiernoMayorComponent {
  @Output() helpClick = new EventEmitter<void>();
  @Output() baseLayersClick = new EventEmitter<void>();
  @Output() logoClick = new EventEmitter<void>();
}
