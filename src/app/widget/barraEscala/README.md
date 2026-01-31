# BarraEscalaComponent
## Descripción


El componente BarraEscalaComponent muestra una barra de escala que combina dos funcionalidades principales:

* Un selector desplegable de escalas (DropdownEscalaComponent) para elegir una escala predefinida.

* Una representación visual de la escala (EscalaComponent), que puede mostrarse como línea (scaleline) o barra (scalebar).

Este componente se integra con un mapa basado en OpenLayers, actualizando dinámicamente la escala según los cambios de resolución o zoom.



## Uso

1. Importa el componente:

```bash
import { BarraEscalaComponent } from '@app/widget/barraEscala/barra-escala.component';
```

2. Ejempo de uso de plantilla:


```bash
<app-barra-escala
  [scaleType]="'scaleline'"
  [showDropdown]="true"
  [showEscalas]="true">
</app-barra-escala>
```

## Parametros de entrada

| Propiedad     | Tipo                          | Descripción                                                                 | Valor por defecto |
|----------------|-------------------------------|------------------------------------------------------------------------------|-------------------|
| `scaleType`    | `'scaleline'` \| `'scalebar'` | Define el tipo de escala que se muestra (línea o barra).                     | `'scaleline'`     |
| `showDropdown` | `boolean`                     | Controla si se muestra el selector de escalas (`DropdownEscalaComponent`).   | `true`            |
| `showEscalas`  | `boolean`                     | Controla si se muestra la representación de la escala (`EscalaComponent`).   | `true`            |

