import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import ImageLayer from 'ol/layer/Image';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { ImageWMS } from 'ol/source';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { MapService } from '@app/core/services/map-service/map.service';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { AbrirWidget } from '@app/core/store/user-interface/user-interface.actions';
import { UrlWMSService } from '@app/shared/services/urlWMS/url-wms.service';
import { IdentifyWmsService } from '@app/widget/identify/services/identify-wms/identify-wms.service';
import { IdentifyWfsService } from '@app/widget/identify/services/identify-wfs/identify-wfs.service';

/**
 * @description Servicio encargado de dibujar en el mapa, manejo del evento click sobre el mapa y transmitir los datos encontrados al componente encargado de renderizar los datos de las geometrias encontradas
 * @author Andres Fabian Simbaqueba del Rio <<anfasideri@hotmail.com>>
 * @date 26/12/2024
 * @class IdentifyService
 */
@Injectable({ providedIn: 'root' })
export class IdentifyService {
  tryCounter = 0; //contador de intentos para suscribirse al evento click del mapa
  selectedLayer: CapaMapa | undefined; // capa seleccionada para identificar

  private errorSubject = new Subject<string>(); //manejador de errores
  public error$ = this.errorSubject.asObservable(); //retorna el manejador de errores como observable para poder suscribirse

  constructor(
    private mapService: MapService,
    private messageService: MessageService,
    private userStore: Store<UserInterfaceState>,
    private urlWmsService: UrlWMSService,
    private identifyWmsService: IdentifyWmsService,
    private identifyWFSService: IdentifyWfsService
  ) {
    this.onClickMap();
  }

  /**
   * Metodo para suscribirse al evento click del mapa
   */
  onClickMap() {
    const map = this.mapService.map;
    if (map) {
      map.on('click', (event: MapBrowserEvent<UIEvent>) => {
        this.onClickMapResponse(event);
      });
    } else {
      if (this.tryCounter < 5) {
        setTimeout(() => {
          this.onClickMap();
        }, 1000);
        this.tryCounter++;
      }
    }
  }

  /**
   * respuesta al evento click sobre el mapa
   * @param event
   */
  onClickMapResponse(event: MapBrowserEvent<UIEvent>) {
    this.userStore.dispatch(
      AbrirWidget({ estado: false, nombre: 'ResultadoIdentificar' })
    );
    //1. elimina geometrías si hay
    this.identifyWFSService.deleteGeometry();
    const coordinate = event.coordinate; //obtener las coordenadas del click
    const resolution = event.map.getView().getResolution() as number; //obtener la resolución del mapa
    const projection = event.map.getView().getProjection().getCode(); //obtener la proyección del mapa
    const params = { INFO_FORMAT: 'application/json' }; //formato de respuesta del servicio WMS
    if (!this.selectedLayer) {
      this.errorSubject.next('Debe seleccionar una capa');
      return;
    }
    //1. buscar la capa en el mapa de openlayers
    const layerSelectedMap: null | ImageLayer<ImageWMS> =
      this.mapService.getLayerByDefinition(
        this.selectedLayer,
        LayerLevel.INTERMEDIATE
      ) as ImageLayer<ImageWMS>;
    if (!layerSelectedMap) {
      this.messageService.add({
        summary: 'Error',
        detail: 'No se encontro la capa en el mapa',
        severity: 'error',
        life: 3000,
      });
      return;
    }
    switch (this.selectedLayer.tipoServicio) {
      case 'REST':
        this.messageService.add({
          severity: 'error',
          summary: 'Identificar',
          detail: 'Esta capa no admite servicios de tipo REST',
          sticky: true,
        });

        break;
      case 'WMS':
        if (this.selectedLayer.wfs) {
          try {
            this.identifyWFSService.getWFSFeatureInfo(
              layerSelectedMap,
              coordinate,
              resolution,
              projection,
              params
            );
          } catch (error) {
            console.error(error);
            this.messageService.add({
              summary: 'Error',
              detail: 'Se ha presentado un error al consultar el servicio WFS',
              severity: 'error',
              sticky: true,
            });
          }
        } else {
          try {
            const url = this.selectedLayer.url;
            if (url) {
              // 1. Obtener el capabilities para saber si tiene getFeatureInfo()
              this.urlWmsService
                .getCapabilities(url)
                .then(capability => {
                  if (capability) {
                    this.urlWmsService
                      .XMLToJSON(capability)
                      .then(jsonResponse => {
                        const request = jsonResponse?.Capability?.Request;
                        if (request?.GetFeatureInfo) {
                          const paramsWMS = {
                            INFO_FORMAT: 'text/xml',
                          };
                          this.identifyWmsService.getWMSInfo(
                            layerSelectedMap,
                            coordinate,
                            resolution,
                            projection,
                            paramsWMS
                          );
                        } else {
                          this.messageService.add({
                            summary: 'Aviso',
                            detail:
                              'La capa no soporta consultas al servicio WMS',
                            severity: 'warn',
                            sticky: true,
                          });
                        }
                      });
                  }
                })
                .catch(err => {
                  console.error(err);
                  this.messageService.add({
                    summary: 'Error',
                    detail:
                      'Ha ocurrido un error al realizar la consulta al servicio WMS',
                    severity: 'error',
                    sticky: true,
                  });
                });
            }
          } catch (error) {
            console.error(error);
            this.messageService.add({
              summary: 'Error',
              detail: 'Se ha presentado un error al consultar el servicio WMS',
              severity: 'error',
              sticky: true,
            });
          }
        }
        break;
    }
  }

  /**
   *Metodo para establecer la capa seleccionada
   * @param layerDefinition
   */
  setLayerSelected(layerDefinition: CapaMapa | undefined) {
    this.identifyWFSService.deleteGeometry();
    this.selectedLayer = layerDefinition;
  }

  /**
   * Cambiar cursor a pointer para modo identificar
   */
  setIdentifyCursor(): void {
    if (this.mapService.map) {
      this.mapService.map.getTargetElement().style.cursor = 'pointer';
    }
  }

  /**
   * Restaurar cursor por defecto
   */
  resetCursor(): void {
    if (this.mapService.map) {
      this.mapService.map.getTargetElement().style.cursor = 'default';
    }
  }

  /**
   * Eliminar geometría dibujada en el mapa del servicio WFS
   */
  deleteGeometryDrawed() {
    this.identifyWFSService.deleteGeometry();
  }

  /**
   * Destruir los subject de los servicios hijos
   */
  destroySubject() {
    this.identifyWFSService.destroysubject();
    this.identifyWmsService.destroysubject();
  }
}
