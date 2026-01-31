# 🧭 MiniMapService

## 📘 Descripción

El servicio `MiniMapService` gestiona toda la lógica relacionada con la creación, actualización, sincronización y eliminación de un **mini-mapa interactivo** basado en **OpenLayers**.  
Su principal función es mantener sincronizada una vista reducida (mini-mapa) con el mapa principal de la aplicación, permitiendo visualizar la extensión actual y navegar de manera más intuitiva.

Este servicio se integra con:
- `MapService`: para acceder al mapa principal.
- `MapaBaseService`: para obtener y cambiar dinámicamente la capa base del mini-mapa.

---

## 🎯 Propósito

El propósito de `MiniMapService` es proveer una API reutilizable para crear mini-mapas que:
- Muestren la extensión actual del mapa principal.
- Permitan actualizar la capa base en tiempo real.
- Ofrezcan control sobre la interacción de **paneo (DragPan)**.
- Sincronicen los movimientos entre el mapa principal y el mini-mapa.

Ideal para dashboards o módulos que requieren representación geográfica auxiliar.

---

## ⚙️ Métodos Principales

### 🗺️ `createMiniMap(map: Map, targetElement: HTMLElement): void`
Crea una nueva instancia del mini-mapa y la renderiza en el contenedor HTML indicado.

**Parámetros:**
- `map`: instancia principal de `ol/Map`.
- `targetElement`: elemento HTML donde se renderizará el mini-mapa.

**Comportamiento:**
- Crea la capa base mediante `MapaBaseService`.
- Sincroniza automáticamente el rectángulo de extensión visible del mapa principal.
- Escucha el evento `moveend` del mapa principal para mantener actualizada la vista.

---

### 🔁 `updateMiniMapLayer(baseMap: MapasBase): void`
Actualiza la capa base del mini-mapa en tiempo real.

**Uso típico:**
```ts
miniMapService.updateMiniMapLayer(MapasBase.ESRI_SATELLITE);
```

**Efectos:**
- Cambia la capa base actual.
- Redibuja el rectángulo de extensión según la nueva vista.

---

### 🧭 `setPanEnabled(enabled: boolean): void`
Activa o desactiva la capacidad de **paneo** dentro del mini-mapa.

**Detalles:**
- Si `true`, el usuario puede mover el mini-mapa para cambiar el centro del mapa principal.
- Si `false`, el mini-mapa solo refleja los cambios del mapa principal.

**Internamente:**
- Agrega o elimina la interacción `DragPan`.
- Suscribe o desuscribe el evento `moveend` del mini-mapa.

---

### 🧱 `removeMiniMap(): void`
Destruye la instancia del mini-mapa, liberando memoria y removiendo referencias.

**Uso:**
```ts
miniMapService.removeMiniMap();
```

---

### 🎯 `createMiniMapLayer(baseMap: MapasBase): void` *(privado)*
Crea la capa base inicial del mini-mapa a partir de un tipo de mapa definido en `MapasBase`.

---

### 🗺️ `createMiniMapInstance(map: Map, targetElement: HTMLElement): void` *(privado)*
Crea y configura la instancia de `ol/Map` del mini-mapa.  
Incluye inicialización de:
- Capa base (`TileLayer`)
- Vista (`View`)
- Interacciones (`DragPan`, si aplica)
- Rectángulo de extensión visible

---

### 🔄 `callBackMoveendEvent(event: MapEvent): void` *(privado)*
Se ejecuta cada vez que el mapa principal se mueve (`moveend`).  
Actualiza el rectángulo de extensión y centra el mini-mapa.

---

### 🔳 `createRectangleFeature(extent: number[]): Feature` *(privado)*
Genera un rectángulo que representa la extensión visible del mapa principal.

**Estilo:**
- Borde: color primario de PrimeNG.
- Relleno: tono semitransparente derivado del color principal.

---

### 🧩 `updateMiniMapLayerWithFeature(rectangleFeature: Feature): void` *(privado)*
Actualiza o reemplaza la capa vectorial del mini-mapa con el nuevo rectángulo de extensión.

---

### 🎯 `centrarMiniMapa(event: MapEvent): void` *(privado)*
Centra el mini-mapa en la vista del mapa principal.  
Si el zoom del mapa principal cambia, ajusta la escala del mini-mapa de forma animada.

---

### 🖱️ `enableMiniMapPanInteraction()` / `disableMiniMapPanInteraction()` *(privados)*
Activa o desactiva manualmente la interacción de **arrastre (DragPan)** en el mini-mapa.

---

## 🧠 Comportamiento General

- El mini-mapa refleja constantemente el área visible del mapa principal.
- Cuando el paneo está habilitado (`isPanEnabled = true`), mover el mini-mapa actualiza el centro del mapa principal.
- Los rectángulos se redibujan en cada evento `moveend` del mapa principal.
- Soporta cambio dinámico de capa base mediante `MapaBaseService`.
- El color de los elementos (borde y relleno) se obtiene automáticamente del tema de PrimeNG (`--primary-color`).

---

## 🧩 Integraciones Requeridas

- **`MapService`** → para acceder a la instancia principal del mapa.
- **`MapaBaseService`** → para obtener y cambiar las capas base (`TileLayer`).
- **OpenLayers** (`ol`) → clases como `Map`, `View`, `TileLayer`, `VectorLayer`, `VectorSource`, `Polygon`, `Style`, `Stroke`, `Fill`, `Feature`, `DragPan`.

---

## 🧱 Dependencias Técnicas

- **Angular Injectable:** `@Injectable({ providedIn: 'root' })`
- **Librerías OL utilizadas:**
  - `ol/Map`, `ol/View`
  - `ol/layer/Tile`, `ol/layer/Vector`
  - `ol/source/Vector`
  - `ol/geom/Polygon`
  - `ol/style/Style`, `ol/style/Fill`, `ol/style/Stroke`
  - `ol/interaction/DragPan`
  - `ol/MapEvent`, `ol/Feature`

---

## 🧩 Ejemplo de Uso

```ts
import { MiniMapService } from '@app/shared/services/mini-map/mini-map.service';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';

constructor(private miniMapService: MiniMapService) {}

ngAfterViewInit(): void {
  const mainMap = this.mapService.getMap();
  const miniMapContainer = document.getElementById('mini-map-container');
  if (mainMap && miniMapContainer) {
    this.miniMapService.createMiniMap(mainMap, miniMapContainer);
  }
}

// Cambiar mapa base
this.miniMapService.updateMiniMapLayer(MapasBase.OSM);

// Habilitar paneo
this.miniMapService.setPanEnabled(true);
```

---

## 🧹 Limpieza

Para evitar fugas de memoria o referencias colgantes, debe llamarse a `removeMiniMap()` al destruir el componente padre o cerrar la vista.

```ts
ngOnDestroy(): void {
  this.miniMapService.removeMiniMap();
}
```

---

📅 **Última actualización:** Octubre 2025  
👨‍💻 **Autor:** Carlos Alberto Aristizábal Vargas  
🏷️ **Versión:** 2.0 — soporte completo para paneo, sincronización dinámica y cambio de mapa base.
