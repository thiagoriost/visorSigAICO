<p> 
    <h1 align="center"> 
        Tour con TourGuideJS
    </h1>
</p>

Este servicio permite gestionar tours interactivos en la aplicación usando TourGuideJS.
Se encarga de inicializar pasos y controlar la navegación.


## Importacion

Para el correcto funcionamiento del tour, en cada proyecto donde se implemente es necesario realizar la importación de los estilos de TourGuideJS en dos lugares:

* En el archivo styles.scss del proyecto agregar:

```bash
/* === TOUR GUIDE JS === */

@use '@sjmc11/tourguidejs/dist/css/tour.min.css';
```

* En el angular.json del proyecto, incluir también la referencia al CSS:

```bash
"styles": [
 "node_modules/@sjmc11/tourguidejs/dist/css/tour.min.css"
 ],
```

## Uso

### 1. Definir pasos del tour

```ts
export const launcherTourSteps: TourGuideStep[] = [
  { target: '#btn-launcher', content: 'Aquí puedes abrir el menú principal.' },
  { target: '#panel-info', content: 'Este panel muestra la información general.' },
];
```

### 2. Iniciar el tour desde un componente

```ts
constructor(private tour: TourService) {}

iniciarTour() {
  this.tour.start({
    steps: launcherTourSteps,
    dialogPlacement: 'bottom',
    autoScroll: true
  });
}
```

### 3. Tabla de opciones de configuración

| Opción | Tipo | Descripción |
|-------|------|-------------|
| autoScroll | boolean | Desplaza automáticamente la pantalla. |
| autoScrollSmooth | boolean | Desplazamiento suave. |
| autoScrollOffset | number | Margen del auto-scroll. |
| backdropClass | string | Clase CSS del fondo. |
| backdropAnimate | boolean | Anima el fondo. |
| backdropColor | string | Color RGBA del fondo. |
| targetPadding | number | Espacio alrededor del objetivo. |
| dialogClass | string | Clase del cuadro. |
| allowDialogOverlap | boolean | Permite superposición. |
| dialogZ | number | Z-index del cuadro. |
| dialogWidth | number | Ancho del cuadro. |
| dialogMaxWidth | number | Máximo ancho del cuadro. |
| dialogAnimate | boolean | Anima el cuadro. |
| dialogPlacement | string | Ubicación del cuadro. |
| nextLabel | string | Texto del botón Siguiente. |
| prevLabel | string | Texto del botón Anterior. |
| finishLabel | string | Texto Finalizar. |
| hideNext | boolean | Oculta Siguiente. |
| hidePrev | boolean | Oculta Anterior. |
| completeOnFinish | boolean | Guarda en localStorage. |
| keyboardControls | boolean | Permite teclas. |
| exitOnEscape | boolean | Salir con ESC. |
| exitOnClickOutside | boolean | Salir al hacer clic fuera. |
| showStepDots | boolean | Muestra puntos. |
| stepDotsPlacement | string | Ubicación de puntos. |
| showButtons | boolean | Botones visibles. |
| showStepProgress | boolean | Muestra progreso. |
| progressBar | string | Barra de progreso. |
| closeButton | boolean | Muestra botón cerrar. |
| rememberStep | boolean | Recuerda último paso. |
| debug | boolean | Modo debug. |
| steps | TourGuideStep[] | Pasos del tour. |
| activeStepInteraction | boolean | Permite interacción. |


