import { Injectable } from '@angular/core';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { Subject } from 'rxjs';

/**
 * @description Servicio de bus de eventos para cuando se elimina una capa desde el área de trabajo
 * @author Andres Fabian Simbaqueba del Rio <<anfasideri@hotmail.com>>
 * @date 12/12/2024
 * @class EventBusService
 */
@Injectable({
  providedIn: 'root',
})
export class EventBusService {
  // Creamos un Subject para emitir eventos
  private eventSubject: Subject<LayerStore> = new Subject<LayerStore>();

  // Método para emitir eventos
  emit(event: LayerStore) {
    this.eventSubject.next(event);
  }

  // Método para suscribirse a los eventos
  onEvent() {
    return this.eventSubject.asObservable();
  }
}
