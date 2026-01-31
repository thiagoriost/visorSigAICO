# Widget ContentTableVersion3

## Descripcion

El componente `ContentTableV3Component` permite visualizar el listado de capas disponibles para interactuar con el visor geográfico. Las capas están organizadas por temáticas y se renderizan recursivamente de acuerdo a los niveles que contenga cada temática. Adcionalmente permite realizar busqueda de capas, activacón de capas, eliminación de capas, entre otros.

## Proposito

El proposito de este componente es permitirle al usuario adicionar capas al mapa, filtrar capas y eliminar las capas del mapa, así mismo permite manipular cada capa de manera independiente ofreciendole al usuario funcionalidades como ajustar transparencia, ocultar/mostrar, visualizar metadatos y eliminar la capa del mapa.

## Uso del componente

El componente contiene tres parametros de entrada que sirven para ajustar la apariencia de los elementos mostrados al usuario:

- `backgroundColor`: ajusta el color de las cabeceras de las tematicas, se puede agregar un color en formato RGB, clase auxiliar, entre otros. Sino se proporciona el parámetro se tomará por defecto el color de la varibale bg-primary-500.
- `isExpandedList`: Indica si las tematicas de las capas se muestran expandidas o colapsadas. Si no se proporciona la variable el componente las muestra expandidas.
- `iconsColor`: ajusta el color del icono del toggle del acordion. Si no se proporciona el componente valida si hay un color de fondo y lo aplica o se aplica el color definido para los textos.
- `layerItemIconsColor`: ajusta el color de los iconos de la capa. Si no se proporciona el componente toma por defecto el color `text-red-500`.

### Ejemplos de uso

El componente toma los valores por defecto

```html
<app-content-table-v3 />
```

El componente toma los valores inyectados

```html
<app-content-table-v3
  [backgroundColor]="transparent"
  [isExpandedList]="true"
  [iconsColor]="text-orange-500"></app-content-table-v3>
```

## Servicios requeridos

Estos son los servicios requeridos por el componente:

- `Store<MapState>` Permite interactuar con el store donde se encuentran las configuraciones y capas adicionadas al mapa
- `MessageService` Permite mostrar mensajes en la pantalla a traves del `toast` de la aplicación
- `LayerDefinitionsService` Permite consultar las capas disponibles para interactuar en el mapa
- `FilterContentTableService` Permite realizar el filtrado de capas en la tabla de contenido

## Notas

Este componente hereda una directiva llamada `ContentTableDirective` que contiene las funcioanalidades principales de la tabla de contenido, entre las cuales se pueden mencionar: consultar capas disponibles, agregar capas con unico ID, eliminar todas las capas, obtener las capas cargadas al store del mapa, entre otras.
