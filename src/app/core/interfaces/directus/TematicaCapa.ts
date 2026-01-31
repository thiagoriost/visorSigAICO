import { Capa } from '@app/core/interfaces/directus/Capa';
import { Tematica } from '@app/core/interfaces/directus/Tematica';

/**
 * Interface para la coleccion de capas asociadas a la tematica
 * @date 2025-12-05
 * @author Andres Fabian Simbaqueba
 */
export interface Tematica_Capa {
  id?: number;
  IdTematica: number | Tematica;
  IdCapa: number | Capa;
  visible: string;
}
