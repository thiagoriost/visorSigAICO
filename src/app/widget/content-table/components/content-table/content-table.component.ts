//--------------Componentes prime ng y Angular------------
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MessageService, TreeNode } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import {
  TreeModule,
  TreeNodeSelectEvent,
  TreeNodeUnSelectEvent,
} from 'primeng/tree';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
//------Interfaces--------
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { MapState } from '@app/core/interfaces/store/map.model';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
//------Servicios-----------
import { EventBusService } from '@app/shared/services/event-bus-service/event-bus.service';
//--------Redux Store----------------
import { MapActions } from '@app/core/store/map/map.actions';
import * as mapsSelectors from '@app/core/store/map/map.selectors';
import { Subscription } from 'rxjs';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';
import { SearchLayerInputComponent } from '@app/shared/components/search-layer-input/search-layer-input.component';
import { BackgroundStyleComponent } from '@app/shared/utils/background-style/backgroundStyle';
import { CommonModule } from '@angular/common';

/**
 * @description Componente que contiene el arbol de capas y agrega las capas al store cuando el usuario selecciona una capa
 * @author Andres Fabian Simbaqueba del rio <<anfasideri@hotmail.com>>
 * @date 02/12/2024
 * @class ContentTableComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-content-table',
  standalone: true,
  imports: [
    TreeModule,
    TooltipModule,
    ProgressSpinnerModule,
    ScrollPanelModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ToastModule,
    FormsModule,
    SearchLayerInputComponent,
    CommonModule,
  ],
  providers: [MessageService, LayerOptionService],
  templateUrl: './content-table.component.html',
  styleUrl: './content-table.component.scss',
})
export class ContentTableComponent
  extends BackgroundStyleComponent
  implements OnInit, OnDestroy
{
  @Input() isExpandedList = true; //indica si el arbol de capas se muestra expandido o no
  @Input() layerParentIcon = 'pi pi-folder'; //indica la clase del icono para las capas padre
  @Input() layerLeafIcon = 'pi pi-book'; //indica la clase del icono para las capas tipo hoja
  @Input() showIcons = false; //indica si se muestran los iconos de las capas o no
  @Input() emptyFilteringMessage = 'Sin resultados'; //mensaje cuando se hace consulta de capas y no hay resultados
  @Input() emptyTreeListMessage = 'No se encontraron capas';

  //parametros componente de busqueda
  @Input() placeHolderSearchInput = 'Buscar'; //texto de ayuda para el input de busqueda
  @Input() iconClassSearchInput = 'pi pi-search'; //clase del icono de buscar del input de busqueda
  @Input() iconPositionSearchInput: 'right' | 'left' = 'right'; //posicion del icono del input de busqueda
  @Input() iconInputVisibleSearchInput = true; //indica si el icono de busqueda es visible /oculto

  layerMapList: CapaMapa[] = []; //lista de capas disponibles del mapa en la consulta a la API
  layerTreeToRender: TreeNode[] = []; //arbol con las capas para renderizar en la tabla de contenido
  layerSelectedList: CapaMapa[] = []; //lista de capas seleccionadas por el usuario
  selectedNodes: TreeNode[] = []; //lista de nodos seleccionados en el arbol
  private eventSubscription: Subscription | null = null;
  originalLayerTreeToRender: TreeNode[] = []; //array original de nodos del arbol
  isFiltering = false; // variable para saber si se está haciendo un filtro sobre el arbol
  isLoading = true; //indica si el componente esta cargando la informacion

  /**
   * Metodo constructor
   * @param layerDefinitionService servicio que consulta las capas disponibles
   * @param messageService servicio de Mensajes
   * @param mapStore store del mapa
   */
  constructor(
    private messageService: MessageService,
    private mapStore: Store<MapState>,
    private eventBusService: EventBusService
  ) {
    super();
  }

  /**
   * Metodo que se ejecuta al iniciar el componente
   */
  ngOnInit(): void {
    this.isLoading = true;
    this.mapStore
      .select(mapsSelectors.selectLayerListContentTable)
      .subscribe(layerList => {
        if (layerList && layerList.length > 0) {
          this.layerMapList = layerList;
          this.layerTreeToRender =
            this.convertLayersMapListIntoLayerTreeNodeList(
              this.layerMapList,
              undefined
            );
          this.originalLayerTreeToRender = JSON.parse(
            JSON.stringify(this.layerTreeToRender)
          );
          this.mapStore
            .select(mapsSelectors.selectWorkAreaLayerList)
            .subscribe(layers => {
              this.layerSelectedList =
                this.convertFromLayerStoreListToCapaMapaList(layers);
            });

          this.selectedNodes = this.convertLayersMapListIntoLayerTreeNodeList(
            this.layerSelectedList,
            undefined
          );
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      });
    this.onDeletedLayer();
  }

  /**
   * Metodo que se ejecuta al destruir el componente
   * Se cancela la suscripcion al servicio
   */
  ngOnDestroy(): void {
    // Aseguramos que no haya fugas de memoria
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

  /**
   * Metodo que se ejecuta cuando se escribe en el campo de busqueda para aplicar el filtro
   */
  onInputFilterChanges(text: string) {
    const filteredNodes = this.filterNodes(
      text,
      this.originalLayerTreeToRender
    );
    this.markSelectedNodes(filteredNodes);
    this.layerTreeToRender = [...filteredNodes]; // Creamos una nueva referencia
  }

  /**
   * Metodo para marcar los nodos seleccionados
   * @param nodes, array de nodos a marcar
   */
  markSelectedNodes(nodes: TreeNode[]): void {
    nodes.forEach(node => {
      if (
        this.selectedNodes.some(selectedNode => selectedNode.data === node.data)
      ) {
        node.checked = true;
      }
      if (node.children && node.children.length > 0) {
        this.markSelectedNodes(node.children);
      }
    });
  }

  /**
   * Metodo para filtrar los nodos de acuerdo a una palabra de busqueda
   * @param query, palabra clave a buscar
   * @param originalTree, array de nodos para buscar
   * @returns Array de nodos que cumplen la consulta
   */
  filterNodes(query: string, originalTree: TreeNode[]): TreeNode[] {
    const treeNode: TreeNode[] = [];
    if (query !== '') {
      for (const tree of originalTree) {
        if (tree.label?.toLowerCase().includes(query.toLowerCase())) {
          treeNode.push(tree);
        }
        if (tree.children && tree.children.length > 0) {
          const filteredChildren = this.filterNodes(query, tree.children);
          if (filteredChildren.length > 0) {
            treeNode.push({ ...tree, children: filteredChildren });
          }
        }
      }
      this.isFiltering = true;
    } else {
      this.isFiltering = false;
      return originalTree;
    }
    return treeNode;
  }

  /**
   * Metodo que se ejecuta cuando se elimina una capa desde el área de trabajo
   */
  onDeletedLayer() {
    // Nos suscribimos a los eventos del bus
    this.eventSubscription = this.eventBusService.onEvent().subscribe(event => {
      this.removeNode(event.layerDefinition);
    });
  }

  /**
   * Metodo que se ejecuta cuando se elimina una capa del área de trabajo
   * @param layerDefinition  capa a eliminar
   */
  removeNode(layerDefinition: CapaMapa): void {
    const nodeToDeselect = this.findNodeById(
      this.layerTreeToRender,
      layerDefinition.id
    );
    if (nodeToDeselect) {
      // Remover el nodo de los seleccionados
      this.selectedNodes = this.selectedNodes.filter(
        node => node.data !== nodeToDeselect.data
      );
      //remover el nodo principal si no tiene hijos
      if (this.getChildrenNumberOfANode(nodeToDeselect.parent?.data) === 0) {
        this.selectedNodes = this.selectedNodes.filter(
          node => node.data !== nodeToDeselect.parent?.data
        );
        // Tiene mas hijos, se deja parcialmente marcado
      } else {
        this.selectedNodes.forEach(node => {
          if (node.data === nodeToDeselect.parent?.data) {
            node.partialSelected = true;
          }
        });
      }
    }
  }

  /**
   * Convierte un array de capas del store a un array de CapaMapa
   * @param layerStoreList lista de capas del store
   * @returns lista de CapaMapa creada
   */
  convertFromLayerStoreListToCapaMapaList(
    layerStoreList: LayerStore[]
  ): CapaMapa[] {
    const capaMapaList: CapaMapa[] = [];
    if (layerStoreList && layerStoreList.length > 0) {
      layerStoreList.forEach(layerStore => {
        capaMapaList.push(layerStore.layerDefinition);
      });
    }
    return capaMapaList;
  }

  /**
   * Metodos necesarios para inicializar la tabla de contenido y trasnformar las capas en treeNodes para renderizar el arbol de capas
   */

  /**
   * Metodo que convierte una lista de capas del mapa en un array de TreeNode
   * para ser renderizado en el template y mostrar las opciones de capa
   * @param capas
   * @returns
   */
  convertLayersMapListIntoLayerTreeNodeList(
    layers: CapaMapa[],
    layerParent: CapaMapa | undefined
  ): TreeNode[] {
    const treeNodes: TreeNode[] = [];
    if (layers && layers.length > 0) {
      layers.forEach(layer => {
        if (!this.existLayerOnList(treeNodes, layer.id)) {
          const node: TreeNode = {
            parent: layerParent
              ? {
                  data: layerParent.id,
                  label: layerParent.titulo,
                  checked: false,
                }
              : undefined,
            checked: false,
            icon: this.showIcons
              ? layer.leaf
                ? this.layerLeafIcon
                : this.layerParentIcon
              : undefined,
            data: layer.id,
            draggable: false,
            droppable: false,
            leaf: layer.leaf,
            partialSelected: false,
            loading: false,
            key: layer.id,
            label: layer.titulo,
            expanded: this.isExpandedList,
            selectable: layer.leaf ? true : false,
            children: layer.Result
              ? this.convertLayersMapListIntoLayerTreeNodeList(
                  layer.Result as CapaMapa[],
                  layer
                )
              : [],
          };
          treeNodes.push(node);
        }
      });
    }
    return treeNodes;
  }

  /**
   * Metodo para validar si ya existe una capa en el array de capas
   * Se realiza este método ya que en la consulta de las capas,en la capa de
   * CENSO DANE 2018 las subcapas de POBLACION GENERAL se encuentran repetidas
   * y se valida que no se repitan capas con el mismo identificador
   * @param layer lista de capas
   * @param idLayer id de la capa a buscar
   * @returns variable booleana que indica si se encuentra registrada
   */
  existLayerOnList(layer: TreeNode[], idLayer: string): boolean {
    return layer.some(layer => {
      return layer.data === idLayer
        ? layer
        : this.existLayerOnList(layer.children ?? [], idLayer);
    });
  }

  //-----------Metodos para manejo de eventos del arbol de capas-----------------

  /**
   * Metodo que se ejecuta al seleccionar una capa y
   * lo convierte en un objeto capa y lo agrega a la lista
   * @param event
   */
  onNodeSelected(event: TreeNodeSelectEvent): void {
    // si el nodo tiene hijos se debe capturar el nodo hijo
    if (event.node.children && event.node.children?.length > 0) {
      const childrenNodes = event.node.children;
      childrenNodes.forEach(childNode => {
        childNode.checked = true;
        const layerMap = this.getLayerByID(this.layerMapList, childNode.data);
        if (layerMap) {
          // Verificar si la capa ya existe en la lista
          const layerExists = this.layerSelectedList.some(
            existingLayer => existingLayer.id === layerMap.id
          );
          if (layerExists) {
            // Si la capa ya existe, no se realiza ningún cambio, o se podría lanzar una alerta
            this.handleError(
              'Error al agregar capa',
              new Error('La capa ya se encuentra activa en el área de trabajo')
            );

            childNode.checked = false;
          } else {
            this.addLayerToStore(layerMap); //agrega la capa al mapa
          }
        } else {
          this.handleError(
            'Error al agregar capa',
            new Error('La capa con id:' + childNode.data + 'no se encuentra')
          );
        }
      });
    } else {
      const layerMap = this.getLayerByID(this.layerMapList, event.node.data);
      //event.node.checked = true;
      if (layerMap) {
        // Verificar si la capa ya existe en la lista
        const layerExists = this.layerSelectedList.some(
          existingLayer => existingLayer.id === layerMap.id
        );
        if (layerExists) {
          // Si la capa ya existe, se muestra mensaje
          this.handleError(
            'Error al agregar capa',
            new Error('La capa ya se encuentra activa en el área de trabajo')
          );
        } else {
          const layerToStore: LayerStore = {
            isVisible: true,
            layerDefinition: layerMap,
            layerLevel: LayerLevel.INTERMEDIATE,
            orderInMap: 0,
            transparencyLevel: 0,
          };

          this.mapStore.dispatch(
            MapActions.addLayerToMap({ layer: layerToStore })
          );
        }
      } else {
        this.handleError(
          'Error al agregar capa',
          new Error('La capa con id:' + event.node.data + 'no se encuentra')
        );
      }
    }
  }

  /**
   * Metodo que se ejecuta al desmarcar una capa,
   * la elimina de la lista de capas áreas de trabajo
   * @param event
   */
  onNodeUnselected(event: TreeNodeUnSelectEvent): void {
    if (event.node.children && event.node.children.length > 0) {
      const childrenNodes = event.node.children;
      childrenNodes.forEach(childNode => {
        childNode.checked = false;
        const layerIndex = this.layerSelectedList.findIndex(
          layer => layer.id === childNode.data
        );

        if (layerIndex > -1) {
          const layerMap = this.getLayerByID(
            this.layerMapList,
            event.node.data
          );
          if (layerMap) {
            this.mapStore.dispatch(
              MapActions.deleteLayerOfMap({
                layer: layerMap,
              })
            );
          }
        }
      });
    } else {
      const layerIndex = this.layerSelectedList.findIndex(
        layer => layer.id === event.node.data
      );
      if (layerIndex !== -1) {
        const layerMap = this.getLayerByID(this.layerMapList, event.node.data);
        if (layerMap) {
          this.mapStore.dispatch(
            MapActions.deleteLayerOfMap({
              layer: layerMap,
            })
          );
        }
      }
    }
  }
  /**
   * Metodo para obtener una capa asociada a un ID
   * @param idLayer
   * @returns
   */
  getLayerByID(layerList: CapaMapa[], idLayer: string): CapaMapa | undefined {
    for (const layer of layerList) {
      if (layer.id === idLayer) {
        return layer;
      }
      if (layer.Result) {
        const resultado = this.getLayerByID(layer.Result, idLayer);
        if (resultado) {
          return resultado;
        }
      }
    }
    return undefined;
  }

  //-----------Metodos para cuando se eliminan las capas desde el componete area de trabajo

  /**
   * Metodo para obtener la cantidad de hijos de un nodo
   * @param idParentNode id del nodo padre
   * @returns counterChildren cantidad de hijos
   */
  getChildrenNumberOfANode(idNode: string): number {
    let counterChildren = 0;
    this.selectedNodes.forEach(node => {
      if (node.parent && node.parent.data === idNode) {
        counterChildren++;
      }
    });
    return counterChildren;
  }
  /**
   * Metodo recursivo para encontran un nodo por su ID
   * @param nodes lista de nodos donde se va a buscar
   * @param nodeId id del nodo
   * @returns nodo si hay coincidencias o nulo si no lo encuentra
   */
  findNodeById(nodes: TreeNode[], nodeId: string): TreeNode | null {
    for (const node of nodes) {
      if (node.data === nodeId) {
        if (node.parent) {
          node.checked = false;
          node.partialSelected = false;
          this.markAsUnPartialSelectedNode(node.parent);
        } else {
          node.checked = false;
          node.partialSelected = false;
        }
        return node;
      }
      if (node.children) {
        //aplica recursividad cuando el nodo tiene subcapas
        const foundNode: TreeNode = this.findNodeById(
          node.children,
          nodeId
        ) as TreeNode;
        if (foundNode) {
          return foundNode;
        }
      }
    }
    return null; // Si no se encuentra el nodo
  }

  /**
   * Metodo recursivo para desmarcar los nodos padres cuando se elimina una capa del area de trabajo
   * @param node nodo actual eliminado
   * @returns retorna el nodo modificado
   */
  markAsUnPartialSelectedNode(node: TreeNode): TreeNode | null {
    if (node.parent) {
      node.partialSelected = false;
      node.checked = false;
      this.markAsUnPartialSelectedNode(node.parent);
    } else {
      node.checked = false;
      node.partialSelected = false;
    }
    return node;
  }

  /**
   * mostrar mensajes(error,avisos,etc)
   * @param summaryMessage titulo del mensaje
   * @param keyMessage identificador unico del mensaje
   * @param severityMessage tipo de mensaje (exito,fallo,aviso...)
   * @param detailMessage contenido del mensaje
   */
  showToastMessage(
    summaryMessage: string,
    keyMessage: string,
    severityMessage:
      | 'success'
      | 'info'
      | 'warning'
      | 'danger'
      | 'secondary'
      | 'contrast',
    detailMessage: string
  ): void {
    this.messageService.clear();
    this.messageService.add({
      key: keyMessage,
      severity: severityMessage,
      summary: summaryMessage,
      detail: detailMessage,
    });
    console.error(summaryMessage, ' - ', detailMessage);
  }

  /**
   * Metodo para agregar la capa al store de redux
   * @param layerMap definicion de la capa
   */
  private addLayerToStore(layerMap: CapaMapa): void {
    const layerToStore: LayerStore = {
      isVisible: true,
      layerDefinition: layerMap,
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 0,
      transparencyLevel: 0,
    };
    this.mapStore.dispatch(MapActions.addLayerToMap({ layer: layerToStore }));
  }

  /**
   * Metodo para encapsular el servicio de mensajes de error
   * @param message texto del mensaje
   * @param error error que se genera
   */
  private handleError(message: string, error: Error): void {
    this.showToastMessage(
      'Error',
      'err-message',
      'danger',
      error?.message || message
    );
  }
}
