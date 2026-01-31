# Salida Gráfica v4

## Descripción

`Salida Gráfica v4` es un widget que exporta el mapa a PDF usando plantillas predefinidas. Ofrece un formulario simple (título, autor, grilla, leyenda, orientación) y un selector de plantilla visual (A/B). Gestiona una bandeja de trabajos con progreso y descargas, renderizando el mapa en un contenedor off-screen para no alterar la vista del usuario.

## Propósito
Proveer una experiencia de impresión profesional y consistente para mapas, con:
1. Parámetros de exportación claros para el usuario final.
2. Plantillas reutilizables y extensibles (branding por cliente).
3. Progreso visible, manejo de errores y limpieza de descargas para una UX fluida.


## Flujo de Uso
1.	En la pestaña Parámetros, completar Título, Autor, seleccionar Orientación y marcar Grilla / Leyenda si aplica.
2.	(Opcional) Abrir “Salida personalizada” y elegir Plantilla A o B (con vista previa).
3.	Pulsar Imprimir. El widget:
    o	normaliza datos del formulario,
    o	resuelve la plantilla seleccionada,
    o	renderiza el mapa off-screen y construye el PDF,
    o	publica el resultado en Resultados para descarga.


En `Resultados` se listan trabajos con progreso y estado (Creando / Listo / Error), además de la acción Borrar descargas (revoca URLs blob y limpia timers).

## Parámetros de Usuario

•	Título (title) — Encabezado del PDF. Máx. recomendado 100 caracteres.
•	Autor (author) — Etiqueta de autor. Máx. recomendado 50 caracteres.
•	Mostrar grilla (showGrid) — Superpone grilla sobre el mapa antes de exportar.
•	Incluir leyenda (includeLegend) — Inserta la leyenda de capas según el mapa.
•	Orientación (orientation) — Vertical u Horizontal.

## Plantillas Disponibles

•	Plantilla A – “Salida estándar v1”: título, autor, fecha y créditos en pie.
•	Plantilla B – “Salida estándar v2”: pie institucional más completo (título, autor, escala, fecha, número de página y espacio para logo).

## Variables de Entorno y Parametrización

Los valores por defecto y el branding se toman de environment.exportMap (por proyecto):

   ```typescript

exportMap: {
  title?: string;                 // Título por defecto
  author?: string;                // Autor por defecto
  showGrid?: boolean;             // Grilla por defecto
  includeLegend?: boolean;        // Leyenda por defecto
  orientation?: 'vertical' | 'horizontal'; // Orientación 
  logoUrl?: string;               // Logo institucional para
}

   ```

## Limitaciones Conocidas
- La leyenda depende de la configuración y visibilidad de capas al momento de exportar.
- La calidad del logo (si se usa) depende del recurso en logoUrl (preferir alta resolución).

