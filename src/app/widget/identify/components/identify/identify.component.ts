import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { Store } from '@ngrx/store';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { MapState } from '@app/core/interfaces/store/map.model';
import {
  selectIdentifiedGeometry,
  selectWorkAreaLayerList,
} from '@app/core/store/map/map.selectors';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { IdentifyService } from '@app/widget/identify/services/identify-service/identify.service';
import { IdentifyQueryService } from '@app/widget/identify/services/identify-query-service/identify-query.service';
import { ResultComponent } from '@app/widget/identify/components/result/result.component';
import { GeometryIdentified } from '@app/widget/identify/interfaces/GeometryIdentified';

/**
 * Componente que contiene el widget de identificar geometrias sobre una capa
 * Contioene el selector de la capa y el componente para mostrar el resultado
 * @date 28-12-2024
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-identify',
  standalone: true,
  imports: [
    ToastModule,
    ButtonModule,
    ResultComponent,
    CommonModule,
    SelectModule,
    MessageModule,
  ],
  providers: [IdentifyQueryService],
  templateUrl: './identify.component.html',
  styleUrl: './identify.component.scss',
})
export class IdentifyComponent implements OnInit, OnDestroy {
  layerList: CapaMapa[] = []; // lista de capa
  private destroy$ = new Subject<void>();
  result: GeometryIdentified | undefined = undefined; //variable para mostrar el resultado de la geometria identificada
  errorMessage = '';
  private errorSub!: Subscription;
  isWMSService = false; //indica si la capa seleccionada es de tipo WMS
  WMSMessage =
    'Usted ha seleccionado una capa WMS, que esta compuesta por imágenes. Al identificar, los resultados se basan en píxeles y podrían no coincidir con los límites reales de las entidades.'; //mensaje informativo para mostrar al usuario cuando selecciona una capa de tipo WMS

  @Input() includeResult = true;

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

  /**
   * Metodo que se ejecuta cuando se destruya el componente
   */
  ngOnDestroy(): void {
    try {
      // Restaurar cursor (si existe el método)
      this.identifyService?.resetCursor?.();

      // Completar subjects
      this.destroy$.next();
      this.destroy$.complete();

      // Limpiar geometrías solo si el servicio está disponible
      this.identifyService?.deleteGeometryDrawed?.();
      this.identifyService?.destroySubject?.();

      this.identifyService.setLayerSelected(undefined); // Limpiar capa seleccionada
      // Cancelar la suscripción si existe
      if (this.errorSub) {
        this.errorSub.unsubscribe();
      }
    } catch (e) {
      console.error('Error en ngOnDestroy IdentifyComponent:', e);
    }
  }

  /**ng
   * Se suscribe al store de redux para consultar la lista de capas
   * del area del trabajo
   */
  ngOnInit(): void {
    // Activar cursor pointer
    this.identifyService.setIdentifyCursor();

    this.mapStore
      .select(selectWorkAreaLayerList)
      .pipe(takeUntil(this.destroy$))
      .subscribe(workAreaList => {
        if (workAreaList) {
          this.layerList =
            this.convertLayerStoreListToCapaMapaList(workAreaList);
        }
      });

    this.mapStore
      .select(selectIdentifiedGeometry)
      .pipe(takeUntil(this.destroy$))
      .subscribe(geometry => {
        this.result = geometry;
      });
    this.errorSub = this.identifyService.error$.subscribe(message => {
      console.log('Error: ', message);
      this.errorMessage = message;
    });
  }

  /**
   * Metodo para convertir la lista de capas del store a lista de CapasMApa
   * @param layerStoreList lista de capas del store de redux
   * @returns lista convertidas de CapaMapa
   */
  convertLayerStoreListToCapaMapaList(
    layerStoreList: LayerStore[]
  ): CapaMapa[] {
    const layerList: CapaMapa[] = [];
    if (!Array.isArray(layerStoreList)) {
      return layerList;
    }
    if (layerStoreList && layerStoreList.length > 0) {
      layerStoreList.forEach(layerStore => {
        layerList.push(layerStore.layerDefinition);
      });
    }
    return layerList;
  }

  /**
   * Metodo que se ejecuta cuando cambia el valor
   * seleccionado en el dropdown
   * @param event evento del dropdown
   */
  onChangeDropdown(event: SelectChangeEvent) {
    const value = event.value as CapaMapa;
    this.identifyService.setLayerSelected(value);
    this.errorMessage = '';
    this.isWMSService = !value.wfs;
  }

  /**
   * Metodo para cerrar el componente
   * Elimina la geometria dibujada
   */
  onCleanGeometry() {
    this.identifyService.deleteGeometryDrawed();
  }
}
