import { definePreset } from '@primeng/themes';
import Nora from '@primeng/themes/nora';

/**
 * @constant Preset
 * @type {ThemePreset}
 * @description
 * Configuración personalizada del tema de **PrimeNG** utilizada por el visor geográfico **CRIC**.
 *
 * Este objeto extiende el preset base **Nora** de PrimeNG, redefiniendo variables
 * de estilo y tokens de diseño para adaptarse a la identidad visual del sistema CRIC.
 *
 * Incluye configuraciones específicas para:
 * - **Colores primarios y auxiliares**, siguiendo la paleta institucional.
 * - **Gradientes**, **fondos** y **tipografía** personalizada (Ubuntu / Inter).
 * - **Componentes visuales** como `select`, `slider`, `paginator`, `tabs`, `message`, etc.
 * - **Superficies (surface)**, **contenidos (content)**, **navegación**, y **ventanas flotantes**.
 *
 * Su propósito es garantizar una apariencia coherente y una experiencia de usuario unificada
 * en toda la interfaz del visor geográfico CRIC.
 *
 * @example
 * Cómo usar el preset en la configuración del tema de PrimeNG:
 * import { preset } from 'projects/cric/assets/preset';
 * import { definePreset } from '@primeng/themes';
 *
 * const theme = definePreset(preset);
 *
 * @see {@link https://primeng.org/theming|Documentación oficial de PrimeNG Theming}
 *
 * @date 31-10-2025
 * @version 1.0.0
 * @author
 * Carlos Muñoz — IGAC (javier.munoz@igac.gov.co)
 */
