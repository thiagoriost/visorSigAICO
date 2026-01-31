# Widget ContentTableV4

## Descripcion

El componente `ContentTableV4Component` permite visualizar el listado de capas disponibles para interactuar con el visor geográfico. Las capas están organizadas por temáticas y se renderizan recursivamente de acuerdo a los niveles que contenga cada temática. Adcionalmente permite realizar busqueda de capas, activacón de capas, eliminación de capas, entre otros. El componente está compuesto por el componente de buscar capa y una botonera superior con opciones de prender/apagar las capas y desseleccionar todas las capas.

## Proposito

El proposito de este componente es permitirle al usuario adicionar capas al mapa, filtrar capas y eliminar las capas del mapa, así mismo permite manipular cada capa de manera independiente ofreciendole al usuario funcionalidades como ajustar transparencia, visualizar metadatos y eliminar la capa del mapa.

## Uso del componente

El componente contiene dos parametros de entrada que sirve para ajustar la apariencia de los elementos mostrados al usuario:

- `iconTextColor`: ajusta el color de los iconos de la botonera superior
- `textColor`: ajusta el color del texto de la capa (titulo)
- `sizeButton`: ajusta el tamaño de los botones de la botonera superior
- `fontSizeLeafLayer`: ajusta el tamaño de la fuente para las capas tipo hoja
- `fontSizeParentLayer`: ajusta el tamaño de la fuente para las capas tipo padre
- `fontSizeTransparencyText`: ajusta el tamaño de la fuente para el texto `Transparencia` de la capa
- `severityButton`: ajusta el aspecto de los botones de `Más opciones` de la capa

### Ejemplos de uso

El componente toma los valores por defecto

```html
<app-content-table-v4 />
```

El componente toma los valores inyectados

```html
<app-content-table-v4
  [iconTextColor]="text-red-500"
  [textColor]="text-color"
  [sizeButton]="'large'"
  [fontSizeLeafLayer]="'text-base'"
  [fontSizeParentLayer]="'text-2xl'"
  [fontSizeTransparencyText]="'text-sm'"
  [severityButton]="'contrast'"></app-content-table-v4>
```

## Servicios requeridos

Estos son los servicios requeridos por el componente:

- `Store<MapState>` Permite interactuar con el store donde se encuentran las configuraciones y capas adicionadas al mapa
- `MessageService` Permite mostrar mensajes en la pantalla a traves del `toast` de la aplicación
- `LayerDefinitionsService` Permite consultar las capas disponibles para interactuar en el mapa
- `FilterContentTableService` Permite realizar el filtrado de capas en la tabla de contenido

## Notas

Este componente hereda una directiva llamada `ContentTableDirective` que contiene las funcioanalidades principales de la tabla de contenido, entre las cuales se pueden mencionar: obtener las capas cargadas al store del mapa,agregar las capas cargadas al mapa, obtener las capas del area de trabajo,filtrar capas, eliminar todas las capas, entre otras.
