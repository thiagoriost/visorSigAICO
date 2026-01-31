# Widget ContentTableVersion5

## Descripcion

El componente `ContentTableAndWorkAreaComponent` está compuesto por dos `tabs` en los cuales se encuentran los siguientes componentes:

1. `ContentTableToggleSwitchComponent`: permite visualizar el listado de capas disponibles para interactuar con el visor geográfico. Las capas están organizadas por temáticas y se renderizan recursivamente de acuerdo a los niveles que contenga cada temática.
2. `WorkAreaV3Component`: permite visualizar el listado de capas que han sido agregadas al mapa tanto de la tabla de contenido como de servicios externos. Este componente permite la manipulación de las capas de manera independiente incluyendo funcionalidades de mostrar/ocultar, generar transparencia, visualizar metadatos, `mostrar leyenda` y eliminar capa. Adicionalmente, permite apagar o prender todas las capas cargadas al mapa.

## Proposito

El proposito de este componente está dividido en tres items fundamentales:

- permitir al usuario adicionar capas al mapa desde la tabla de contenido, filtrar capas y eliminar las capas activas del mapa.
- permitir al usuario visualizar la zona de trabajo con las capas que han sido adicionadas al mapa, así mismo permitir que el usuario manipule cada capa de manera independiente.
- permitir al usuario ordenar las capas en la zona de trabajo y que se vean reflejadas en el mapa.

## Uso del componente

El componente contiene trece parámetros de entrada que permiten ajustar la apariencia de los elementos mostrados al usuario:

- `isLegendVisible`: indica si la layenda de la capa es visible al agregagrse a la zona de trabajo. Sino se proporciona el parámetro se tomará por defecto el valor `false`.
- `ocultLayerIcon`: nombre o clase del icono para ocultar la capa.
- `showLayerIcon`: nombre o clase del icono para mostrar la capa.
- `setTransparencyIcon`: nombre o clase del icono para ajustra la transparencia de la capa.
- `showMetadataIcon`: nombre o clase del icono para mostrar los metadatos de la capa.
- `showLegendIcon`: nombre o clase del icono para mostrar la leyenda de la capa.
- `deleteLayerIcon`: nombre o clase del icono para eliminar la capa.
- `textColor`: clase para ajustar el color e los textos de la capa.
- `isTextButton`: indica si se muestra solo el icono o texto del boton (sin fondo).
- `isRoundedButton`: indica si el boton es redondeado o cuadrado. Se aplica cuando `isTextButton` es `false`.
- `isCenteredButtons`: indica la botonera superior está centrada en el componente o alineada a la derecha. Por defecto está alineada a la derecha.
- `turnOnAllLayersIcon`: nombre o clase del icono para apagar todas las capas.
- `turnOffAllLayersIcon`: nombre o clase del icono para prender todas las capas.
- `placeHolderSearchInput`: indica el placeholder del input de busqueda.
- `iconSearchInputClass`: nombre o clase del icono del input de busqueda.
- `iconPosition`: posicion del icono de busqueda (derecha o izquierda).
- `iconInputVisible`: indica si el icono de busqueda es visible.
- `isCenteredLayerParentTitle`: indica si el titulo de las capas padre es centrado.
- `requiredDivider`: indica si se agrega un separador entre las capas.
- `requireIdentation`: indica si las capas hija requieren identacion.

### Ejemplos de uso

El componente toma los valores por defecto

```html
<app-content-table-and-work-area />
```

El componente toma los valores inyectados

```html
<app-content-table-and-work-area
  [isLegendVisible]="true"
  [ocultLayerIcon]="'pi pi-eye-slash'"
  [showLayerIcon]="'pi pi-eye'"
  [setTransparencyIcon]="'pi pi-silders-h'"
  [showMetadataIcon]="'ICON_VISOR_METADATA'"
  [showLegendIcon]="'ICON_VISOR_PALETTE'"
  [deleteLayerIcon]="'pi pi-times'"
  [textColor]="'text-blue-400'"
  [isTextButton]="true"
  [isRoundedButton]="false"
  [isCenteredButtons]="false"
  [turnOnAllLayersIcon]="'pi pi-eye'"
  [turnOffAllLayersIcon]="'pi pi-eye-slash'"></app-content-table-and-work-area>
```

## Servicios requeridos

## Notas

El componente `LayerItemWithLegendComponent` hereda una directiva llamada `LayerItemBaseDirective` que contiene las funcioanalidades principales de una capa, entre las cuales se pueden mencionar: agregar al mapa, eliminar del mapa, mostrar/ocultar, generar transparencia, visualizar metadatos, entre otros.

Para poder personalizar este componente, es necesario envolverlo en un componente e inyectarle las propiedades necesarias.
