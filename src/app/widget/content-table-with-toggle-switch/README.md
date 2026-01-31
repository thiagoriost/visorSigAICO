# Widget ContentTableToggleSwitchComponent (Tabla de contenido 2)

## Descripcion

El componente `ContentTableToggleSwitchComponent` permite visualizar el listado de capas disponibles para interactuar con el visor geográfico. Las capas están organizadas por temáticas y se renderizan recursivamente de acuerdo a los niveles que contenga cada temática. Adcionalmente permite realizar busqueda de capas, activacón de capas, eliminación de capas, entre otros.

## Proposito

El proposito de este componente es permitirle al usuario activar y desactivar capas al mapa, filtrar capas y eliminar todas las capas del mapa.

## Uso del componente

El componente contiene nueve parametros de entrada que sirven para ajustar la apariencia de los elementos mostrados al usuario:

- `placeHolderSearchInput`: ajusta el placeholder del input para buscar y/o filtrar capas. Si no se proporciona por defecto se utiliza `Buscar capa...`
- `iconSearchInputClass`: indica la clase para el icono del botón de busqueda del componente, si no se proporciona por defecto se utiliza `pi pi-search`.
- `iconPosition`: indica la posición (derecha o izquierda) del icono de buscar en el input para filtrar capas. Si no se proporciona por defecto se utiliza `right`.
- `iconInputVisible`: indica si se muestra el icono de buscar en el componente de buscar capas. Si no se propociona por defecto se utiliza `true`.
- `iconEraserLayersClass`: indica la clase para el icono del botón de deseleccionar todas las capas, si no se proporciona por defecto se utiliza `pi pi-eraser`.
- `textColor`: ajusta el color del texto (titulo) de la capa, tanto de nodos hijos como nodos padre. Si no se proporciona el componente toma por defecto el color `text-color` definido en el preset.
- `isCenteredLayerParentTitle`: indica si el titulo de la capa es centrado o no, solo aplica para capas padre. Si no se proporciona por defecto se utiliza `false`.
- `requiredDivider`: indica si se debe gregar un separador entre las capas.Si no se proporciona por defecto se utiliza `false`.
- `requireIdentation`: indica si al renderizar las capas, los nodos hijos se identan hacia la derecha o se mantienen al mismo nivel que la capa padre.Si no se proporciona por defecto se utiliza `true`.

### Ejemplos de uso

El componente toma los valores por defecto

```html
<app-content-table-toggle-switch />
```

El componente toma los valores inyectados

```html
<app-content-table-toggle-switch
  [placeHolderSearchInput]="'Buscar capa...'"
  [iconSearchInputClass]="ICON_VISOR_BUSCAR_CAPA"
  [iconPosition]="'right'"
  [iconInputVisible]="true"
  [iconEraserLayersClass]="'ICON_VISOR_BORRADOR'"
  [textColor]="'tex-red-500'"
  [isCenteredLayerParentTitle]="false"
  [requiredDivider]="false"
  [requireIdentation]="true"></app-content-table-toggle-switch>
```

## Servicios requeridos

Estos son los servicios requeridos por el componente:

- `Store<MapState>` Permite interactuar con el store donde se encuentran las configuraciones y capas adicionadas al mapa
- `MessageService` Permite mostrar mensajes en la pantalla a traves del `toast` de la aplicación
- `LayerDefinitionsService` Permite consultar las capas disponibles para interactuar en el mapa
- `FilterContentTableService` Permite realizar el filtrado de capas en la tabla de contenido

## Notas

Este componente hereda una directiva llamada `ContentTableDirective` que contiene las funcioanalidades principales de la tabla de contenido, entre las cuales se pueden mencionar: consultar capas disponibles del store, eliminar todas las capas del mapa, entre otras.
