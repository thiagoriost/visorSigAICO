<p> 
    <h1 align="center"> 
        Mapa Base
    </h1>
</p>

Widget que muestra una grilla de mapas base disponibles y permite cambiar el mapa base activo en el visor.
Se actualiza automáticamente cuando cambia la lista de mapas recibida desde el componente padre.

## Modo de uso
### Mostrar todos los mapas disponibles

```bash
<app-base-map></app-base-map>
```

### Mostrar una lista específica de mapas

```bash
<app-base-map 
[nombresMapas]="[MapasBase.OSM_STANDARD, MapasBase.GOOGLE_SATELLITE]">
</app-base-map>

```

### Integrado con un selector dinámico (dropdown)

Template
```bash
<app-base-map [nombresMapas]="mapasSeleccionados"></app-base-map>
```
Ts

```bash
mapasSeleccionados = [
  { label: 'Google Satélite', value: 'google_satellite' },
  { label: 'OSM Estándar', value: 'osm_standard' }
];
```

## Inputs

| Input           | Tipo           | Opcional | Descripción                                                                 |
|-----------------|----------------|----------|-----------------------------------------------------------------------------|
| `nombresMapas`  | `MapasBase[]`  | Sí       | Lista de mapas base (enums `MapasBase`) que se mostrarán en la grilla. Si no se proporciona, se cargan todos los mapas disponibles. |
| `icon`  | `string`  | Sí       | Icono que se muuestra en el mapa seleccionado |
