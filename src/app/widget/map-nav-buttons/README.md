# Componente de Navegación del Mapa (`MapNavButtons`)

## 1. Descripción General

El componente MapNavButtons es un widget interactivo para sistemas de mapas que proporciona controles de navegación esenciales mediante una interfaz de usuario intuitiva.

## 2. Características Principales

Controles Disponibles

* Zoom In/Out, Zoom por clic (+/-), Zoom por rectángulo (dibujo de área)

* Controles de Vista: Botón de reinicio a vista inicial, Toggle para zoom con rueda del mouse

* Herramientas de Navegación: Activación/desactivación de paneo (arrastre del mapa), Límites configurables de zoom

* Personalización Visual: Configuración opcional del color de fondo del contenedor.
  
* Historial de navegación: es un servicio encargado de gestionar el historial de navegación del mapa dentro del visor geográfico. Su función principal es capturar automáticamente los cambios de vista del mapa —como el centro, nivel de zoom y rotación— y almacenarlos en un historial estructurado que permite al usuario navegar hacia atrás y hacia adelante entre estados anteriores del mapa.


## 3. Estructura Técnica

3.1 Componentes claves

* map-nav-buttons.component.ts=>Lógica principal del componente

* map-nav-buttons.service.ts=>Servicio con operaciones del mapa

* map-nav-buttons.interface.ts=>Tipos y configuraciones

* map.selectors.ts=>Selectores NGRX
  
* map-history.service.ts => Servicio de historial de nevegación
  


## 4. Configuración por Defecto (Selector NGRX)
En la propiedad `MapNavButtons` declarada en la constante `initialState` ubicado en `map.reducer.ts` establece valores iniciales así:

```typescript
{
  showZoomIn: true,                // Muestra botón Zoom+
  showZoomOut: true,               // Muestra botón Zoom-
  showAdvancedZoomIn: true,        // Muestra el botón acercar vista del mapa (SIG_OPIAC_001) Flujo alterno 3
  showAdvancedZoomOut: true,       // Muestra el botón alejar vista del mapa (SIG_OPIAC_002) Flujo alterno 3
  showPan: true,                   // Muestra botón Pan
  showResetView: true,             // Muestra botón Reset
  showToggleMouseWheelZoom: true,  // Muestra botón Activar/inactivar zoom con scroll del mouse
  showHistory:true,                // Muestra los botones atras y adelante del historial de navegación
  isPanEnabled: false,             // Estado del paneo al iniciar el componente
  isMouseWheelZoomEnabled: true,   // Estado inicial del Zoom con rueda 
  initialCenter: environment.map.center, // Centro del mapa al iniciar el componente
  initialZoom: environment.map.zoom,     // Nivel de zoom al iniciar el componente
  minZoom: environment.map.minZoom,      // Zoom mínimo 
  maxZoom: environment.map.maxZoom,      // Zoom máximo  
  rounded : true,                   // Redondeado de los botones
  variant: 'outlined' | 'text' ,    // valor a aplicar en la propiedad variant de los botones
  size: 'small' | 'large' | undefined,  // Tamaño  de los botones
}
```

## 5. Instalación e Integración

5.1 Requisitos
+ Angular 18+
+ PrimeNG
+ NgRx Store
+ OpenLayers

5.2 Manejo del Color de Fondo

El contenedor padre (MapNavButtonsComponent) permite definir un color de fondo personalizado mediante la propiedad de entrada background.

5.3 Pasos de Implementación

Importar el componente en el modulo donde se requiera usar y especificarlo en la sección imports de la declaración del componente:

```typescript
import { MapNavButtonsComponent } from '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component';


@Component({
 ...
  imports: [MapNavButtonsComponent],
  providers:...,
 ...
})
```

Añadir componente en template y definir color de fondo si es necesaria su personalización::

```html
<app-map-nav-buttons background="transparent">
</app-map-nav-buttons>
```
