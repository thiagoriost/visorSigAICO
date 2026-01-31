import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import { ResultInterface } from '@app/shared/Interfaces/ResultInterface';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LayerDefinitionsService {
  protected baseURl = environment.tablaContenido.baseURL;
  private layerAPIURL = environment.tablaContenido.layerAPIURL;
  axiosInstance: Axios;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseURl,
    });
  }
  /**
   * Metodo que consulta las capas del mapa para
   * consruir la tabla de contenido
   * @returns Promesa con la lista de capas o el error en caso de no completarse la peticion
   */
  getAllAvailableLayers(url?: string): Promise<CapaMapa[]> {
    return this.axiosInstance
      .get<ResultInterface<CapaMapa>>(url ?? this.layerAPIURL)
      .then(result => {
        if (result && result.status === 200) {
          return result.data.Result;
        } else {
          return [];
        }
      })
      .catch(err => {
        throw new Error(err);
      });
  }
}
