import { ButtonSeverity } from 'primeng/button';

/**
 * Configuración inicial de una ventana flotante.
 * Define las propiedades personalizables y capacidades de la ventana.
 */
export interface FloatingWindowConfig {
  x: number; // Posición inicial en el eje X (izquierda-left), en la que se abre la ventana
  y: number; // Posición inicial en el eje Y (arriba-top), en la que se abre la ventana
  width: number; // Ancho mínimo en píxeles que tiene la ventana flotante al momento de ser mostrada al usuario
  maxWidth?: number; // Ancho máximo en píxeles que se puede redimensionar la ventana, se reemplaza por el ancho máximo del widget (widgetsConfig.anchoMaximo)
  height: number; // Alto mínimo en píxeles
  maxHeight?: number; // Alto máximo en píxeles que se puede redimensionar el widget, se reemplaza por el alto máximo del widget (widgetsConfig.altoMaximo)
  enableMinimize: boolean; // Habilitar/deshabilitar botón minimizar
  enableResize: boolean; // Habilitar/deshabilitar botón redimensionar
  enableClose: boolean; // Habilitar/deshabilitar botón cerrar
  enableDrag: boolean; // Habilitar/deshabilitar mover ventana flotante
  headerClass?: string; // Estilo personalizado para la barra de título
  textHeaderClass?: string; // Estilo personalizado para el texto de la ventana flotante
  bodyClass?: string; // Estilo personalizado para el contenido de la ventana flotante
  buttomText?: boolean; // Estilo personalizado para los botones el cual identifica sí muetra el borde del botón (true) o solo el ícono (false)
  buttomSeverity?: ButtonSeverity; // Estilo personalizado para los botones
  buttomSize?: 'small' | 'large' | undefined; // Tamaño para los botones
  buttomRounded?: boolean; // Estilo redondeo para los botones
  iconMinimize?: string; // Icono minimizar
  iconMaximize?: string; // Icono Maximizar
  iconClose?: string; // Icono Cerrar
  iconClosePosition?: 'left' | 'right'; // Posición en la que se muestra el ícono de cerrar con relación al título
  iconMinimizePosition?: 'left' | 'right'; // Posición en la que se muestra el ícono de minimizar con relación al título
}

/**
 * Estado actual de una ventana flotante.
 * Representa propiedades dinámicas que cambian durante la interacción del usuario.
 */
export interface FloatingWindowState {
  x: number; //Posición del lado izquierdo (X-left) con la que se abre el widwet, se reemplaza por widgetsConfig.posicionX.
  y: number; // Posición superior (Y-top) con la que se abre el widwet, se reemplaza por widgetsConfig.posicionY.
  width: number; // Ancho mínimo que puede tener la ventana, se reemplaza por widgetsConfig.ancho.
  height: number; // Alto mínimo que puede tener la ventana, se reemplaza por widgetsConfig.alto.
  isMinimized: boolean; // Identifica sí la ventana flotante está minimizada
  isDragging: boolean; // Identifica sí la ventana flotante está siendo movida
  isResizing: boolean; // Identifica sí la ventana flotante está siendo redimensionada
  dragStartX: number; // Posición final X después del arrastre
  dragStartY: number; // Posición final Y después del arrastre
  resizeStartX: number; // Posición inicial X para redimensionar
  resizeStartY: number; // Posición inicial Y para redimensionar
  leftLimit: number; // Indica el límite izquierdo (left) hasta donde se puede mover la ventana
  topLimit: number; // Indica el límite superior (top) hasta donde se puede mover la ventana
  rightLimit: number; // Indica el límite derecha (right) hasta donde se puede mover la ventana
  bottomLimit: number; // Indica el límite derecha (bottom) hasta donde se puede mover la ventana
}
