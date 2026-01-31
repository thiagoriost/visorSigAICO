import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { LayerContentTableManagerDirective } from '@app/core/directives/layer-content-table-manager.directive';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { Capa } from '@app/core/interfaces/directus/Capa';
import { Metadato } from '@app/core/interfaces/directus/Metadato';
import { Servicio } from '@app/core/interfaces/directus/Servicio';
import { Tematica } from '@app/core/interfaces/directus/Tematica';
import { Tipo_Servicio } from '@app/core/interfaces/directus/TipoServicio';
import { MapState } from '@app/core/interfaces/store/map.model';
import { ContentTableDirectusSearchService } from '@app/core/services/content-table-directus-search/content-table-directus-search.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { MapActions } from '@app/core/store/map/map.actions';
import { environment } from 'environments/environment';

/**
 * Servicio encargado de consultar las tematicas del rol publico o de un rol especifico
 * Gestiona y parsea las tematicas para convertirlas en capas que se renderizaran en la tabla de contenido del usuario
 * interactua con el store para ajustar la tabla de contenido y con el servicio encargado de gestionar las capas que deben ser activadas al iniciar la aplicacion
 * @date 2025-12-05
 * @author Andres Fabian Simbaqueba
 */
@Injectable({
  providedIn: 'root',
})
export class ContentTableSearchService extends LayerContentTableManagerDirective {
  private publicRoleID = environment.auth.publicRoleID; //id del rol publico

  /**
   * Crea una instancia del servicio
   * @param store store del mapa
   * @param mapService servicio que permite gestionar el mapa
   * @param LayersContentTableManagerService servicio que gestiona las capas cuando inicia la aplicacion
   * @param messageService servicio para mostrar mensajes
   */
  constructor(
    protected override store: Store<MapState>,
    protected override mapService: MapService,
    private contentTableDirectus: ContentTableDirectusSearchService,
    private messageService: MessageService
  ) {
    super(mapService, store);
  }

  /**
   * Consulta la tabla de contenido del rol publico
   */

  /**
   * Consulta las tematicas asociadas a un rol
   * si no se suministra el rol se consulta con el rol publico
   *
   * @param idRol - rol a consultar. Si no se proporciona, se usa el rol público.
   *
   * @remarks
   * Cuando se consulta con el rol público o sin rol (después de logout),
   * se utiliza la instancia pública de Directus para evitar intentos de
   * refresh del token de autenticación.
   */
  searchContentTableOfARole(idRol?: string) {
    this.store.dispatch(MapActions.setContentTableLayerList({ layerList: [] }));

    // Determina si debe usar la instancia pública
    // Se usa cuando: no hay rol, o el rol es el público
    const usePublicInstance = !idRol || idRol === this.publicRoleID;

    this.contentTableDirectus
      .consultarTematicasAsociadasARol(
        idRol ?? this.publicRoleID,
        [
          'Nombre',
          'IdTematicaPadre',
          'IdTematica',
          'Descripcion',
          'idTematicaCapa.visible',
          'idTematicaCapa.IdCapa.Atributo',
          'idTematicaCapa.IdCapa.Titulo',
          'idTematicaCapa.IdCapa.IdCapa',
          'idTematicaCapa.IdCapa.NombreCapa',
          'idTematicaCapa.IdCapa.IdServicio.Descripcion',
          'idTematicaCapa.IdCapa.IdServicio.Url',
          'idTematicaCapa.IdCapa.IdServicio.Estado',
          'idTematicaCapa.IdCapa.IdServicio.IdTipoServicio.Descripcion',
          'idTematicaCapa.IdCapa.IdMetadato.Url',
          'idTematicaCapa.IdCapa.IdMetadato.Url',
          'idTematicaCapa.IdCapa.IdServicio.idserviciowfs.Url',
        ],
        ['-Orden'],
        undefined,
        usePublicInstance
      )
      .then(res => {
        //transformar array de Tematicas a Array de CapaMapa
        const layerListBuilded = this.buildCapaMapaTree(res.data as Tematica[]);
        //filtra las capas para eliminar las que tengan id repetido
        const layerList = this.addLayerWithUniqueID(layerListBuilded, []);
        // muta el redux para ajustar la tabla de contenido
        this.store.dispatch(MapActions.setContentTableLayerList({ layerList }));
        // agrega al mapa las capas que deben ser activadas al iniciar la aplicacion
        this.checkActivatedLayerOnInit(layerList);
      })
      .catch(err => {
        console.error('ERROR: ', err);
        this.messageService.clear();
        this.messageService.add({
          detail: 'Error al consultar las tematicas disponibles',
          severity: 'error',
          sticky: true,
          summary: 'Error en tabla de contenido',
        });
      });
  }

