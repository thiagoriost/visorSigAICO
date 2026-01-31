import { Injectable } from '@angular/core';
import { ResultIdentifyWMSQuery } from '@app/widget/identify/interfaces/ResultIdentifyQuery';
import axios, { Axios, AxiosError } from 'axios';

/**
 * Servicio que realiza la consulta a una ruta en especifico
 * @date 13-05-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Injectable()
export class SeleccionEspacialQueryService {
  private axiosInstance: Axios; //instancia de axios para consultar los features

  /**
   * Crear la instrancia del servicio
   */
  constructor() {
    this.axiosInstance = axios.create({});
  }

  /**
   * Consulta los Features WFS a partir de la URL construida
   * @param query
   * @returns
   */
  searchWFSFeatures(query: string): Promise<ResultIdentifyWMSQuery> {
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
        if (err instanceof AxiosError) {
          throw new Error(`AxiosError: ${err.message}`);
        }
        throw new Error(`UnknownError: ${JSON.stringify(err)}`);
      });
  }
}
