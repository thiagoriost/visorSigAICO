# Botonera Vertical

Componente de interfaz de usuario que proporciona una barra de herramientas vertical con botones interactivos. Está diseñado para ser utilizado como un rail lateral que permite a los usuarios acceder a diferentes funcionalidades de la aplicación mediante botones principales y menús desplegables.

## 📋 Propósito

El componente `BotoneraVerticalComponent` ofrece:

- **Navegación rápida**: Acceso directo a funcionalidades principales de la aplicación
- **Organización jerárquica**: Botones principales que pueden desplegar opciones secundarias
- **Diseño consistente**: Integración con PrimeNG para mantener la coherencia visual
- **Personalización**: Configuración flexible de forma, tamaño y estilos
- **Interactividad**: Tooltips informativos y menús desplegables tipo popover

## 🏗️ Estructura del Componente

```
botoneraVertical/
├── components/
│   ├── botonera-vertical/          # Componente principal
│   │   ├── botonera-vertical.component.ts
│   │   ├── botonera-vertical.component.html
│   │   └── botonera-vertical.component.scss
│   └── generator/                   # Componente de ejemplo/demostración
│       ├── generator.component.ts
│       ├── generator.component.html
│       └── generator.component.scss
├── interfaces/
│   └── boton-config.model.ts       # Interfaces de configuración
└── README.md                        # Este archivo
```

## 📦 Propiedades (Inputs)

### `botones`
- **Tipo**: `BotonConfigModel[]`
- **Valor por defecto**: `[]`
- **Descripción**: Lista de botones a renderizar. Cada botón incluye su ícono, texto y opciones desplegables opcionales.

**Ejemplo**:
```typescript
botones: BotonConfigModel[] = [
  {
    id: 'herramientas',
    icono: 'pi pi-pencil',
    texto: 'Herramientas',
    opciones: [
      { id: 'buffer', icono: 'pi pi-map', texto: 'Buffer' },
      { id: 'dibujar', icono: 'pi pi-pencil', texto: 'Dibujar' }
    ]
  }
];
```

### `shape`
- **Tipo**: `'rounded' | 'square'`
- **Valor por defecto**: `'rounded'`
- **Descripción**: Define la forma de los botones.
  - `'rounded'`: Botones circulares (usa `[rounded]="true"` en p-button)
  - `'square'`: Botones cuadrados (respeta el radio configurado por preset o variables CSS)

**Ejemplo**:
```html
<app-botonera-vertical [shape]="'square'" [botones]="misBotones">
</app-botonera-vertical>
```

### `size`
- **Tipo**: `'small' | 'large' | 'default'`
- **Valor por defecto**: `'default'`
- **Descripción**: Tamaño de los botones de la botonera.
  - `'small'`: Botones pequeños
  - `'large'`: Botones grandes
  - `'default'`: Tamaño por defecto

Este valor se pasa directamente al atributo `[size]` de `p-button` de PrimeNG.

**Ejemplo**:
```html
<app-botonera-vertical 
  [size]="'large'" 
  [botones]="misBotones">
</app-botonera-vertical>
```

### Propiedades Heredadas de `BackgroundStyleComponent`

El componente extiende `BackgroundStyleComponent`, lo que permite personalizar el fondo:

- **`appliedClass`**: Clase CSS personalizada para el contenedor
- **`appliedStyle`**: Estilos en línea personalizados para el fondo

## 📤 Eventos (Outputs)

### `seleccion`
- **Tipo**: `EventEmitter<{ botonId: string; opcionId: string }>`
- **Descripción**: Emite un evento cuando el usuario selecciona una opción de cualquiera de los menús o hace clic en un botón sin opciones.

**Estructura del evento**:
```typescript
{
  botonId: string;   // ID del botón principal
  opcionId: string;  // ID de la opción seleccionada (o del botón si no tiene opciones)
}
```

**Ejemplo de uso**:
```typescript
onSeleccion(event: { botonId: string; opcionId: string }) {
  console.log(`Botón: ${event.botonId}, Opción: ${event.opcionId}`);
  
  if (event.botonId === 'herramientas' && event.opcionId === 'buffer') {
    // Ejecutar funcionalidad de buffer
  }
}
```

## 🔧 Interfaces

### `BotonConfigModel`

Define la configuración de un botón principal.

```typescript
interface BotonConfigModel {
  /** Identificador único del botón */
  id: string;
  
  /** Ícono principal del botón (clase PrimeNG o URL) */
  icono: string;
  
  /** Texto del botón principal */
  texto: string;
  
  /** Lista de opciones que despliega al hacer click (opcional) */
  opciones?: OpcionMenuModel[];
}
```

### `OpcionMenuModel`

Define una opción dentro del menú desplegable.

```typescript
interface OpcionMenuModel {
  /** Identificador único de la opción */
  id: string;
  
  /** Clase o ruta del ícono (p.ej. "pi pi-search") */
  icono: string;
  
  /** Texto que se muestra junto al ícono */
  texto: string;
}
```

