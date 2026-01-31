import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import ImageLayer from 'ol/layer/Image';
import { ImageWMS } from 'ol/source';
import { IdentifyQueryService } from '@app/widget/identify/services/identify-query-service/identify-query.service';
import { UrlWMSService } from '@app/shared/services/urlWMS/url-wms.service';
import { WMSFeatureInfo } from '@app/widget/identify/interfaces/WmsFeatureInfo';
import { MapActions } from '@app/core/store/map/map.actions';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { AbrirWidget } from '@app/core/store/user-interface/user-interface.actions';
import { MapState } from '@app/core/interfaces/store/map.model';
import { environment } from 'environments/environment';

/**
 * Servicio para gestionar las consultas a capas de tipo WMS
 * @date 2025/10/31
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Injectable({
  providedIn: 'root',
})
export class IdentifyWmsService {
  proxyURL = environment.map.proxy; //url del proxy para realizar las consultas
  private destroy$ = new Subject<void>(); //administrador de suscripciones

  constructor(
    private mapStore: Store<MapState>,
    private identifyQueryService: IdentifyQueryService,
    private urlWmsService: UrlWMSService,
    private messageService: MessageService,
    private userStore: Store<UserInterfaceState>
  ) {
    this.proxyURL = '';
  }

  /**
   * Metodo para consultar la informacion de un Web Map Service (WMS)
   * @param layer capa seleccionada por el usuario
   * @param coordinate coordenada donde se realizará la busqueda
   * @param resolution nivel de resolucion del mapa
   * @param projection sistema de proyeccion
   * @param params parametros de consulta
   */
  getWMSInfo(
    layer: ImageLayer<ImageWMS>,
    coordinate: number[],
    resolution: number,
    projection: string,
    params: object
  ) {
    this.mapStore.dispatch(MapActions.deleteGeometryIdentified());
    const urlFeatureInfo = layer
      .getSource()
      ?.getFeatureInfoUrl(coordinate, resolution, projection, params);

    if (urlFeatureInfo) {
      let urlToQuery = '';
      if (this.proxyURL !== undefined) {
        urlToQuery = this.proxyURL + urlFeatureInfo;
      } else {
        urlToQuery = urlFeatureInfo;
      }
      this.identifyQueryService
        .searchWMSFeatureInfo(urlToQuery)
        .then(response => {
          this.urlWmsService.XMLToJSON(response).then(json => {
            const jsonParsed = json as WMSFeatureInfo;
            if (jsonParsed.FIELDS) {
              //mostrar el componente de resultados
              this.messageService.clear();
              this.mapStore.dispatch(
                MapActions.addGeometryIdentified({
                  geometryIdentified: {
                    geometry: {
                      features: [
                        {
                          geometry: {},
                          geometry_name: '',
                          id: '',
                          properties: jsonParsed.FIELDS,
                          type: '',
                        },
                      ],
                      type: '',
                      totalFeatures: '1',
                      crs: null,
                    },
                    layerName: layer.getProperties()['titulo'],
                  },
                })
              );
              this.userStore.dispatch(
                AbrirWidget({ estado: true, nombre: 'ResultadoIdentificar' })
              );
            } else {
              this.messageService.clear();
              this.messageService.add({
                summary: 'Aviso',
                detail: 'Sin datos para mostrar',
                severity: 'warn',
                sticky: true,
              });
              this.userStore.dispatch(
                AbrirWidget({ estado: false, nombre: 'ResultadoIdentificar' })
              );
            }
          });
        })
        .catch(err => {
          this.userStore.dispatch(
            AbrirWidget({ estado: false, nombre: 'ResultadoIdentificar' })
          );
          console.error('Error: ', err);
          if (err instanceof Error) {
            this.messageService.add({
              summary: 'Error',
              detail: err.message,
              severity: 'error',
              life: 3000,
            });
          } else {
            this.messageService.add({
              summary: 'Error',
              detail: 'Se ha presentado un error desconocido',
              severity: 'error',
              life: 3000,
            });
          }
        });
    } else {
      this.messageService.add({
        summary: 'Error',
        detail: 'No se ha encontrado la URL de la geometría',
        severity: 'error',
        life: 3000,
      });
    }
  }

  /**
   * Destruir la suscripcion del subject
   */
  destroysubject(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
