/**
 * Interface para la coleccion TipoServicio
 * @date 2025-12-05
 * @author Andres Fabian Simbaqueba
 */
export interface Tipo_Servicio {
  Idtiposervicio?: number;
  Descripcion: 'WMS' | 'REST' | 'FILE';
  Version: string;
}
