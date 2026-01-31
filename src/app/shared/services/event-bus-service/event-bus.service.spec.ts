import { TestBed } from '@angular/core/testing';

import { EventBusService } from './event-bus.service';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { take } from 'rxjs';

describe('EventBusService', () => {
  let service: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventBusService],
    });
    service = TestBed.inject(EventBusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should emit an event and the subscriber should receive it', done => {
    // Crear un evento de ejemplo
    const mockEvent: LayerStore = {
      layerDefinition: { id: '1', leaf: true, titulo: 'Layer 1' },
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 1,
      isVisible: true,
      transparencyLevel: 0,
    };
    // Suscribir al servicio
    service
      .onEvent()
      .pipe(take(1))
      .subscribe(event => {
        // Verificar que el evento recibido sea el esperado
        expect(event).toEqual(mockEvent);
        done();
      });

    // Emitir el evento
    service.emit(mockEvent);
  });

  it('should not emit an event if no subscriber is present', () => {
    // Crear un evento de ejemplo
    const mockEvent: LayerStore = {
      layerDefinition: { id: '2', leaf: true, titulo: 'Layer 2' },
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 2,
      isVisible: true,
      transparencyLevel: 0,
    };

    // Emitir el evento sin ningún suscriptor
    service.emit(mockEvent);

    // No hay suscriptores, así que no se hace ninguna verificación aquí.
    // Este test simplemente valida que no haya errores si no hay suscriptores.
    // No se requiere una aserción explícita.
  });

  it('should emit multiple events and subscribers should receive them', done => {
    // Crear eventos de ejemplo
    const mockEvent1: LayerStore = {
      layerDefinition: { id: '3', leaf: true, titulo: 'Layer 3' },
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 3,
      isVisible: true,
      transparencyLevel: 0,
    };
    const mockEvent2: LayerStore = {
      layerDefinition: { id: '4', leaf: true, titulo: 'Layer 4' },
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 4,
      isVisible: true,
      transparencyLevel: 0,
    };

    // Suscribir al servicio
    service
      .onEvent()
      .pipe(take(2))
      .subscribe(event => {
        if (event.layerDefinition.id === '3') {
          expect(event).toEqual(mockEvent1);
        } else if (event.layerDefinition.id === '4') {
          expect(event).toEqual(mockEvent2);
          done();
        }
      });

    // Emitir los eventos
    service.emit(mockEvent1);
    service.emit(mockEvent2);
  });

  it('should handle multiple subscribers correctly', done => {
    const mockEvent: LayerStore = {
      layerDefinition: { id: '5', leaf: true, titulo: 'Layer 5' },
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 5,
      isVisible: true,
      transparencyLevel: 0,
    };

    // Primer suscriptor
    service
      .onEvent()
      .pipe(take(1))
      .subscribe(event => {
        expect(event).toEqual(mockEvent);
      });

    // Segundo suscriptor
    service
      .onEvent()
      .pipe(take(1))
      .subscribe(event => {
        expect(event).toEqual(mockEvent);
        done();
      });

    // Emitir el evento
    service.emit(mockEvent);
  });
});