export const Preset = definePreset(Nora, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
    },
    red: {
      50: '#fef2f2', // Muy claro, casi blanco rosado
      100: '#fee2e2', // Claro
      200: '#fecaca', // Rosado claro
      300: '#fca5a5', // Más saturado
      400: '#f87171', // Intermedio
      500: '#e44241', // Principal definido en Información 1.pdf
      600: '#dc2626', // Un poco más oscuro
      700: '#b91c1c', // Oscuro
      800: '#991b1b', // Muy oscuro
      900: '#7f1d1d', // Casi vino
      950: '#450a0a', // Casi negro rojizo
    },
  },
  semantic: {
    primary: {
      50: '#edf4ec',
      100: '#cddbc9',
      200: '#aabda3',
      300: '#849e7c',
      400: '#5d7d52',
      500: '#21361c', // principal
      600: '#1a2c16',
      700: '#142311',
      800: '#0e190b',
      900: '#080f06',
    },
    // token con colores alternos
    auxiliary: {
      50: '#d2decf', //gradient leftbar-content
      100: '#768866', //gradient leftbar-content
      200: '#a4ab69',
      300: '#9cae57',
      400: '#3f693c',
      500: '#2c4121', //gradient leftbar-header
      600: '#477c2f', //gradient leftbar-header
      700: '#1a2813',
      800: '#141f0e',
      900: '#161f24',
    },
    typography: {
      fontFamily: {
        body: 'Ubuntu, sans-serif',
        heading: 'Inter, sans-serif',
      },
    },
    //Background para las ventanas flotantes
    backgroundPattern: {
      image: "url('assets/images/Motivo_Motivo.png')",
      size: '230px',
      position: 'center',
      repeat: 'repeat',
      color: '#89AA70',
      baseColor: '#ffffff',
    },
    //Estilo colo
    transitionDuration: '0s',
    disabledOpacity: '0.6',
    iconSize: '1.3rem', //Ancho de los íconos - no aplica ventanas flotantes
    anchorGutter: '0',
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.500}',
      offset: '2px',
      shadow: 'none',
    },
    formField: {
      paddingX: '1rem',
      paddingY: '1rem',
      borderRadius: 'none',
      sm: {
        fontSize: '0.875rem',
        paddingX: '0.625rem',
        paddingY: '0.375rem',
      },
      lg: {
        fontSize: '1.125rem',
        paddingX: '0.875rem',
        paddingY: '0.625rem',
      },

      focusRing: {
        width: '2px',
        style: 'solid',
        color: '{primary.color}',
        offset: '-1px',
        shadow: 'none',
      },
      transitionDuration: '{transition.duration}',
    },
    list: {
      padding: '0.125rem 0',
      gap: '0',
      header: {
        padding: '0.5rem 0.75rem 0.375rem 0.75rem',
      },
      option: {
        padding: '0.5rem 0.75rem',
        borderRadius: '0',
      },
      optionGroup: {
        padding: '0.5rem 0.75rem',
        fontWeight: '700',
      },
    },
    content: {
      borderRadius: '{border.radius.xs}',
    },
    mask: {
      transitionDuration: '0.15s',
    },
    navigation: {
      list: {
        padding: '0.125rem 0',
        gap: '0',
      },
      item: {
        padding: '0.5rem 0.75rem',
        borderRadius: '0',
        gap: '0.5rem',
      },
      submenuLabel: {
        padding: '0.5rem 0.75rem',
        fontWeight: '700',
      },
    },
    overlay: {
      select: {
        borderRadius: '{border.radius.xs}',
        shadow:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      },
      popover: {
        borderRadius: '{border.radius.xs}',
        padding: '0.75rem',
        shadow:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      },
      modal: {
        borderRadius: '{border.radius.xs}',
        padding: '1.25rem',
        shadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      navigation: {
        shadow:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      },
    },
    colorScheme: {
      light: {
        surface: {
          50: '{primary.50}',
          100: '{primary.100}',
          200: '{primary.200}',
          300: '{primary.300}',
          400: '{primary.400}',
          500: '{primary.500}',
          600: '{primary.600}',
          700: '{primary.700}',
          800: '{primary.800}',
          900: '{primary.900}',
        },
        text: {
          color: '{surface.500}',
          hoverColor: '{surface.400}',
          mutedColor: '{surface.700}',
          hoverMutedColor: '{surface.800}',
          red: {
            500: '{red.500}',
          },
        },
        primary: {
          color: '{surface.500}',
          contrastColor: '{backgroundPattern.baseColor}',
          hoverColor: '{surface.400}',
          activeColor: '{surface.600}',
        },
        highlight: {
          background: '{surface.400}', // Selección mouse
          focusBackground: '{surface.400}', // Botones
          color: '{backgroundPattern.baseColor}',
          focusColor: '{backgroundPattern.baseColor}',
        },
        mask: {
          background: '{surface.400}',
          color: '{surface.200}',
        },
        formField: {
          background: '{backgroundPattern.baseColor}', // Fondo principal del campo
          disabledBackground: '{surface.100}', // Fondo cuando está deshabilitado
          filledBackground: '{surface.100}', // Fondo en modo "filled"
          filledHoverBackground: '{surface.100}', // Fondo al hacer hover en modo "filled"
          filledFocusBackground: '{surface.100}', // Fondo al enfocar en modo "filled"
          borderColor: '{surface.400}', // Color del borde normal
          hoverBorderColor: '{surface.200}', // Color del borde al hacer hover
          focusBorderColor: '{surface.100}', // Color del borde al enfocar
          invalidBorderColor: '{red.500}', // Color del borde si es inválido
          color: '{surface.400}', // Color del texto
          disabledColor: '{surface.600}', // Sin editar: texto deshabilitado
          placeholderColor: '{surface.900}', // Color del placeholder
          invalidPlaceholderColor: '{red.500}', // Sin editar: placeholder inválido
          floatLabelColor: '{surface.900}', // Color de etiqueta flotante
          floatLabelFocusColor: '{surface.100}', // Color de etiqueta flotante al enfocar
          floatLabelActiveColor: '{surface.500}', // Color cuando ya hay texto
          floatLabelInvalidColor: '{red.500}', // Color cuando hay error
          iconColor: '{red.500}', // Color de íconos dentro del campo
          shadow: 'none', // Sin sombra alrededor del campo
        },

        content: {
          background: '{backgroundPattern.baseColor}', // Fondo principal del contenido
          hoverBackground: '{surface.600}', // Fondo al pasar el mouse
          borderColor: '{surface.400}', // Color del borde
          color: '{text.color}', // Color del texto
          hoverColor: '{text.hover.color}', // Color del texto al hacer hover
        },
        overlay: {
          select: {
            background: '{surface.300}', // Fondo del selector desplegable
            borderColor: 'transparent', // Borde del selector
            color: '{text.color}', // Texto del selector
          },
          popover: {
            background: '{backgroundPattern.baseColor}', // Fondo del popover (ej. tooltips, menús)
            borderColor: 'transparent', // Borde del popover
            color: '{text.color}', // Texto del popover
          },
          modal: {
            background: '{backgroundPattern.baseColor}', // Fondo del modal o ventana emergente
            borderColor: 'transparent', // Borde del modal
            color: '{text.color}', // Texto dentro del modal
          },
        },
        list: {
          option: {
            focusBackground: '{surface.700}', // Fondo cuando la opción está enfocada
            selectedBackground: '{highlight.background}', // Fondo cuando la opción está seleccionada
            selectedFocusBackground: '{highlight.focus.background}', // Fondo cuando está seleccionada y enfocada
            color: '{text.color}', // Color del texto de la opción
            focusColor: '{text.hover.color}', // Color del texto al enfocar
            selectedColor: '{highlight.color}', // Color del texto cuando está seleccionada
            selectedFocusColor: '{highlight.focus.color}', // Color del texto seleccionada y enfocada
            icon: {
              color: '{red.500}', // Color del ícono normal
              focusColor: '{text.hover.muted.color}', // Color del ícono al enfocar
            },
          },
          optionGroup: {
            background: 'transparent', // Fondo del grupo de opciones
            color: '{text.color}', // Color del texto del grupo
          },
        },
        navigation: {
          item: {
            focusBackground: '{surface.color}', // Fondo del ítem de navegación enfocado
            activeBackground: '{surface.200}', // Fondo del ítem activo
            color: '{text.color}', // Color del texto normal
            focusColor: '{primary.contrast.color}', // Color del texto al enfocar
            activeColor: '{text.hover.color}', // Color del texto activo
            icon: {
              color: '{red.500}', // Color del ícono normal
              focusColor: '{primary.contrast.color}', // Color del ícono al enfocar
              activeColor: '{text.hover.muted.color}', // Color del ícono activo
            },
          },
          submenuLabel: {
            background: 'transparent', // Fondo de la etiqueta del submenú
            color: '{text.color}', // Color del texto del submenú
          },
          submenuIcon: {
            color: '{text.muted.color}', // Color del ícono del submenú
            focusColor: '{primary.contrast.color}', // Color del ícono al enfocar
            activeColor: '{text.hover.muted.color}', // Color del ícono activo
          },
        },
      },
    },
  },
  components: {
    paginator: {
      navButton: {
        background: '{surface.background}',
        color: '{text.color}',
        hoverBackground: '{surface.hover.background}',
        hoverColor: '{text.hover.color}',
        selectedBackground: '{primary.background}',
        selectedColor: '{primary.color}',
        focusRing: {
          width: '2px',
          style: 'solid',
          offset: '1px',
          color: '{primary.color}',
        },
      },
    },
    slider: {
      track: {
        background: '{red.200}', // barra vacía (más clarita para contraste)
        borderRadius: '20px',
      },
      range: {
        background: '{red.500}', // barra llena
        borderRadius: '20px',
      },
      handle: {
        background: '{red.500}', // color del botón
        hoverBackground: '{red.500}',
        borderColor: '{red.500}', // borde del handle
        content: {
          background: '{red.500}',
          hoverBackground: '{red.500}',
        },
        focusRing: {
          width: '0',
          style: 'none',
          color: 'transparent',
          offset: '0',
          shadow: 'none',
        },
      },
    },
    select: {
      root: {
        filledBackground: '{backgroundPattern.baseColor}', // Fondo del select cuando está en modo "filled"
        color: '{primary.500}', // Color del texto
        borderRadius: 'none', //Borde del texto
      },
      overlay: {
        background: '{primary.200}', // Fondo  del menú desplegable
      },
      dropdown: {
        color: '{red.500}',
        borderRadius: '50px',
      },
      option: {
        selectedColor: '{primary.500}', // color del texto cuando la opción está seleccionada
        focusColor: '{backgroundPattern.baseColor}', //  Color cuando se hace hover o focus
      },
    },
    autocomplete: {
      dropdown: {
        borderRadius: '50px', // esquinas derechas
        borderLeft: 'none', // quita línea divisoria
        color: '{red.500}',
      },
      option: {
        color: '{primary.50}', // Texto de opciones
        padding: '0.5rem 1rem',
      },
      chip: {
        borderRadius: 'none',
      },
      list: {
        padding: 'none',
      },
    },
    tabs: {
      tablist: {
        background: 'transparent', //fonde de la barra donde se alojan los tabs
      },
      tabpanel: {
        background: '{transparent}', // Fondo del contenido de las pestañas
        // color: '{backgroundPattern.color}', // Color del texto en mobile-floating-tab
      },
      tab: {
        background: 'transparent', // Fondo normal del tab seleccionado
        hoverBackground: 'transparent', // Fondo cuando se pasas el mouse por el tab
        activeBackground: 'transparent', // Fondo del nombre del tab cuando está activo
      },
    },
    speeddial: {
      root: {
        gap: '0.25rem',
      },
    },
    message: {
      text: {
        fontWeight: '400', // sin negrita (normal)
      },
    },
  },
});