## 💡 Ejemplos de Uso

### Ejemplo Básico

```html
<app-botonera-vertical
  [botones]="misBotones"
  (seleccion)="onSeleccion($event)">
</app-botonera-vertical>
```

```typescript
import { Component } from '@angular/core';
import { BotoneraVerticalComponent } from './components/botonera-vertical/botonera-vertical.component';
import { BotonConfigModel } from './interfaces/boton-config.model';

@Component({
  selector: 'app-ejemplo',
  standalone: true,
  imports: [BotoneraVerticalComponent],
  template: `
    <app-botonera-vertical
      [botones]="botones"
      (seleccion)="onSeleccion($event)">
    </app-botonera-vertical>
  `
})
export class EjemploComponent {
  botones: BotonConfigModel[] = [
    {
      id: 'herramientas',
      icono: 'pi pi-pencil',
      texto: 'Herramientas',
      opciones: [
        { id: 'buffer', icono: 'pi pi-map', texto: 'Buffer' },
        { id: 'dibujar', icono: 'pi pi-pencil', texto: 'Dibujar' }
      ]
    },
    {
      id: 'ayuda',
      icono: 'pi pi-question-circle',
      texto: 'Ayuda'
      // Sin opciones - botón simple
    }
  ];

  onSeleccion(event: { botonId: string; opcionId: string }) {
    console.log('Selección:', event);
  }
}
```

### Ejemplo con Personalización Completa

```html
<app-botonera-vertical
  [botones]="botones"
  [shape]="'square'"
  [size]="'large'"
  (seleccion)="handleSeleccion($event)">
</app-botonera-vertical>
```

```typescript
export class EjemploAvanzadoComponent {
  botones: BotonConfigModel[] = [
    {
      id: 'consulta',
      icono: 'pi pi-search',
      texto: 'Consulta',
      opciones: [
        { id: 'simple', icono: 'pi pi-search', texto: 'Consulta simple' },
        { id: 'avanzada', icono: 'pi pi-filter', texto: 'Consulta avanzada' },
        { id: 'identificar', icono: 'pi pi-info-circle', texto: 'Identificar' }
      ]
    }
  ];

  handleSeleccion(event: { botonId: string; opcionId: string }) {
    switch (event.botonId) {
      case 'consulta':
        this.ejecutarConsulta(event.opcionId);
        break;
      // ... otros casos
    }
  }

  private ejecutarConsulta(tipo: string) {
    // Lógica de consulta
  }
}
```

### Ejemplo con Botones Dinámicos

```typescript
export class EjemploDinamicoComponent {
  botones: BotonConfigModel[] = [];
  
  ngOnInit() {
    // Cargar botones dinámicamente según permisos del usuario
    this.botones = this.cargarBotonesSegunPermisos();
  }

  private cargarBotonesSegunPermisos(): BotonConfigModel[] {
    const botones: BotonConfigModel[] = [];
    
    if (this.usuarioTienePermiso('edicion')) {
      botones.push({
        id: 'edicion',
        icono: 'pi pi-pencil',
        texto: 'Editar',
        opciones: [
          { id: 'crear', icono: 'pi pi-plus', texto: 'Crear' },
          { id: 'modificar', icono: 'pi pi-pencil', texto: 'Modificar' },
          { id: 'eliminar', icono: 'pi pi-trash', texto: 'Eliminar' }
        ]
      });
    }
    
    return botones;
  }
}
```

## 🧪 Componente de Ejemplo (Generator)

El proyecto incluye un componente `GeneratorComponent` que permite:
- Pegar configuración JSON de botones
- Seleccionar el tamaño de los botones
- Generar y visualizar la botonera en tiempo real

Útil para:
- Probar diferentes configuraciones
- Aprender a usar el componente
- Prototipar rápidamente nuevas interfaces

## 📚 Dependencias

- **Angular 18+**: Framework base
- **PrimeNG**: Componentes de UI
  - `p-button`: Botones principales
  - `p-popover`: Menús desplegables
  - `p-tooltip`: Tooltips informativos
  - `pRipple`: Efecto ripple
- **PrimeFlex**: Utilidades CSS para layout

## 🔍 Notas Técnicas

### Gestión de Formularios
- El componente es **standalone** y no requiere módulos adicionales
- Usa **component composition** para reutilización

### Accesibilidad
- Los botones tienen tooltips con descripciones
- Los íconos son de PrimeNG Icons para consistencia
- El componente soporta navegación por teclado (heredado de PrimeNG)


## 📝 Mejores Prácticas

1. **IDs únicos**: Asegúrate de que cada `id` de botón y opción sea único
2. **Íconos consistentes**: Usa íconos de la librería PrimeNG Icons (`pi pi-*`) o la que tenga configurada en el proyecto
3. **Textos descriptivos**: Proporciona textos claros y concisos
4. **Manejo de eventos**: Implementa la lógica en el componente padre
5. **Responsividad**: Considera el tamaño de pantalla al elegir `size`


