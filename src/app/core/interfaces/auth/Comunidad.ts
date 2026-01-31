/**
 * Interfce para las comunidades
 * @date 2025-11-14
 * @author Andres Fabian Simbaqueba
 */
export interface Comunidades {
  Id_Comunidad?: string; //primary key
  Nombre_Comunidad: string;
  Logo: string | null;
  Color_Primario: string;
  Color_Secundario: string;
  Color_Terciario: string;
  Url_Tabla_Contenido: string;
}
