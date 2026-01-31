# 🗺️ MiniMapComponent

## 🧩 Descripción

El `MiniMapComponent` permite mostrar u ocultar un **mini-mapa de localización** dentro de la aplicación.  
Su función principal es actuar como un **botón lanzador** del componente `MiniMapPpalComponent`, el cual contiene la lógica de **OpenLayers**, **sincronización con el mapa principal** y gestión del **servicio `MiniMapService`**.

> ⚠️ Este componente **no contiene lógica de mapas**, únicamente controla la visibilidad, apariencia y configuración del mini-mapa.

---

## 🎯 Propósito

Proveer un **control ligero, reutilizable y altamente configurable** para alternar la visibilidad de un mini-mapa.  
Ideal para paneles, dashboards o vistas donde se requiera una **vista geográfica secundaria** sin sobrecargar el componente principal.

---

## 🧠 Estructura General

El componente consta de:
- Un **botón de control** (`p-button`) para mostrar/ocultar el mini-mapa.
- Un **contenedor flotante** donde se renderiza el `MiniMapPpalComponent`.
- Integración con el servicio `MiniMapService` para actualizar capa base y paneo.

---

## 💡 Uso Básico

```html
<app-mini-map></app-mini-map>
```

Al hacer clic en el botón, el mini-mapa (`<app-mini-map-ppal>`) se muestra u oculta dinámicamente.

---

## ⚙️ Inputs Disponibles

### 🎨 `buttonIcon`
- **Tipo:** `string`
- **Default:** `'pi pi-eye'`
- Ícono del botón principal.
- Ejemplos: `'pi pi-map'`, `'pi pi-eye-slash'`, `'pi pi-map-marker'`.

---

### 🖌️ `background`
- **Tipo:** `string`
- **Default:** `'bg-primary-500'`
- Define el color de fondo del botón, aceptando clases CSS o valores HEX/RGB/transparent.

---

### ⚪ `buttonRounded`
- **Tipo:** `boolean`
- **Default:** `true`
- Controla si el botón es redondeado (`true`) o cuadrado (`false`).

---

### 🔘 `buttonSize`
- **Tipo:** `'small' | 'large' | undefined`
- **Default:** `undefined`
- Tamaño del botón, compatible con los tamaños de [PrimeNG Button](https://primeng.org/button).

---

### 🗺️ `baseMap`
- **Tipo:** `MapasBase`
- **Default:** `MapasBase.GOOGLE_SATELLITE`
- Define el mapa base a usar dentro del mini-mapa.
- Se comunica con el servicio `MiniMapService` para actualizar la capa activa.

---

### 🖼️ `mapContainerClass`
- **Tipo:** `string`
- **Default:** `undefined`
- Clase CSS adicional aplicada al contenedor del mini-mapa.

---

### 📍 `mapPosition`
- **Tipo:** `'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom'`
- **Default:** `'top-left'`
- Determina la posición del mini-mapa respecto al botón (ahora con **8 posiciones posibles**).

---

### 📏 `width`
- **Tipo:** `string`
- **Default:** `'12rem'`
- Define el ancho del mini-mapa.

---

### 📐 `height`
- **Tipo:** `string`
- **Default:** `'12rem'`
- Define la altura del mini-mapa.

---

### 🧭 `isPanEnabled`
- **Tipo:** `boolean`
- **Default:** `false`
- Permite o restringe el **paneo (navegación manual)** dentro del mini-mapa.
- Se comunica dinámicamente con `MiniMapService` para actualizar el estado.

---

## 🪄 Comportamiento

- El botón alterna la visibilidad del mini-mapa (`isMiniMapVisible`).
- El ícono puede cambiar dinámicamente (`pi pi-eye` ↔ `pi pi-eye-slash`).
- El color y estilo visual se definen mediante `background` y herencia de `BackgroundStyleComponent`.
- El mini-mapa se posiciona según `mapPosition`.
- Soporta paneo controlado (`isPanEnabled`).

---

## 🧱 Ejemplos de Configuración

### 🔹 Mini-mapa básico
```html
<app-mini-map></app-mini-map>
```

### 🔹 Mini-mapa personalizado
```html
<app-mini-map
  [buttonIcon]="'pi pi-map'"
  [background]="'bg-success-400'"
  [buttonRounded]="false"
  [mapPosition]="'bottom-right'"
  [width]="'16rem'"
  [height]="'10rem'"
  [isPanEnabled]="true">
</app-mini-map>
```

---

## 🧰 MiniMapLauncherComponent

### 📘 Descripción

El componente `MiniMapLauncherComponent` sirve como **interfaz de configuración** del `MiniMapComponent`.  
Permite modificar en tiempo real los valores de:
- Mapa base (`baseMap`)
- Icono, forma y tamaño del botón
- Posición y estilo del mini-mapa
- Dimensiones (`width`, `height`)
- Habilitación del paneo (`isPanEnabled`)

### 💻 Uso

```html
<app-mini-map-launcher></app-mini-map-launcher>
```

### 🧩 Dependencias
- `MiniMapComponent`
- `PrimeNG` (`CardModule`, `DropdownModule`, `CheckboxModule`, `InputTextModule`)
- `MapaBaseService` y `MapasBase` (para opciones de mapas base)

---

## 🧠 Notas Técnicas

- `MiniMapComponent` extiende de `BackgroundStyleComponent` para heredar estilos dinámicos.
- Se apoya en `MiniMapService` para manejar capa base y paneo.
- No manipula directamente la lógica de OpenLayers.
- El `MiniMapPpalComponent` contiene la gestión completa del mapa (capas, coordenadas, eventos).

---

## 📦 Dependencias

- [PrimeNG Button](https://primeng.org/button)  
- [PrimeNG Tooltip](https://primeng.org/tooltip)  
- [TailwindCSS](https://tailwindcss.com/) *(opcional)*  
- `MiniMapPpalComponent` y `MiniMapService` *(lógica del mapa)*  

---

## 📅 Información del Componente

- **Última actualización:** Octubre 2025  
- **Autor:** Carlos Alberto Aristizábal Vargas  
- **Versión:** 3.0 — incluye nuevas propiedades (`baseMap`, `isPanEnabled`, `width`, `height`) y soporte para **8 posiciones**.
