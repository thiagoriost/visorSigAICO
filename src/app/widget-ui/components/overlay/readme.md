# 1. Instrucciones para el uso del componente [OverlayComponent]

> ⚠️ **Importante:** Para garantizar el funcionamiento correcto del componente `[OverlayComponent]`, **el componente padre debe tener `position: relative`**.

## ¿Por qué es necesario?

Este componente utiliza posicionamiento absoluto (`position: absolute`) para ubicar elementos internos (por ejemplo, menús desplegables, tooltips, popovers, etc.).  
Para que estos elementos se posicionen correctamente en relación con su contenedor, es obligatorio que el elemento padre tenga la propiedad CSS:

```css
position: relative;
```

O si estas utilizando Tailwind CSS o PrimeFlex

```jsx
<div class="relative">
  <OverlayComponent />
</div>
```

### Qué ocurre si se omite?

> Si no se establece position: relative en el padre, el componente puede posicionarse de forma incorrecta en el documento, ya que se posicionará en relación con el contenedor más cercano que tenga una posición distinta a static.

# 2. Inyectando contenido en el componente

Adicionalmente, este componente permite que se le inyecte contenido HTML a través de **ng-content**, clase de angular que permite inyectar contenido para personalizar componentes y adaptarlos dinámicamente.

Este componente es un velo que muestra un div sobre otros componentes, los estilos propios para visualizar el contenido deben aplicarse en cada implementación de este componente.

## Cómo utilizarlo

En la plantilla HTML donde se utiliza el componente **app-overlay** se puede inyectar el contenido que se desee para que se muestre dentro de dicho componente. A continuación, podemos ver un ejemplo de como agregar un titulo y un spinner de carga al componente.

### Ejemplo

```jsx
<app-overlay class="card flex flex-column justify-content-center align-items-center h-auto bg-white border-round shadow-4 w-auto">
  <p class="font-bold text-xl text-center"> Este es un titulo de prueba</p>
  <p-progress-spinner ariaLabel="loading" />
</app-overlay>
```
