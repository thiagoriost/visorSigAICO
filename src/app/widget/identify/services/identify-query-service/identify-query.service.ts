import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import { ResultIdentifyWMSQuery } from '@app/widget/identify/interfaces/ResultIdentifyQuery';

/**
 * @description Servicio que se encarga de realizar las consultas a Geoserver con la geometria identificada en el mapa
 * @author Andres Fabian Simbaqueba del Rio <<anfasideri@hotmail.com>>
 * @date 27/12/2024
 * @class IdentifyQueryService
 */
@Injectable({
  providedIn: 'root',
})
export class IdentifyQueryService {
  private axiosInstance: Axios; //instancia de axios para consultar los features

  constructor() {
    this.axiosInstance = axios.create({});
  }

  /**
   * Metodo para consultar los features de un WMS
   * @param query infoURl de la consulta
   * @returns Promise<ResultIdentifyWMSQuery>
   */
  searchWFSFeature(query: string): Promise<ResultIdentifyWMSQuery> {
    return this.axiosInstance
      .get(query)
      .then(response => {
        if (response.status === 200) {
          return response.data;
        } else {
          return;
        }
      })
      .catch(err => {
        throw new Error(err);
      });
  }

  /**
   * Metodo para consultar los datos xml de una geometria de tipo WMS
   * @param query url a la que se realizará la consulta
   * @returns xml con los datos de la consulta
   */
  searchWMSFeatureInfo(query: string): Promise<string> {
    return this.axiosInstance
      .get(query)
      .then(response => {
        if (response.status === 200) {
          return response.data;
        } else {
          return;
        }
      })
      .catch(err => {
        throw new Error(err);
      });
  }
}
