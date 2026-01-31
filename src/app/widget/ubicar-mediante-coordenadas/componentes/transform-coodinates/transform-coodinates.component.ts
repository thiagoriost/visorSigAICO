import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import { DividerModule } from 'primeng/divider';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CoordenadaGeografica } from '../../interfaces/CoordenadaGeografica';
import { CoordenadaPlana } from '../../interfaces/CoordenadaPlana';
import { LocateCoordinateService } from '../../services/locate-coordinate.service';
import { ButtonModule } from 'primeng/button';
import { UbicarMedianteCoordenadaGeograficaComponent } from '../ubicar-mediante-coordenada-geografica/ubicar-mediante-coordenada-geografica.component';
import { UbicarMedianteCoordenadaPlanaComponent } from '../ubicar-mediante-coordenada-plana/ubicar-mediante-coordenada-plana.component';
import { OpenProfile } from '../../enums/OpenProfile';
import { TooltipModule } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { selectMapParameters } from '@app/core/store/map/map.selectors';
import { Subject, takeUntil } from 'rxjs';

/**
 * Componente que permite realizar transformaciones de coordenadas entre dos sistemas (Geograficas y planas)
 * @date 09-07-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-transform-coodinates',
  standalone: true,
  imports: [
    DividerModule,
    RadioButtonModule,
    CommonModule,
    ButtonModule,
    UbicarMedianteCoordenadaGeograficaComponent,
    UbicarMedianteCoordenadaPlanaComponent,
    TooltipModule,
  ],
  providers: [LocateCoordinateService],
  templateUrl: './transform-coodinates.component.html',
  styleUrl: './transform-coodinates.component.scss',
})
export class TransformCoodinatesComponent implements OnInit, OnDestroy {
  openProfileOrigin: OpenProfile = OpenProfile.ORIGIN_TRANSFORM; //variable para indicar el perfil de apertura
  openProfileDestiny: OpenProfile = OpenProfile.DESTINATION_TRANSFORM; //variable para indiciar el perfil de apertura a los componentes de sistema destino

  geographicCoordinateTransformed: CoordenadaGeografica | null = null; //coordenada transformada
  flatCoordinateTransformed: CoordenadaPlana | null = null; //coordenada transformada

  coordinatedTransform: [number, number] | null = null; //coordenada transformada

  ordenNormal = true; //orden normal de transformacion Geografica -> Planas

  proyeccionMapa = ''; //sistema de proyección del mapa

  private destroy$ = new Subject<void>(); //manejador de suscripciones

  @Output() coordinateEmitter: EventEmitter<CoordenadaGeografica | null> =
    new EventEmitter<CoordenadaGeografica | null>(); //emitter para comunicar al componente padre la coordenada transformada

  /**
   * Metodo para intercambiar el orden de trasnformacion
   */
  intercambiar() {
    this.ordenNormal = !this.ordenNormal;
    this.flatCoordinateTransformed = null;
    this.geographicCoordinateTransformed = null;
  }

  /**
   * Metodo que se ejecuta al inciar el componente
   */
  ngOnInit(): void {
    this.store
      .select(selectMapParameters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(mapParameters => {
        this.proyeccionMapa = mapParameters.projection;
      });
  }
  /**
   * Crear instancia del componente
   * @param formBuilder
   * @param locateCoordinateService
   */
  constructor(
    private locateCoordinateService: LocateCoordinateService,
    private store: Store<MapState>
  ) {}

  /**
   * Metodo para transformar una coordenada de tipo geografica a plana
   * @param coordenada coordenada geografica
   * @param sistemaOrigen sistema de coordenadas origen -> (EPSG:4686)
   * @param sistemaDestino sistema de coordenadas destino -> (EPSG:9377)
   * @returns coordenada plana
   */
  transformFromGeographicToFlatCoordinate(
    coordenada: CoordenadaGeografica,
    sistemaOrigen: 'EPSG:4686' | 'EPSG:9377' | 'EPSG:4326',
    sistemaDestino: string
  ): CoordenadaPlana {
    const coordinate = this.locateCoordinateService.transformarCoordenada(
      sistemaOrigen,
      sistemaDestino,
      [coordenada.longitud, coordenada.latitud]
    );
    if (!coordinate || coordinate.length !== 2) {
      throw new Error('Error al transformar la coordenada');
    }
    return { este: coordinate[0], norte: coordinate[1] };
  }

  /**
   * Metodo para transformar una coordenada de tipo plana a geografica
   * @param coordenada coordenada plana
   * @param sistemaOrigen sistema de coordenadas origen -> (EPSG:9377)
   * @param sistemaDestino sistema de coordenadas destino -> (EPSG:4686)
   * @returns coordenada geografica
   */
  transformFromFlatToGeographic(
    coordenada: CoordenadaPlana,
    sistemaorigen: 'EPSG:4686' | 'EPSG:9377' | 'EPSG:4326',
    sistemaDestino: string
  ): CoordenadaGeografica {
    const coordinate = this.locateCoordinateService.transformarCoordenada(
      sistemaorigen,
      sistemaDestino,
      [coordenada.este, coordenada.norte]
    );
    if (!coordinate || coordinate.length !== 2) {
      throw new Error('Error al transformar la coordenada');
    }
    return {
      longitud: coordinate[0],
      latitud: coordinate[1],
      tipoGrado: 'decimal',
    };
  }

  /**
   * Metodo que se ejecuta cuando se va a transformar de geografica a plana
   * @param coordinate coordenada geografica
   */
  onLocateGeographicCoordinate(coordinate: CoordenadaGeografica) {
    const coordenada = this.transformFromGeographicToFlatCoordinate(
      coordinate,
      'EPSG:4686',
      'EPSG:9377'
    );
    this.flatCoordinateTransformed = coordenada;
    this.coordinatedTransform = [coordenada.este, coordenada.norte];
  }

  /**
   * Metodo que se ejecuta cuando se va a transformar de plana a geografica
   * @param coordinate coordenada plana
   */
  onLocateFlatCoordinate(coordinate: CoordenadaPlana) {
    const coordenada = this.transformFromFlatToGeographic(
      coordinate,
      'EPSG:9377',
      'EPSG:4686'
    );
    this.geographicCoordinateTransformed = coordenada;
    this.coordinatedTransform = [coordenada.longitud, coordenada.latitud];
  }

  /**
   * Metodo para ubicar la coordenada transformada
   */
  locateTransformedCoordinate() {
    if (this.coordinatedTransform) {
      const coordenadaTransformada =
        this.locateCoordinateService.transformarCoordenada(
          this.ordenNormal ? 'EPSG:9377' : 'EPSG:4686',
          this.proyeccionMapa,
          [this.coordinatedTransform[0], this.coordinatedTransform[1]]
        );
      this.coordinateEmitter.emit({
        id: 'transformedCoordinate_',
        tipoGrado: 'decimal',
        latitud: coordenadaTransformada[0],
        longitud: coordenadaTransformada[1],
      });
    } else {
      console.error('No hay coordenada para ubicar');
    }
  }

  /**
   * Metodo que se ejecuta cuando se destruye el componente
   * Elimina el punto marcado en el mapa y restablece el zomm
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.coordinateEmitter.emit(null);
  }
}