  /**
   * Construye un mapa a partir de un array de tematicas
   * @param tematicas lista de tematicas
   * @returns Record con los registros mapeados
   */
  buildTematicaMap(tematicas: Tematica[]): Record<number, Tematica> {
    return tematicas.reduce(
      (acc, t) => {
        if (t.IdTematica !== undefined) acc[t.IdTematica] = t;
        return acc;
      },
      {} as Record<number, Tematica>
    );
  }

  /**
   * Obtiene una lista de tematicas asociadas a un id en un registro mapeado
   * @param id id a consultar
   * @param map lista de registros mapeados
   * @returns lista de tematicas
   */
  getChildren(id: number, map: Record<number, Tematica>): Tematica[] {
    return Object.values(map).filter(t => {
      const padre = t.IdTematicaPadre;
      return typeof padre === 'number'
        ? padre === id
        : padre?.IdTematica === id;
    });
  }

  /**
   * Convierte una tematica en una lista de CapaMapa
   * @param tematica tematica a ser parseada
   * @returns lista de CapaMapa
   */
  mapCapas(tematica: Tematica): CapaMapa[] {
    return tematica.idTematicaCapa.map(tc => {
      const capa = tc.IdCapa as Capa;
      const metadatoCapa: Metadato | null = capa.IdMetadato as Metadato | null;
      const servicioCapa: Servicio | null = capa.IdServicio as Servicio | null;
      const urlMetadatoServicio: Metadato | null =
        servicioCapa?.IdMetadato as Metadato | null;
      const tipoServicio: Tipo_Servicio | null =
        servicioCapa?.IdTipoServicio as Tipo_Servicio | null;
      const idserviciowfs: Servicio | null =
        servicioCapa?.idserviciowfs as Servicio | null;
      return {
        id: String(capa.IdCapa),
        titulo: capa.Titulo,
        leaf: true,
        nombre: capa.NombreCapa,
        url: servicioCapa?.Url,
        tipoServicio: tipoServicio?.Descripcion,
        urlServicioWFS: idserviciowfs?.Url,
        descripcionServicio: servicioCapa?.Descripcion,
        idInterno: capa.IdCapa,
        checked: tc.visible === 'T' ? true : false,
        wfs: idserviciowfs?.Url ? true : false,
        estadoServicio: servicioCapa?.Estado,
        metadato: String(metadatoCapa?.IdMetadato),
        origin: 'internal',
        urlMetadato: metadatoCapa?.Url,
        urlMetadatoServicio: urlMetadatoServicio?.Url,
      } satisfies CapaMapa;
    });
  }

  /**
   * Mapea una tematica y la convierte en un objeto CapaMapa heredando todas las propiedades aplicando recursividad
   * @param tematica tematica a ser parseada
   * @param map registros mapeados
   * @returns objeto CapaMapa
   */
  mapTematicaToCapaMapa(
    tematica: Tematica,
    map: Record<number, Tematica>
  ): CapaMapa {
    const subtematicas = this.getChildren(tematica.IdTematica!, map);

    const children: CapaMapa[] = [
      ...this.mapCapas(tematica), // Las capas de esta temática
      ...subtematicas.map(
        (
          t // Las subtemáticas recursivas
        ) => this.mapTematicaToCapaMapa(t, map)
      ),
    ];

    return {
      id: String(tematica.IdTematica),
      titulo: tematica.Nombre,
      leaf: children.length === 0 && tematica.IdTematicaPadre === null, // Hoja solo si no hay hijos
      descripcionServicio: tematica.Descripcion,
      Result: children.length ? children : undefined,
    } satisfies CapaMapa;
  }

  /**
   * Convierte una lista de Tematicas en una lista de CapaMapa aplicando recursividad
   * @param tematicas lista de Tematica[]
   * @returns lista de CapaMapa[]
   */
  buildCapaMapaTree(tematicas: Tematica[]): CapaMapa[] {
    const map = this.buildTematicaMap(tematicas);

    const roots = tematicas.filter(t => {
      const padre = t.IdTematicaPadre;
      return padre === 0 || padre === null || padre === undefined;
    });

    return roots.map(t => this.mapTematicaToCapaMapa(t, map));
  }
}
