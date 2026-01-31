# User Interface Service

## Descripción

El UserInterfaceService centraliza el registro, carga y estado de los widgets del visor. Se apoya en NgRx Store para sincronizar visibilidad y lista disponible de widgets (normales y overlay) y expone utilidades para obtener sus componentes dinámicamente.

## Propósito

El propósito de este servicio es proporcionar una zona de registro y gestión de widgets. Los widgets son piezas independientes con un propósito y funcionalidad específicos. Al registrar los widgets en este servicio, pueden ser cargados automáticamente por el `PanelWindowComponent` cuando el usuario los solicite, permitiendo una carga peresoza y optimizando el rendimiento de la aplicación.

## Registro de Widgets

Para registrar nuevos widgets, sigue estos pasos:

1. **Crear el Widget**: Crea un nuevo componente Angular que represente el widget.

2. **Agregar el Widget a la Configuración**: En el archivo `widget.config` ubicado en la raiz del proyecto localiza el atributo `widgetsConfig` y agrega una nueva entrada con la información del widget. Asegúrate de que la ruta del componente sea correcta y que el nombre del componente coincida con el nombre del archivo:

   ```typescript
   // filepath: /src/app/core/services/user-interface-service/user-interface.service.ts
   this.widgetsConfig.push({
     nombreWidget: 'NombreDelWidget',
     ruta: '@app/widget/nombre-del-widget/nombre-del-widget.component',
     posicion: '1,1',
     titulo: 'Título del Widget',
     readme: string;                      // Ruta del README local
     importarComponente: () =>
       import('@app/widget/nombre-del-widget/nombre-del-widget.component').then(
         m => m.NombreDelWidgetComponent
       ),
   });
   ```

## Componente que Renderiza los Widgets

El componente `PanelWindowComponent` es el encargado de renderizar los widgets registrados en el `UserInterfaceService`. Este componente carga y posiciona dinámicamente los widgets basándose en la configuración proporcionada a través de la propiedad `widgetDefinition`.

## Componente activador de Widgets - PanelComponent

El componente `PanelComponent` es responsable de gestionar y mostrar los widgets abiertos en la interfaz de usuario. Utiliza NgRx Store para seleccionar el estado de los widgets y el servicio `UserInterfaceService` para gestionar la visibilidad de los widgets. Actualmente, este componente registra los widgets y expone botones para abrirlos.

## Inyección de dependencia

Es importante que se realice la inyección de dependencia para que el servicio cargue la lista de widgets y los cargue en el store de widgets disponibles. POr ello, cuando se cree un proyecto se debe crear un archivo `widget.config.ts` que contendra un objeto de tipo `IWidgetConfig` con los widgets disponibles para el proyecto. En el archivo main se debe realizar la inyección de dependencia de la siguiente manera

```typescript
import { WIDGET_CONFIG } from '@app/core/config/interfaces/IWidgetConfig';
import { DEFAULT_WIDGET_CONFIG } from 'widget.config'; //configuracion por defecto, se debe ajustar para cada proyecto
main() {
  return bootstrapApplication(AppComponent, {
    ...appConfig,
    providers: [
      ....,
      { provide: WIDGET_CONFIG, useValue: DEFAULT_WIDGET_CONFIG }, // esta configuracion es indispensable para que se carguen los widgets
    ],
  });
}
```

## README por widget: cómo declararlos 

En cada widget que tenga documentación, agrega el campo readme apuntando al archivo dentro del propio widget:

   ```typescript
  {
    nombreWidget: 'ExportarMapa2',
    /* ... */
    readme: 'app/widget/export-map2/README.md',
    importarComponente: () =>
      import('@app/widget/export-map2/components/export-map-launcher/export-map-launcher.component')
        .then(m => m.ExportMapLauncherComponent),
  }
   ```

## Buenas prácticas

1.Define siempre nombreWidget único.
2.En ruta y importarComponente, usa alias @app para mantener consistencia.
3.Coloca el README.md junto al widget (misma carpeta raíz del widget) y nómbralo siempre README.md.