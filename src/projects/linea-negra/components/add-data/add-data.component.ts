import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { AddDataFileComponent } from '@app/widget/addDataFile/components/add-data-file/add-data-file.component';
import { AddWmsComponent } from '@app/widget/add-wms/components/add-wms/add-wms.component';

/**
 * Componente que renderiza dos tabs para añadir datos WMS y/o URL
 * @date 30-09-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-add-data',
  imports: [TabsModule, AddDataFileComponent, AddWmsComponent],
  templateUrl: './add-data.component.html',
  styleUrl: './add-data.component.scss',
})
export class AddDataComponent {}
