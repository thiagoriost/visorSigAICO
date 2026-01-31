import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { UbicarMedianteCoordenadaGeograficaComponent } from '@app/widget/ubicar-mediante-coordenadas/componentes/ubicar-mediante-coordenada-geografica/ubicar-mediante-coordenada-geografica.component';
import { UbicarMedianteCoordenadaPlanaComponent } from '@app/widget/ubicar-mediante-coordenadas/componentes/ubicar-mediante-coordenada-plana/ubicar-mediante-coordenada-plana.component';
import { LocateCoordinateService } from '@app/widget/ubicar-mediante-coordenadas/services/locate-coordinate.service';
import { ButtonModule } from 'primeng/button';
import { CoordenadaGeografica } from '../../interfaces/CoordenadaGeografica';
import { CoordenadaPlana } from '../../interfaces/CoordenadaPlana';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { selectMapParameters } from '@app/core/store/map/map.selectors';
import { Subject, takeUntil } from 'rxjs';
import { TransformCoodinatesComponent } from '../transform-coodinates/transform-coodinates.component';
import { TooltipModule } from 'primeng/tooltip';
import { Divider } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';

/**
 * Componente que recibe los datos de las coordenadas a ubicar en el mapa
 * @author Gregory Nicolas Murcia Buitrago, Andres Fabian Simbaqueba Del Rio
 * se modifica para que contenga las dos pestanias con los sistemas de coordenadas
 * Geografica
 * Planas
 * @date 23-04-2025
 **/

@Component({
  selector: 'app-ubicar-mediante-coordenadas',
  standalone: true,
  imports: [
    UbicarMedianteCoordenadaGeograficaComponent,
    UbicarMedianteCoordenadaPlanaComponent,
    ButtonModule,
    TransformCoodinatesComponent,
    TooltipModule,
    Divider,
    TabsModule,
  ],

  templateUrl: './ubicar-mediante-coordenadas.component.html',
  styleUrls: ['./ubicar-mediante-coordenadas.component.scss'],
  providers: [LocateCoordinateService],
})
export class UbicarMedianteCoordenadasComponent implements OnInit, OnDestroy {
  coordenada: CoordenadaGeografica | null = null;
  proyeccionMapa = '';
  private destroy$ = new Subject<void>();
  @Output() coordinateEmitter: EventEmitter<CoordenadaGeografica> =
    new EventEmitter<CoordenadaGeografica>();
  @Input()
  solicitarCoordenadas!: boolean;
  isTransformingCoordinates = false;

  /**
   * Crea una instancia del componente
   * @param locateCoordinateService servicio para ubicar coordenadas en el mapa
   * @param store store de redux para obtener la proyeccion del mapa
   */
  constructor(
    private locateCoordinateService: LocateCoordinateService,
    private store: Store<MapState>
  ) {}

  /**
   * Metodo que se ejecuta al iniciar el componente
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
   * Metodo para agregar una coordenada plana al mapa
   * @param flatCoordinate  coordenada plana
   * 1. Se transforma la coordenada plana a el sistema de coordenadas del mapa
   * (longitud,latitud)
   * 2. Se agrega la coordenada al mapa
   * 3. Se centra el mapa en la coordenada creada
   * 4. Se agrega la coordenada a la lista del componente
   */
  onLocateFlatCoordinate(flatCoordinate: CoordenadaPlana) {
    this.eliminarPuntoMarcado();
    flatCoordinate.id = 'flatPoint_' + 1;

    const coordenadaTransformada =
      this.locateCoordinateService.transformarCoordenada(
        'EPSG:9377',
        this.proyeccionMapa,
        [flatCoordinate.este, flatCoordinate.norte]
      );

    this.locateCoordinateService.addPointToMap(
      [coordenadaTransformada[0], coordenadaTransformada[1]],
      flatCoordinate.id
    );
    this.locateCoordinateService.centerMapOnPoint(coordenadaTransformada);
    this.coordenada = {
      longitud: coordenadaTransformada[1],
      latitud: coordenadaTransformada[0],
      id: flatCoordinate.id,
      tipoGrado: 'plana',
    };
    this.coordinateEmitter.emit(this.coordenada);
  }

  /**
   * Metodo para localizar coordenadas geograficas
   * @param coordenada coordenada geografica
   */
  onLocateGeographicCoordinate(coordenada: CoordenadaGeografica) {
    this.eliminarPuntoMarcado();
    if (coordenada.tipoGrado === 'decimal') {
      coordenada.id = 'geographicDecimalPoint_' + 1;
    } else if (coordenada.tipoGrado === 'sexagecimal') {
      coordenada.id = 'geographicSexagesimalPoint_' + 1;
    }
    const coordenadaTransformada =
      this.locateCoordinateService.transformarCoordenada(
        'EPSG:4686',
        this.proyeccionMapa,
        [coordenada.longitud, coordenada.latitud]
      );
    this.locateCoordinateService.addPointToMap(
      [coordenadaTransformada[0], coordenadaTransformada[1]],
      coordenada.id ?? ''
    );
    this.locateCoordinateService.centerMapOnPoint(coordenadaTransformada, 2);
    this.coordenada = {
      latitud: coordenadaTransformada[0],
      longitud: coordenadaTransformada[1],
      tipoGrado: coordenada.tipoGrado,
      id: coordenada.id,
    };
    this.coordinateEmitter.emit(this.coordenada);
  }

  /**
   * Metodo que elimina todos los puntos creados por el componente en el mapa
   */
  eliminarPuntoMarcado(): void {
    if (this.coordenada) {
      this.locateCoordinateService.removeLayerByName(this.coordenada.id ?? '');
      this.coordenada = null;
      this.locateCoordinateService.restartZommAndCenter();
    }
  }

  /**
   * Metodo que se ejecuta cuando se destruye el componente
   * Elimina el punto marcado en el mapa y restablece el zomm
   */
  ngOnDestroy(): void {
    this.eliminarPuntoMarcado();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Metodo para acercar un punto
   */
  acercarPunto() {
    if (this.coordenada)
      this.locateCoordinateService.centerMapOnPoint([
        this.coordenada.latitud,
        this.coordenada.longitud,
      ]);
  }

  /**
   * Cambiar al modo de transformacion/ubicacion
   */
  transformingCoordinates() {
    this.isTransformingCoordinates = !this.isTransformingCoordinates;
  }

  /**
   * Metodo que se ejecuta cuando el componente de transformar coordenada ubica una coordenada en el mapa
   * @param coordinate coordenada geografica o null
   */
  onChangeTransformedCoordinate(coordinate: CoordenadaGeografica | null) {
    if (coordinate) {
      this.coordenada = coordinate;
      this.locateCoordinateService.removeLayerByName('transformedCoordinate_');
      this.locateCoordinateService.restartZommAndCenter();
      this.locateCoordinateService.addPointToMap(
        [coordinate.latitud, coordinate.longitud],
        'transformedCoordinate_'
      );
      this.locateCoordinateService.centerMapOnPoint(
        [coordinate.latitud, coordinate.longitud],
        2
      );
    } else {
      this.eliminarPuntoMarcado();
      this.coordenada = null;
    }
  }
}
