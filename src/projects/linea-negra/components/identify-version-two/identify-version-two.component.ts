import { Component, OnInit } from '@angular/core';
import { MapState } from '@app/core/interfaces/store/map.model';
import { selectIdentifiedGeometry } from '@app/core/store/map/map.selectors';
import { IdentifyComponent } from '@app/widget/identify/components/identify/identify.component';
import { GeometryIdentified } from '@app/widget/identify/interfaces/GeometryIdentified';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { Subject, takeUntil } from 'rxjs';
import { ResultV2Component } from '@app/widget/identify/components/result-v2/result-v2.component';
import { IdentifyService } from '@app/widget/identify/services/identify-service/identify.service';

/**
 * Componente que contiene el widget de identificar para el proyecto de linea negra
 * @date 2025/10/08
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-identify-version-two',
  imports: [IdentifyComponent, ButtonModule, ResultV2Component],
  providers: [IdentifyService],
  templateUrl: './identify-version-two.component.html',
  styleUrl: './identify-version-two.component.scss',
})
export class IdentifyVersionTwoComponent implements OnInit {
  result: GeometryIdentified | undefined = undefined; //variable para mostrar el resultado de la geometria identificada
  private destroy$ = new Subject<void>();

  /**
   * Crear una instancia del componente
   * @param formBuilder constructor de formularios
   * @param mapStore //store de redux
   * @param identifyService // servicio para identificar geometrias
   * @param identifyQueryService //servicio para consultar geometrias
   */
  constructor(
    private mapStore: Store<MapState>,
    private identifyService: IdentifyService
  ) {}

  ngOnInit(): void {
    this.mapStore
      .select(selectIdentifiedGeometry)
      .pipe(takeUntil(this.destroy$))
      .subscribe(geometry => {
        this.result = geometry;
      });
  }

  /**
   * Metodo para cerrar el componente
   * Elimina la geometria dibujada
   */
  onCloseWidget() {
    this.identifyService.deleteGeometryDrawed();
  }
}
