// shared-modal.service.ts
import { Injectable } from '@angular/core';
import { GeoJSONData } from '@projects/aico/interfaces/interfaces';

import { BehaviorSubject } from 'rxjs';

/**
 * Servicio para gestionar el estado de un modal compartido en la aplicación.
 *
 * Este servicio proporciona un mecanismo centralizado para controlar la apertura y cierre
 * de modales, así como para compartir datos GeoJSON entre componentes que utilizan el modal.
 * Utiliza RxJS BehaviorSubject para mantener y emitir el estado reactivo del modal.
 *
 * @author IGAC - Instituto Geográfico Agustín Codazzi
 * @version 1.0.0
 * @since 2024
 *
 * @example
 * ```typescript
 * constructor(private sharedModalService: SharedModalService) {}
 *
 * // Abrir el modal con datos GeoJSON
 * this.sharedModalService.openModal(geoJsonData);
 *
 * // Suscribirse a cambios de estado
 * this.sharedModalService.modalState$.subscribe(state => {
 *   if (state.isOpen) {
 *     console.log('Modal abierto con datos:', state.data);
 *   }
 * });
 *
 * // Cerrar el modal
 * this.sharedModalService.closeModal();
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class SharedModalService {
  /**
   * Subject privado que mantiene el estado actual del modal.
   *
   * Almacena un objeto con dos propiedades:
   * - isOpen: indica si el modal está abierto o cerrado
   * - data: contiene los datos GeoJSON asociados al modal, o null si no hay datos
   *
   * @private
   * @type {BehaviorSubject<{isOpen: boolean, data: GeoJSONData | null}>}
   */
  private modalState = new BehaviorSubject<{
    isOpen: boolean;
    data: GeoJSONData | null;
  }>({ isOpen: false, data: null });

  /**
   * Observable público del estado del modal.
   *
   * Los componentes pueden suscribirse a este observable para recibir notificaciones
   * reactivas cada vez que el estado del modal cambia (apertura, cierre, o cambio de datos).
   *
   * @type {Observable<{isOpen: boolean, data: GeoJSONData | null}>}
   * @readonly
   *
   * @example
   * ```typescript
   * this.sharedModalService.modalState$.subscribe(state => {
   *   console.log('Estado del modal:', state.isOpen);
   *   console.log('Datos:', state.data);
   * });
   * ```
   */
  modalState$ = this.modalState.asObservable();

  /**
   * Abre el modal con los datos GeoJSON proporcionados.
   *
   * Este método actualiza el estado del modal a 'abierto' y almacena los datos GeoJSON
   * que se pasarán a los componentes suscritos. Todos los suscriptores de modalState$
   * recibirán la actualización inmediatamente.
   *
   * @param {GeoJSONData} data - Los datos GeoJSON que se mostrarán en el modal.
   *                              Debe contener una colección de features geográficas.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * const geoData: GeoJSONData = {
   *   type: 'FeatureCollection',
   *   features: [{
   *     type: 'Feature',
   *     properties: { name: 'Ubicación' },
   *     geometry: { type: 'Point', coordinates: [-74.0721, 4.7110] }
   *   }]
   * };
   * this.sharedModalService.openModal(geoData);
   * ```
   */
  openModal(data: GeoJSONData): void {
    this.modalState.next({ isOpen: true, data });
    //console.log('Modal abierto con datos:', data);
  }

  /**
   * Cierra el modal y limpia los datos asociados.
   *
   * Este método actualiza el estado del modal a 'cerrado' y establece los datos a null,
   * liberando la referencia a los datos GeoJSON anteriores. Todos los suscriptores
   * de modalState$ recibirán la actualización inmediatamente.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * this.sharedModalService.closeModal();
   * ```
   */
  closeModal(): void {
    this.modalState.next({ isOpen: false, data: null });
  }
}
