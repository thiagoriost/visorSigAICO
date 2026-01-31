import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// ==== PRIMENG MODULES ====
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';

// ==== SERVICES ====
import { BaseMapService } from '@app/widget/baseMap/services/base-map/base-map.service';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';

// ==== COMPONENTS ====
import { BaseMapItemComponent } from '@app/widget/baseMap/Components/base-map-item/base-map-item.component';

// ==== INTERFACES ====
import { CapaMapaBase } from '@app/core/interfaces/CapaMapaBase';
import { MapaBaseInterface } from '@app/shared/Interfaces/mapa-base/mapa-base-interface';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';

import { environment } from 'environments/environment';

/**
 * Componente que muestra la grilla de mapas base disponibles.
 * Se actualiza automáticamente cuando cambia la lista de mapas recibida desde el componente padre.
 *
 * @author Heidy
 */
@Component({
  selector: 'app-base-map',
  standalone: true,
  imports: [CommonModule, PanelModule, CardModule, BaseMapItemComponent],
  templateUrl: './base-map.component.html',
  styleUrl: './base-map.component.scss',
})
export class BaseMapComponent implements OnInit, OnChanges {
  /** Mapa base actualmente seleccionado */
  selectedItemId?: CapaMapaBase;
  /** Icono a mostrar en el mapa base seleccionado */
  @Input() icon = 'pi pi-check';

  /** Lista de mapas base a mostrar  */
  mapas: CapaMapaBase[] = [];

  /** Lista de nombres de mapas base (enums) a filtrar, opcional */
  @Input() nombresMapas?: MapasBase[];

  constructor(
    private baseMapService: BaseMapService,
    private mapaBaseService: MapaBaseService
  ) {}

  /** Inicializa el componente */
  ngOnInit(): void {
    this.cargarMapas();
  }

  /**
   * Detecta cambios en los @Input() del componente.
   * Si cambia la lista de nombresMapas, se recargan los mapas.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nombresMapas'] && !changes['nombresMapas'].firstChange) {
      this.cargarMapas();
    }
  }

  /**
   * Carga los mapas base según la lista recibida (o todos si no hay filtro)
   */
  cargarMapas(): void {
    const todos = this.mapaBaseService.getMapBases();

    // Soporte para [{label, value}] o [MapasBase.XYZ]
    type NombreMapaInput = MapasBase | { label: string; value: MapasBase };

    const nombresNormalizados: string[] = (this.nombresMapas ?? []).map(
      (n: NombreMapaInput) => {
        if (typeof n === 'object' && 'value' in n) {
          return n.value.toString();
        }
        return n.toString();
      }
    );

    // Filtra o carga todos
    const mapasBase: MapaBaseInterface[] =
      nombresNormalizados.length > 0
        ? todos.filter(m => nombresNormalizados.includes(m.name.toString()))
        : todos;

    // Convierte a tipo CapaMapaBase
    this.mapas = mapasBase.map(m => this.baseMapService.mapToCapaMapaBase(m));

    // Establece el mapa base seleccionado por defecto
    this.selectedItemId = this.mapas.find(
      m => m.id === environment.map.baseLayer
    );
  }

  /**
   * Cambia el mapa base actual en el visor.
   */
  changeLayer(mapa: CapaMapaBase): void {
    this.selectedItemId = mapa;
    this.baseMapService.changeBaseLayer(mapa);
  }
}
