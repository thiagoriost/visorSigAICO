# Copilot Instructions - Visor Geográfico Estandar

## Architecture Overview

This is a **multi-project Angular 20+ monorepo** for geographic visualization (GIS) applications using OpenLayers, PrimeNG, and NgRx. Each client/project (opiac, aiso, cric, gobiernomayor, linea-negra, aico) shares core code but has isolated configurations.

### Key Structural Concepts

- **Standalone components only** - No NgModules; all components use `standalone: true`
- **Widget-based architecture** - Self-contained functional units in `src/app/widget/` with their own components, services, store, and interfaces
- **Multi-project builds** - Each project in `src/projects/<name>/` has its own `main.ts`, `environments/`, routes, and app config
- **NgRx state management** - Core slices: `map`, `userInterface`, `auth`, `swipe`

### Directory Responsibilities

| Path | Purpose |
|------|---------|
| `src/app/core/` | Shared services, store slices, interfaces - available to all widgets |
| `src/app/widget/` | Reusable map widgets (identify, measurement, export-map, content-table, etc.) |
| `src/app/widget-ui/` | UI-only components (botonera, auth, panels) |
| `src/app/shared/` | Cross-cutting utilities, PDF generation, common services |
| `src/projects/<client>/` | Client-specific overrides: environments, routes, custom widgets, styles, assets |

## Development Commands

```bash
# Serve specific project (replace <project> with: opiac, aiso, cric, etc.)
ng serve <project>

# Build for production
ng build <project> --configuration production

# Lint and fix
ng lint --fix

# Run tests
ng test
```

## Critical Patterns

### Environment Imports - ALWAYS use generic path
```typescript
// ✅ CORRECT - Angular CLI handles file replacement per project
import { environment } from 'environments/environment';

// ❌ WRONG - Bypasses build-time replacement
import { environment } from 'environments/environment.development';
```

### Widget Registration
Widgets must be registered in `src/widget.config.ts` (or project-specific `<project>.config.ts`) with lazy loading:
```typescript
{
  nombreWidget: 'MyWidget',
  titulo: 'Mi Widget',
  categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
  subcategoria: WidgetSubcategoria.MEDICION,
  importarComponente: () => import('@app/widget/my-widget/my-widget.component')
    .then(m => m.MyWidgetComponent),
}
```

### NgRx Actions Pattern
Use `createActionGroup` with descriptive event names:
```typescript
export const MapActions = createActionGroup({
  source: 'Map',
  events: {
    'Add Layer To Map': props<{ layer: LayerStore }>(),
    'Update Layer Order': props<{ layers: LayerStore[] }>(),
  },
});
```

### Map Layer Structure
OpenLayers map uses three layer groups (see `MapService`):
- `LayerLevel.BASE` - Base maps (OSM, satellite)
- `LayerLevel.INTERMEDIATE` - Working layers from content table
- `LayerLevel.UPPER` - Drawing, selection, and highlight layers

### Path Aliases
Use configured aliases instead of relative paths:
- `@app/*` → `src/app/*`
- `@projects/*` → `src/projects/*`

## Widget Development

Each widget should follow this structure:
```
src/app/widget/<widget-name>/
├── components/        # Angular components
├── services/          # Widget-specific services
├── interfaces/        # TypeScript interfaces
├── store/             # Widget-specific NgRx slice (optional)
└── README.md          # Usage documentation with examples
```

### Widget Visibility
Use `UserInterfaceService` to control widget display:
```typescript
this.userInterfaceService.cambiarVisibleWidget('nombreWidget', true);
```

## Styling

- **SCSS** for all component styles
- **PrimeFlex** for layout utilities (flexbox, grids, spacing)
- **PrimeNG** for UI components - use preset themes from `@primeng/themes`
- Component selector prefix: `app-` (e.g., `app-base-map`)

## Documentation

- Use **JSDoc** for all public methods and classes
- Each widget must have a `README.md` documenting inputs, outputs, and usage examples
- Spanish is acceptable for user-facing text and comments
