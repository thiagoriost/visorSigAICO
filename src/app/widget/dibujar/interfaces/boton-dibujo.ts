/**
 * Tipos posibles de herramientas de dibujo.
 */
export type TipoDibujo =
  | 'Point'
  | 'Line'
  | 'LineString'
  | 'LineAlzada'
  | 'Triangle'
  | 'Extension'
  | 'Circle'
  | 'Polygon'
  | 'HanddrawPolygon'
  | 'Text';

/**
 * Estructura de cada botón de dibujo.
 */
export interface BotonDibujo {
  id: string;
  tipo: TipoDibujo;
  icon: string;
  tooltip: string;
}
