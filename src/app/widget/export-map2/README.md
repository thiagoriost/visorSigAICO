# Salida Grafcia v2

## Descripción
Export Map Launcher es un componente lanzador que muestra un botón **Exportar Mapa** para abrir el diálogo de exportación. Al activarse, invoca el componente **Export Map 2** (diálogo de impresión) que permite configurar la salida y generar el PDF del mapa con previsualización y render del mapa en un contenedor oculto.

## Propósito
Centralizar el disparo de la exportación y ofrecer una experiencia guiada para generar PDFs del mapa, con:
1. Acceso rápido desde un botón único (launcher).
2. Configuración clara (título, autor, grilla, leyenda, orientación).
3. Previsualización del mapa antes de guardar y descarga inmediata del PDF.

## Flujo de Uso
1. Pulsar **Exportar Mapa** para abrir el diálogo.
2. En el diálogo, completar **Título** y **Autor**, seleccionar **Orientación** y marcar **Grilla/Leyenda** si aplica.
3. Revisar la **previsualización** (se ajusta automáticamente según la orientación).
4. Presionar **Guardar PDF** para generar y descargar el archivo.
5. Presionar **Cerrar** para salir del diálogo; el preview se desmonta para liberar recursos.

## Parámetros de Usuario
- Título (title): Encabezado del PDF. Máximo 100 caracteres. Obligatorio.
- Autor (author): Etiqueta de autor. Máximo 50 caracteres. Obligatorio.
- Mostrar grilla (showGrid): Superpone una grilla sobre el mapa (preview y exportación).
- Incluir leyenda (includeLegend): Inserta la leyenda de capas activa.
- Orientación (orientation): horizontal o vertical.
- Logo (logoUrl): URL opcional para logo institucional en el PDF (si la plantilla lo contempla).

## Variables de Entorno y Parametrización
Los valores por defecto y el branding se toman de environment.exportMap (por proyecto):

Recomendación: definir estos campos en src/projects/<proyecto>/environments/* para separar clientes/instancias.

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
- La leyenda depende de la visibilidad y configuración de capas en el momento de exportar.
- La calidad del logo depende del recurso indicado en logoUrl (usar PNG/SVG de buena resolución).
- En pantallas pequeñas, la previsualización en orientación vertical puede requerir desplazamiento.


