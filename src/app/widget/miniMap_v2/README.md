# 📘 MiniMapLauncherComponent & MiniMapV2Component

## 🧭 Descripción

Los componentes `MiniMapLauncherComponent` y `MiniMapV2Component` permiten visualizar un **mini-mapa interactivo** sincronizado con el mapa principal.  
El usuario puede seleccionar dinámicamente el mapa base, cambiar la posición del mini-mapa en pantalla y minimizarlo o restaurarlo mediante un botón flotante o encabezado interactivo.

El servicio `MiniMapService` gestiona la instancia de `OpenLayers` para el mini-mapa y sincroniza la vista con el mapa principal.  
El servicio `MapaBaseService` centraliza las configuraciones de los mapas base disponibles.

---

## 🎯 Propósito

El propósito de estos componentes es ofrecer al usuario una vista general de la extensión del mapa principal, representada por un rectángulo dentro del mini-mapa, y permitir cambiar el **mapa base** en tiempo real.  
Esto mejora la navegación y la orientación espacial dentro de la aplicación.

---

## 🚀 Uso de los Componentes

### MiniMapLauncherComponent

El `MiniMapLauncherComponent` actúa como **lanzador** del mini-mapa:
- Proporciona un formulario configurable con opciones para mapas base, posición, tamaño, ícono, color, etc.
- Genera dinámicamente el componente `MiniMapV2Component` con los valores seleccionados.

```html
<app-mini-map-launcher></app-mini-map-launcher>
```

---

### MiniMapV2Component

El `MiniMapV2Component` es responsable de:
- Renderizar el mini-mapa (mediante `<app-mini-map-ppal>`).
- Mostrar y ocultar el mini-mapa dinámicamente (`isMiniMapVisible`).
- Actualizar la capa base según el mapa seleccionado.
- Permitir la minimización/restauración del mini-mapa.
- Ajustar su posición en la interfaz (`top-left`, `top-right`, `bottom-left`, `bottom-right`).
- Aplicar severidad de color al botón flotante.

Ejemplo de uso:

```html
<app-mini-map-v2
  [baseMap]="selectedBaseMap"
  [mapPosition]="'bottom-left'"
  [variant]="'button'"
  [buttonPosition]="'bottom-right'"
  [buttonSize]="'large'"
  [severity]="'success'">
</app-mini-map-v2>
```

---

## ⚙️ Inputs Disponibles

### 🗺️ `baseMap`
- **Tipo:** `MapasBase`
- **Default:** `GOOGLE_SATELLITE`
- Define el mapa base a utilizar en el mini-mapa.  
  Se sincroniza automáticamente con `MiniMapService`.

---

### 📍 `mapPosition`
- **Tipo:** `'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`
- **Default:** `'top-left'`
- Determina la esquina donde se ubica el mini-mapa en la interfaz.

---

### 🎛️ `variant`
- **Tipo:** `'header' | 'button'`
- **Default:** `'header'`
- Define el modo de visualización:
  - `header` → mini-mapa dentro de un encabezado fijo con botón de minimizar.
  - `button` → mini-mapa mostrado u ocultado mediante botón flotante.

---

### 🏷️ `headerTitle` *(Nuevo)*
- **Tipo:** `string`
- **Default:** `''`
- Título que se muestra en el encabezado del mini-mapa cuando `variant = 'header'`.

---

### 🎯 `buttonPosition`
- **Tipo:** `'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`
- **Default:** `'top-right'`
- Define la posición del **botón flotante** cuando `variant = 'button'`.

---

### 📐 `width`
- **Tipo:** `string`
- **Default:** `'12rem'`
- Define el ancho del mini-mapa.

---

### 📏 `height`
- **Tipo:** `string`
- **Default:** `'12rem'`
- Define la altura del mini-mapa.

---

### 🎨 `headerClass`
- **Tipo:** `string`
- **Default:** `''`
- Clases CSS personalizadas aplicadas al encabezado del mini-mapa.

---

### 🧱 `bodyClass`
- **Tipo:** `string`
- **Default:** `''`
- Clases CSS personalizadas aplicadas al cuerpo del mini-mapa.

---

