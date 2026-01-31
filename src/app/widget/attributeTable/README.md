# AttributeTableComponent

Este componente muestra una tabla de atributos basada en un `FeatureCollection` de tipo GeoJSON. Permite visualizar, exportar, dibujar y borrar geometrías en el mapa, todo dentro de una interfaz interactiva.

## Uso 

1. **Definición del Objeto Tipo AttributeTableData**: El objeto AttributeTableData Contiene el titulo, el geojson con la informacion a mostrar en la tabla y debe indicar si al cargar la tabla se desea que se dibuje y quede visible el geojson.

```bash
export interface AttributeTableData {
  titulo: string;
  geojson: GeoJSONData;
  visible: boolean;
}
```

2. **Envío de Datos al Store**: El objeto definido se envía al store  para que al invocar la tabla de atributos esta los consulte y cargue correctamente.


```bash
// Envío de los datos al store
this.store.dispatch(MapActions.setWidgetAttributeTableData({
  widgetId: 'tabla-atributos', // ID del widget para la tabla de atributos
  data: data, // Objeto tipo AttributeTableData
}));
```


3. **Mostrar la Tabla de Atributos**: La tabla de atributos debe ser invocada para mostrarla, ella busca los datos cargados previamente al store, los organiza y nos habilita las opciones de visualización y descarga.


```bash
// Cambiar la visibilidad del widget de la tabla de atributos
this.userInterfaceService.cambiarVisibleWidget('attributeTable', true);

```

**NOTA:** Una vez que los datos han sido enviados al store y la tabla de atributos ha sido invocada, la tabla se actualizará automáticamente con los datos cargados, permitiendo visualizar las geometrías y sus atributos, además de habilitar las opciones de exportación y manipulación.