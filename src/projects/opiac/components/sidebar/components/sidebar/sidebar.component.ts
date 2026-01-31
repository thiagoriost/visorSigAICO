import { Component } from '@angular/core';
import { SidebarLayoutComponent } from '@projects/opiac/components/sidebar/components/sidebar-layout/sidebar-layout.component';
import { WorkArea2LeyendaComponent } from '@projects/opiac/components/work-area2-leyenda/work-area2-leyenda.component';
import { AccordionOpiacComponent } from '@projects/opiac/components/accordion-opiac/accordion-opiac.component';
import { BuscarDireccionComponent } from '@app/widget/buscarDireccion/components/buscar-direccion/buscar-direccion.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    SidebarLayoutComponent,
    WorkArea2LeyendaComponent,
    AccordionOpiacComponent,
    BuscarDireccionComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {}