### ⚙️ `buttonSize`
- **Tipo:** `'small' | 'normal' | 'large'`
- **Default:** `'normal'`
- Tamaño del **botón flotante externo** que muestra u oculta el mini-mapa.  
  Compatible con tamaños oficiales de [PrimeNG Button](https://v19.primeng.org/button).

---

### 🖼️ `buttonIcon`
- **Tipo:** `string`
- **Default:** `'pi pi-eye'`
- Define el ícono del botón flotante (usa íconos de [PrimeIcons](https://primeng.org/icons)).

---

### ✨ `severity`
- **Tipo:** `'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast' | undefined`
- **Default:** `undefined`
- Define el estilo de severidad del botón flotante, usando los colores temáticos de PrimeNG.

---

### ✨ `headerButtonSeverity`
- **Tipo:** `'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast' | undefined`
- **Default:** `'secondary'`
- Define el estilo de severidad del botón para minimizar en el encabezado.

---

### 🖼️ `closeButtonIcon`
- **Tipo:** `string`
- **Default:** `'pi pi-minus'`
- Define el ícono del botón para minimizar/cerrar.

---

### ✨ `closeButtonSeverity`
- **Tipo:** `'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast' | undefined`
- **Default:** `'secondary'`
- Define el estilo de severidad del botón para minimizar/cerrar.

---

### ⚪ `buttonRounded`
- **Tipo:** `boolean`
- **Default:** `true`
- Determina si el botón debe ser redondeado (`true`) o cuadrado (`false`).

---

### 🧭 `isPanEnabled`
- **Tipo:** `boolean`
- **Default:** `false`
- Habilita o desactiva el **paneo** dentro del mini-mapa.
- Se sincroniza dinámicamente con `MiniMapService`.

---

## 🧩 Ejemplos de Configuración

```html
<!-- Mini-mapa fijo con encabezado -->
<app-mini-map-v2
  [baseMap]="selectedBaseMap"
  [mapPosition]="'top-left'"
  [variant]="'header'">
</app-mini-map-v2>

<!-- Mini-mapa con botón flotante en esquina inferior derecha -->
<app-mini-map-v2
  [baseMap]="selectedBaseMap"
  [variant]="'button'"
  [mapPosition]="'bottom-right'"
  [buttonPosition]="'bottom-right'">
</app-mini-map-v2>

<!-- Mini-mapa con header y estilos personalizados -->
<app-mini-map-v2
  [baseMap]="selectedBaseMap"
  [variant]="'header'"
  [width]="'14rem'"
  [height]="'14rem'"
  [headerClass]="'bg-blue-500 text-white'"
  [bodyClass]="'border-2 border-blue-500 bg-blue-50 shadow-3'">
</app-mini-map-v2>

<!-- Mini-mapa con botón grande y severidad 'success' -->
<app-mini-map-v2
  [variant]="'button'"
  [buttonSize]="'large'"
  [severity]="'success'">
</app-mini-map-v2>

<!-- Mini-mapa con botón cuadrado y severidad 'warn' -->
<app-mini-map-v2
  [variant]="'button'"
  [buttonRounded]="false"
  [severity]="'warn'"
  [buttonIcon]="'pi pi-map'">
</app-mini-map-v2>

<!-- Mini-mapa con título e ícono personalizado en el header -->
<app-mini-map-v2
  [variant]="'header'"
  [headerTitle]="'Mapa de Ubicación'"
  icon="pi pi-minus"
  [width]="'14rem'"
  [height]="'14rem'">
</app-mini-map-v2>
```

---

## 🧠 Servicios Asociados

### MiniMapService
- Crea y gestiona la instancia del mini-mapa (`OpenLayers`).
- Actualiza la capa base según el mapa seleccionado.
- Dibuja el rectángulo de la extensión visible del mapa principal.
- Sincroniza la vista entre el mini-mapa y el mapa principal.

---

### MapaBaseService
- Define y centraliza las opciones de mapas base (Google, Esri, OSM, etc.).
- Expone métodos para obtener configuraciones de mapas (`TileLayer`).
- Provee opciones listas para usar en dropdowns (`label`, `value`).

---

## 📝 Notas

- El **mapa base por defecto** es `Google Satélite`.  
- El mini-mapa y su botón flotante pueden ubicarse en cualquiera de las **cuatro esquinas**.  
- El botón admite ícono, color, forma y tamaño configurables.  
- El tamaño del botón usa los valores oficiales de PrimeNG (`small`, `normal`, `large`).  
- Cada mini-mapa genera un `miniMapId` único internamente (`mini-map-0`, `mini-map-1`, etc.).  
- Incluye tooltips `"Mostrar Mapa Localización"` y `"Ocultar Mapa Localización"` para mejor usabilidad.

---

📅 **Última actualización:** Octubre 2025  
👨‍💻 **Autor:** Carlos Alberto Aristizábal Vargas  
🏷️ **Versión:** 3.0 — integración completa con `MiniMapService`, `MapaBaseService` y soporte para modos *header* y *button*.
