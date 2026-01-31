# Salida Gráfica v3

## Descripción
`Salida Gráfica v3` es un widget que exporta el mapa a PDF desde el visor geográfico. Presenta un formulario compacto (título, autor, grilla, leyenda, orientación) y una bandeja de trabajos con barra de progreso y enlaces de descarga. El mapa se renderiza temporalmente en un contenedor off-screen para no afectar la vista del usuario.

## Propósito
Proveer una salida PDF simple y robusta para mapas, con:
1. Parámetros de exportación claros y validación básica.
2. Progreso visible durante la generación del documento.
3. Limpieza de descargas (revocar blobs) para evitar fugas de memoria y mantener la UI ordenada.

## Flujo de Uso
1. Completar Título, Autor, elegir Orientación y marcar Grilla/Leyenda si aplica.
2. Pulsar Imprimir para iniciar la exportación.
3. Revisar la lista de Resultados: cada trabajo muestra progreso y el enlace de descarga al finalizar.
4. Usar Borrar descargas para eliminar resultados finalizados (revoca URLs blob y detiene timers).

## Parámetros de Usuario
- Título (title): Encabezado del PDF. Máximo recomendado 100 caracteres.
- Autor (author): Etiqueta de autor. Máximo recomendado 50 caracteres.
- Mostrar grilla (showGrid): Superpone grilla sobre el mapa antes de exportar.
- Incluir leyenda (includeLegend): Inserta la leyenda de capas activa.
- Orientación (orientation): vertical u horizontal.

## Variables de Entorno y Parametrización
Los valores por defecto y el branding se toman de environment.exportMap (por proyecto):

Recomendación: definir estos campos en los environments del proyecto (por ejemplo, src/projects/gobiernomayor/environments/*) para separar clientes/instancias.

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

