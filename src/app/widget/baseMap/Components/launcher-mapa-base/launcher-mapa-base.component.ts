import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ==== PRIMENG ====
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

// ==== COMPONENTE HIJO ====
import { BaseMapComponent } from '@app/widget/baseMap/Components/base-map/base-map.component';

// ==== ENUMS ====
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';

// ==== SERVICIO ====
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';

/**
 * Componente que permite seleccionar una lista de mapas base desde un dropdown
 * y mostrar el componente <app-base-map> con solo esos mapas.
 * @author Heidy Paola Lopez Sanchez
 */
@Component({
  selector: 'app-launcher-mapa-base',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MultiSelectModule,
    ButtonModule,
    CardModule,
    BaseMapComponent,
  ],
  templateUrl: './launcher-mapa-base.component.html',
  styleUrl: './launcher-mapa-base.component.scss',
})
export class LauncherMapaBaseComponent {
  /** Lista de opciones disponibles (label + value) */
  opcionesMapas: { label: string; value: MapasBase }[] = [];

  /** Mapas seleccionados por el usuario */
  seleccionados: MapasBase[] = [];

  /** Lista final de mapas para mostrar en <app-base-map> */
  mapasParaMostrar: MapasBase[] = [];

  constructor(private mapaBaseService: MapaBaseService) {
    // Cargar todas las opciones disponibles desde el servicio
    this.opcionesMapas = this.mapaBaseService.getAllMapOptions();
  }

  /**
   * Confirma la selección del usuario y actualiza la lista
   * de mapas a pasar al componente <app-base-map>
   */
  mostrarMapasSeleccionados(): void {
    console.log('Mapas seleccionados:', this.seleccionados);
    this.mapasParaMostrar = [...this.seleccionados];
  }
}
