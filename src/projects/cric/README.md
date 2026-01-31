# 📖 README – PAGE: Visor Geográfico CRIC

## Introducción  

**PAGE: Visor Geográfico CRIC** es una solución modular desarrollada en **Angular v19** que permite la construcción de un visor de mapas interactivo con enfoque en escalabilidad, mantenibilidad y optimización de recursos.  

La aplicación integra **NgRx** para la gestión del estado global, garantizando un flujo de datos predecible y centralizado, lo cual facilita la integración de múltiples widgets y componentes especializados sin perder consistencia.  

Este visor está diseñado con una arquitectura flexible que permite incorporar barras laterales, menús interactivos y componentes auxiliares (como escalas, coordenadas o navegación del mapa). Además, se aprovecha **PrimeNG** y **PrimeFlex/Tailwind** para el diseño de interfaces modernas y responsivas, mientras que el **CDK de Angular** se utiliza para detectar adaptaciones en la resolución de pantalla, asegurando una experiencia de usuario óptima en dispositivos de escritorio y móviles.  

El visor Geográfico CRIC persigue tres objetivos principales:  

1. **Facilidad de uso** → Interfaces limpias y componentes reutilizables.  
2. **Escalabilidad** → Estructura modular que permite añadir o reemplazar widgets sin modificar el núcleo.  
3. **Mantenibilidad** → Código documentado, pruebas unitarias en todos los componentes y patrones de diseño claros.  

En conjunto, la solución constituye un **ecosistema geográfico integral** que combina visualización, interacción y gestión de datos en una sola plataforma.  


------------------------------------------------------------------------

## 📂 Estructura General del Layout y Page del Visor Geográfico CRIC

La pagina principal del visor se compone de varios **componentes personalizados**, cada
uno documentado y probado de manera unitaria para garantizar su correcto
funcionamiento.

### 🔹 1. `LayoutBComponent`

-   **Funcionalidad**: Estructura principal de la aplicación con soporte
    de sidebar dinámico.
-   **Características**:
    -   Manejo de resolución de pantalla mediante `BreakpointObserver`.
    -   Sidebar redimensionable con límites configurables.
    -   Soporte para mostrar el sidebar como **drawer** en pantallas
        pequeñas.
    -   Estados de minimización y maximización del sidebar.
-   **Notas**: Incluye documentación línea a línea y pruebas unitarias.

------------------------------------------------------------------------

### 🔹 2. `IndexPageComponent`

-   **Funcionalidad**: Representar la página principal del visor geográfico.
-   **Características**:
    -   Sirve como contenedor que integra los diferentes componentes del layout (LeftbarHeaderComponent, CricBottombarComponent, CricRightbarComponent, etc.).
    -   Administra la disposición general de la página, asegurando que las distintas secciones convivan de manera coherente.
-   **Notas**: Este componente actúa como punto de entrada visual del visor. Incluye documentación línea a línea y pruebas unitarias.

------------------------------------------------------------------------

### 🔹 3. `LeftbarHeaderComponent`

-   **Funcionalidad**: Encabezado de la barra lateral izquierda.
-   **Características**:
    -   Muestra íconos configurables.
    -   Controla acciones como minimizar o cerrar la barra lateral.
-   **Notas**: Documentado línea por línea y probado con pruebas
    unitarias.

------------------------------------------------------------------------


### 🔹 4. `CricBottombarComponent`

-   **Funcionalidad**: Barra inferior de controles y accesos rápidos.
-   **Características**:
    -   Distribuye dinámicamente los botones de acción en la parte
        inferior.
    -   Usa **PrimeFlex** para mantener disposición responsiva.
    -   Parametrizable con entradas dinámicas desde el padre.
-   **Notas**: Documentado completamente y probado.

------------------------------------------------------------------------

### 🔹 5. Otros Componentes Auxiliares

-   **Inputs dinámicos** y **contenedores adaptables** con `ng-content`.
-   Soporte de **PrimeNG Buttons, Cards, Drawers y Menús**.
-   Adaptabilidad asegurada con utilidades de **PrimeFlex**.

------------------------------------------------------------------------

## 🧪 Pruebas unitarias  

Se implementaron pruebas unitarias escritas en **Jasmine + Karma**, para validar el comportamiento de los componentes clave.  
- **LeftbarHeaderComponent:** Validación de renderizado condicional (`isMobile`).  
- **LayoutBComponent:**  
  - Verifica el redimensionamiento del sidebar.  
  - Comprueba la detección de pantallas pequeñas con `BreakpointObserver`.  
- **CricRightbarComponent:**  
  - Simulación de selección de menú y dispatch de acciones a NgRx.  
  - Validación de configuración inicial de `MapNavButtons`.  
- **CricBottombarComponent:**  
  - Validación de la renderización de accesos rápidos.  
  - Verificación del uso de `OnPush` y correcta propagación de cambios.  
- **IndexPageComponent:**  
  - Validación de integración con componentes hijos.  
  - Comprobación de que actúa como contenedor del layout.  

------------------------------------------------------------------------