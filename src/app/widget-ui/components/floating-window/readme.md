## Implementación de Ventanas Flotantes

Implementación completa de un sistema de ventana flotante con contenido dinámico con las siguientes funcionalidades:

1) Arrastre y redimensionamiento interactivo
2) Minimizado/restauración
3) Cierre controlado
4) Inyección dinámica de contenido 
5) Gestión automática de orden de apilamiento (z-index) basada en el store
5) Selección automática de ventana activa al hacer clic

La ventana flotante consta de un objeto con la configuración y valores necesarios para que el componente realice su función de manera adecuada. Adicionalmente cuenta con un estado, cuyos valores por defecto pueden ser configurados de acuerdo con la necesidad.

```jsx
export interface UserInterfaceState {
  // ... propiedades existentes
  floatingWindowsOrder: string[]; // Identificación de ventanas flotantes activas
}
```

# Gestión del Orden de Apilamiento (Z-Index)

El sistema implementa un modelo determinístico de z-index, administrado desde el store global de la UI.

Cada vez que una ventana es creada o activada (click), se ejecuta:

```jsx
bringFloatingWindowToFront({ id });
```

Lo que provoca:

1) Movimientos en el arreglo floatingWindowsOrder
2) Reasignación estructurada del z-index mediante un selector

Al destruir el componente, la ventana se elimina del estado global, previniendo
acumulaciones y fugas de memoria.

```jsx
removeFloatingWindow({ id });
```

# Configuración

Por defecto los valores de configuración (visibilidad de botones, posición inicial por defecto, ancho, alto, etc.) con los cuales se abre la ventana flotante están definidos en la constante `initialUserInterfaceState` del `user-interface.reducer`, por tanto; de ser necesario estos se pueden editar de acuerdo con los requerimientos, así: 

Valores por defecto Ventana flotante
```jsx
const initialFloatingWindowConfig: FloatingWindowConfig = {
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
};
```

# Integración con Widgets.

Cada widget tiene las siguientes propiedades que interactúan directamente con el estado del widget en el evento en que se muestra en la ventana flotante. Por tanto; dado el caso que estos no sean suministrados en la constante `widgetsConfig` en `user-interface.service`, se tomarán por defecto los valores relacionados en la constante `initialFloatingWindowState` en `user-interface.reducer`, así:

```jsx
export const initialFloatingWindowState: FloatingWindowState = {  
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
```

En resumen, los valores que priman al momento en que se abre la ventana flotante, se parametrizan en la configuración del widget, constante `widgetsConfig` en `user-interface.service`.

```jsx
{ 
  posicionX: Posición opcional del lado izquierdo en la que se debe ubica el widget en la ventana flotante
  posicionY: Posición opcional del lado izquierdo en la que se debe ubica el widget en la ventana flotante  
  ancho: Ancho mínimo por defecto del widget en la ventana flotante
  alto: Alto mínimo por defecto del widget en la ventana flotante
  anchoMaximo: Indica el ancho máximo que se puede redimensionar el widget
  altoMaximo: Indica el alto máximo que se puede redimensionar el widget
},
```

## Escenarios de uso

1) Se requiere mostrar un widget (previamente configurado en `widgetsConfig` en `user-interface.service`) en el evento en que se cambie el estado a "abierto": en el templete (HTML) del componente donde se requiera mostrar la ventana flotante, incluir el componente [WindowSingleComponentRenderComponent]. A través; del cual se escuchan los cambios generados en el storage al abrir o cerrar un widget parametrizado en la interfaz de usuario `UserInterfaceService`.

```jsx
<app-window-single-component-render></app-window-single-component-render>
```

2) Para el caso de usar una ventana flotante con contenido inyectado, en el template donde se va utilizar la ventana flotante, incluir el componente `FloatingWindowComponent` e inyectar el contenido dentro de las etiquetas del componente.

```jsx
<app-floating-window 
      [titulo]="Titulo requerido para la ventana"
      [widgetFloatingWindowConfig] => Especificar la propiedad con la configuración particular requerido o la definida por defecto
      (closeWindowEvent)="cerrarWidget()" => Especificar el método que se ejecutará cuando se dé clic en el botón cerrar de la ventana flotante
  >   
      <app-single-component-render></app-single-component-render>    
  </app-floating-window>
  ```
## Personalización y estilos

1) Alto del header; el componente cuenta con la propiedad  `tamanoCabecera`, a través de la cual se puede enviar la altura en pixeles, dado el caso que no sea enviado el valor por parámetro, el componente especifica 56px de alto. 
2) iconClosePosition ('left', 'right'), permite especificar la posición en la que se muestra el ícono de cerrar con relación al título de la cabecera.
3) iconMinimizePosition ('left','right'), en la cual se especifica la posición en la que se muestra el ícono de minimizar con relación al título de la cabecera.
4) textHeaderClass y bodyClass, aplica estilo personalizado al texto de la cabecera y cuerpo de la ventana flotante.