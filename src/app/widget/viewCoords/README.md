# Componente app-view-coords

El componente app-view-coords es una herramienta de visualización de coordenadas diseñada para mostrar la ubicación del cursor de un mapa (generalmente OpenLayers o Leaflet) en un CRS (Sistema de Referencia de Coordenadas) específico.

Su principal ventaja es que maneja la lógica de transformación (usando proj4) y se suscribe a los eventos del mapa, simplificando la interfaz del usuario final.

## ⚙️ Integración del Componente

Este componente se debe integrar como un elemento hijo dentro de cualquier otro componente o contenedor que gestione el estado de la aplicación.

1. Inclusión en la Plantilla HTML

Para usar el componente, inclúyelo en tu plantilla Angular y pasa el código EPSG utilizando el enum `CRSCode`:

```
<div class="map-controls">
  <app-view-coords [crsCode]="CRSCode.MAGNA_OCCIDENTE"></app-view-coords>
</div>
```

2. Definición del Input

El componente requiere obligatoriamente un único Input:
| Propiedad      | Tipo            | Descripción                                                     | Ejemplo de Valor |
|----------------|-----------------|-----------------------------------------------------------------|------------------|
| crsCodeInput   | CRSCode (string) | El código EPSG al que se deben transformar y mostrar las coordenadas. | 'EPSG:9377'      |


##  Códigos de Proyección (CRSCode)

Asegúrate de importar y utilizar el Enum o los strings definidos para los códigos CRS en tu componente padre. Los códigos soportados por el servicio de transformación son:

| Código    | Descripción                                         | Formato de Salida                                |
|-----------|-----------------------------------------------------|--------------------------------------------------|
| EPSG:9377 | MAGNA Nacional (Origen Nacional/CTM12) - Vigente    | Métrico ($X$: 5,000,000, $Y$: 2,000,000)         |
| EPSG:3116 | MAGNA Bogotá (Zona Central) - Antiguo               | Métrico ($X$: 1,000,000, $Y$: 1,000,000)         |
| EPSG:4686 | MAGNA-SIRGAS (Geográficas)                          | Grados, Minutos, Segundos (DMS)                  |
| EPSG:4326 | WGS84 (Geográficas)                                 | Grados, Minutos, Segundos (DMS)                  |


## Flujo de Funcionamiento

El componente opera con el siguiente flujo de datos y control:

1. Suscripción: app-view-coords llama a viewCoordsService.listenCursorCoordinates(crsCode).
2. Transformación: El servicio:
    - Registra la definición geodésica correcta.
    - Escucha el movimiento del mapa (que siempre emite en EPSG:4326 o 4686).
    - Transforma las coordenadas de entrada al crsCode solicitado.

2. Visualización: El componente app-view-coords recibe el resultado de la transformación y actualiza sus signals (lon y lat), mostrando las coordenadas correctas en tiempo real al usuario.