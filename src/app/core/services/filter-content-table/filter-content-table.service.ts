import { Injectable } from '@angular/core';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';

/**
 * Sertvicio que permite filtrar datos en la tabla de contenido y metodos auxiliares propios para la tabla de contenido
 * @date 29-07-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Injectable()
export class FilterContentTableService {
  /**
   * Método para filtrar todos los nodos hoja cuyo título coincida con una palabra clave.
   * Todos los resultados se devuelven en un solo objeto contenedor.
   * @param query, palabra clave a buscar
   * @param originalTree, array de capas para buscar
   * @returns Array de nodos que cumplen la consulta
   */
  filterNodesLineal(query: string, originalList: CapaMapa[]): CapaMapa {
    // Crear un contenedor para los resultados encontrados
    const resultadoFiltrado: CapaMapa = {
      id: 'resultado-filtrado',
      titulo: query,
      leaf: false,
      Result: [],
    };
    if (query.trim() !== '') {
      const coincidencias: CapaMapa[] = [];
      for (const capa of originalList) {
        // Verifica si es un nodo hoja y si su título contiene la query
        if (
          capa.leaf &&
          capa.titulo.toLowerCase().includes(query.toLowerCase())
        ) {
          coincidencias.push(capa);
        }
        // Si tiene hijos, aplicar la recursión
        if (capa.Result && capa.Result.length > 0) {
          const hijosFiltrados = this.filterNodesLineal(query, capa.Result);
          if (hijosFiltrados.Result && hijosFiltrados.Result.length > 0) {
            coincidencias.push(...hijosFiltrados.Result);
          }
        }
      }
      if (coincidencias.length > 0) {
        resultadoFiltrado.Result = coincidencias;
      }
    }
    return resultadoFiltrado;
  }

  /**
   * Metodo para agregar capas sin repetir objetos que tengan el mismo ID
   * @param layerList lista de capas a ser agregadas
   * @param existingLayerList  lista de capas exixtente o donde se van a agregar las capas unicas
   */
  addLayerWithUniqueID(
    layerList: CapaMapa[] | CapaMapa,
    existingLayerList: CapaMapa[]
  ): CapaMapa[] {
    const newLayerList = Array.isArray(layerList) ? layerList : [layerList];
    for (const nuevaCapa of newLayerList) {
      const exist = existingLayerList.some(c => c.id === nuevaCapa.id);
      if (!exist) {
        const layerCopy: CapaMapa = { ...nuevaCapa };
        if (nuevaCapa.Result && Array.isArray(nuevaCapa.Result)) {
          layerCopy.Result = [];
          this.addLayerWithUniqueID(nuevaCapa.Result, layerCopy.Result);
        }
        existingLayerList.push(layerCopy);
      }
    }
    return existingLayerList;
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
}
