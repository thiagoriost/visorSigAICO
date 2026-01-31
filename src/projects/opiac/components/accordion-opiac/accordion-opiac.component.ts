import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { ContentTableToggleSwitchComponent } from '@app/widget/content-table-with-toggle-switch/components/content-table-toggle-switch/content-table-toggle-switch.component';
import { AddWmsComponent } from '@app/widget/add-wms/components/add-wms/add-wms.component';
import { AddDataFileComponent } from '@app/widget/addDataFile/components/add-data-file/add-data-file.component';
import { ScrollPanelModule } from 'primeng/scrollpanel';

/**
 * Componente encargado de renderizar los elementos del componente central de la barra lateral del visor
 * @date 20-06-2025
 * @author Andres Fabian Simbaqueba Del Rio
 * @author Juan Carlos Valderrama Gonzalez
 */
@Component({
  selector: 'app-accordion-opiac',
  standalone: true,
  imports: [
    AccordionModule,
    ContentTableToggleSwitchComponent,
    AddWmsComponent,
    AddDataFileComponent,
    ScrollPanelModule,
  ],
  templateUrl: './accordion-opiac.component.html',
  styleUrl: './accordion-opiac.component.scss',
})
export class AccordionOpiacComponent {}
