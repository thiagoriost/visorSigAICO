import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const BasePreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
    },
  },
  semantic: {
    transitionDuration: '0s',
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.color}',
      offset: '2px',
      shadow: 'none',
    },
    disabledOpacity: '0.6',
    iconSize: '1rem',
    anchorGutter: '0',
    primary: {
      50: '#f4f4f3',
      100: '#c3c9c5',
      200: '#a89f98',
      300: '#81746a',
      400: '#5b4a3d',
      500: '#341f0f',
      600: '#2c1a0d',
      700: '#24160b',
      800: '#1d1108',
      900: '#150c06',
      950: '#0d0804',
    },
    secondary: {
      0: '#FFFFFF',
      50: '#fdf7f6',
      100: '#f5d9d3',
      200: '#edbbb0',
      300: '#e69c8e',
      400: '#de7e6b',
      500: '#d66048',
      600: '#b6523d',
      700: '#964332',
      800: '#763528',
      900: '#56261d',
      950: '#361812',
    },

    text: {
      color: '#000000',
      secondary: '#d66048',
    },
    formField: {
      paddingX: '0.5rem',
      paddingY: '0.5rem',
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
      borderRadius: '{border.radius.xs}',
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
      submenuIcon: {
        size: '0.875rem',
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
          0: '#FFFFFF',
          50: '#F8F8F8',
          100: '#DCDCDC',
          200: '#C1C1C1',
          300: '#A6A6A6',
          400: '#8A8A8A',
          500: '#6F6F6F',
          600: '#5E5E5E',
          700: '#4E4E4E',
          800: '#3D3D3D',
          900: '#2C2C2C',
          950: '#1C1C1C',
        },
        highlight: {
          background: '{secondary.400}',
          focusBackground: '{secondary.400}',
          color: '{primary.800}',
          focusColor: '{primary.900}',
        },
        mask: {
          background: 'rgba(0,0,0,0.4)',
          color: '{surface.200}',
        },
        formField: {
          background: '{surface.0}', // Fondo principal del campo
          disabledBackground: '{surface.100}', // Fondo cuando está deshabilitado
          filledBackground: '{surface.100}', // Fondo en modo "filled"
          filledHoverBackground: '{primary.100}', // Fondo al hacer hover en modo "filled"
          filledFocusBackground: '{primary.100}', // Fondo al enfocar en modo "filled"
          borderColor: '{primary.400}', // Color del borde normal
          hoverBorderColor: '{primary.200}', // Color del borde al hacer hover
          focusBorderColor: '{surface.100}', // Color del borde al enfocar
          invalidBorderColor: '{red.500}', // Color del borde si es inválido
          color: '#000000', // Color del texto
          disabledColor: '{surface.600}', // Sin editar: texto deshabilitado
          placeholderColor: '{surface.900}', // Color del placeholder
          invalidPlaceholderColor: '{red.600}', // Sin editar: placeholder inválido
          floatLabelColor: '{surface.900}', // Color de etiqueta flotante
          floatLabelFocusColor: '{primary.color}', // Color de etiqueta flotante al enfocar
          floatLabelActiveColor: '{surface.600}', // Color cuando ya hay texto
          floatLabelInvalidColor: '{form.field.invalid.placeholder.color}', // Color cuando hay error
          iconColor: '{primary.400}', // Color de íconos dentro del campo
          shadow: 'none', // Sin sombra alrededor del campo
        },
        text: {
          color: '#000010', // Color del texto principal
          hoverColor: '#000000', // Color al hacer hover
          mutedColor: '{surface.600}', // Color de texto atenuado
          hoverMutedColor: '{surface.700}', // Hover en texto atenuado
        },
        content: {
          background: '#FFFFFF', // Fondo principal del contenido
          hoverBackground: '{surface.600}', // Fondo al pasar el mouse
          borderColor: '{surface.400}', // Color del borde
          color: '{text.color}', // Color del texto
          hoverColor: '{text.hover.color}', // Color del texto al hacer hover
        },
        overlay: {
          select: {
            background: '{surface.0}', // Fondo del selector desplegable
            borderColor: '{surface.300}', // Borde del selector
            color: '#000000', // Texto del selector
          },
          popover: {
            background: '{surface.0}', // Fondo del popover (ej. tooltips, menús)
            borderColor: 'transparent', // Borde del popover
            color: '{text.color}', // Texto del popover
          },
          modal: {
            background: '{surface.0}', // Fondo del modal o ventana emergente
            borderColor: 'transparent', // Borde del modal
            color: '{text.color}', // Texto dentro del modal
          },
        },
        list: {
          option: {
            focusBackground: '{surface.700}', // Fondo cuando la opción está enfocada
            selectedBackground: '{highlight.background}', // Fondo cuando la opción está seleccionada
            selectedFocusBackground: '{highlight.focus.background}', // Fondo cuando está seleccionada y enfocada
            color: '#000000', // Color del texto de la opción
            focusColor: '#000000', // Color del texto al enfocar
            selectedColor: '#000000', // Color del texto cuando está seleccionada
            selectedFocusColor: '#000000', // Color del texto seleccionada y enfocada
            icon: {
              color: '{text.muted.color}', // Color del ícono normal
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
            focusBackground: '{primary.color}', // Fondo del ítem de navegación enfocado
            activeBackground: '{surface.200}', // Fondo del ítem activo
            color: '{text.color}', // Color del texto normal
            focusColor: '{primary.contrast.color}', // Color del texto al enfocar
            activeColor: '{text.hover.color}', // Color del texto activo
            icon: {
              color: '{text.muted.color}', // Color del ícono normal
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
      // Botones de navegación (primero, previo, siguiente, último)
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
          color: '{primary.color}',
          offset: '1px',
        },
      },
    },
  },
});
