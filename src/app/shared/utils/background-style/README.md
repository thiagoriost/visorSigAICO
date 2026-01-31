#  BackgroundStyleComponent
## Descripción

backgroundStyleComponent es una clase que permite a los componentes reutilizar la lógica de fondos dinámicos.
Con este componente puedes:

* Recibir un @Input() background.

* Usar colores (#hex, rgb(), rgba(), transparent).

* Usar clases de CSS.

* Si no se recibe nada → aplica la clase por defecto bg-primary-500.


## Uso del componente

### 1. Extiende la clase base en el componente que vas a usarla

```bash
export class MapNavButtonsComponent extends backgroundStyleComponent {
  // Aquí va la lógica propia del componente
}
```

### 2. Usalo en el template

```bash
<div
  [ngClass]="appliedClass"
  [ngStyle]="appliedStyle"
>
  <!-- contenido del componente -->
</div>
```

### 3. Inyecta la propiedad [background] en el componente principal

#### 3.1 Ejemplos

```bash
<app-component [background]="'#ffffff'"/>
```

```bash
<app-component [background]="'rgba(234,212,234,0.5)'"/>
```
