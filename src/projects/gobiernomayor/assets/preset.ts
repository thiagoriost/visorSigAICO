import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

// Reutilizamos el MISMO esquema para light y dark
const gmLight = {
  surface: {
    0: '#FFFFFF',
    50: '#FCFCFA',
    100: '#F5F5F0',
    200: '#EEEDE7',
    300: '#E7E6DF',
    400: '#E0DFD7',
    500: '#F7F7CA', // marfil (ventanas/cards)
    600: '#CFCFBC',
    700: '#B1B39E',
    800: '#7D7D74',
    900: '#5A5A53',
    950: '#393934',
  },

  primary: {
    color: '{primary.400}',
    contrastColor: '#FFFFFF',
    hoverColor: '{primary.500}',
    activeColor: '{primary.600}',
  },

  highlight: {
    background: '#3A755A',
    focusBackground: '#2D8B58',
    color: '#FFFFFF',
    focusColor: '#FFFFFF',
  },

  mask: { background: 'rgba(0,0,0,0.40)', color: '{surface.200}' },

  // ===== Inputs blancos con borde gris =====
  formField: {
    background: '{surface.0}',
    disabledBackground: '{surface.100}',
    filledBackground: '{surface.0}',
    filledHoverBackground: '{surface.0}',
    filledFocusBackground: '{surface.0}',

    borderColor: '{surface.400}',
    hoverBorderColor: '{surface.400}',
    focusBorderColor: '{surface.700}',

    color: '{text.color}',
    disabledColor: '{surface.600}',
    placeholderColor: '{surface.800}',
    invalidPlaceholderColor: '{red.600}',

    floatLabelColor: '{surface.900}',
    floatLabelFocusColor: '{primary.color}',
    floatLabelActiveColor: '{surface.700}',
    floatLabelInvalidColor: '{form.field.invalid.placeholder.color}',
    iconColor: '{text.muted.color}',

    shadow: 'none',
  },

  text: {
    color: '#214829',
    hoverColor: '{primary.300}',
    mutedColor: '{surface.700}',
    hoverMutedColor: '{surface.800}',
  },

  content: {
    background: '{surface.500}',
    hoverBackground: '{surface.600}',
    borderColor: '{surface.400}',
    color: '{text.color}',
    hoverColor: '{text.hover.color}',
  },

  overlay: {
    select: {
      background: '{surface.300}',
      borderColor: 'transparent',
      color: '{text.color}',
    },
    popover: {
      background: '{surface.0}',
      borderColor: 'transparent',
      color: '{text.color}',
    },
    modal: {
      background: '{surface.0}',
      borderColor: 'transparent',
      color: '{text.color}',
    },
  },

  // ===== LISTA (Dropdown/Autocomplete/MultiSelect) =====
  list: {
    option: {
      // ⚠️ Clave: usar "focus" para hover/focus visual
      focusBackground: '{primary.500}',
      focusColor: '#FFFFFF',

      // Estados selected
      selectedBackground: '{highlight.background}',
      selectedColor: '{highlight.color}',
      selectedFocusBackground: '{primary.600}',
      selectedFocusColor: '#FFFFFF',

      // Redundancia útil (algunas versiones miran hover explícito)
      hoverBackground: '{primary.500}',
      hoverColor: '#FFFFFF',
      selectedHoverBackground: '{primary.600}',
      selectedHoverColor: '#FFFFFF',

      icon: {
        color: '{text.muted.color}',
        focusColor: '#FFFFFF', // blanco en hover/focus
        hoverColor: '#FFFFFF',
        selectedColor: '{highlight.color}',
        selectedHoverColor: '#FFFFFF',
        selectedFocusColor: '#FFFFFF',
      },
    },
    optionGroup: { background: 'transparent', color: '{text.color}' },
  },

  navigation: {
    item: {
      focusBackground: '{primary.color}',
      activeBackground: '{surface.200}',
      color: '{text.color}',
      focusColor: '{primary.contrast.color}',
      activeColor: '{text.hover.color}',
      icon: {
        color: '{text.muted.color}',
        focusColor: '{primary.contrast.color}',
        activeColor: '{text.hover.muted.color}',
      },
    },
    submenuLabel: { background: 'transparent', color: '{text.color}' },
    submenuIcon: {
      color: '{text.muted.color}',
      focusColor: '{primary.contrast.color}',
      activeColor: '{text.hover.muted.color}',
    },
  },
};

export const Preset = definePreset(Aura, {
  // ---------------------------
  // PRIMITIVE TOKENS
  // ---------------------------
  primitive: {
    borderRadius: {
      none: '0',
      xs: '5px', // requerimiento GM
      sm: '6px',
      md: '8px',
      lg: '10px',
      xl: '14px',
    },
  },

  // ---------------------------
  // SEMANTIC TOKENS
  // ---------------------------
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

    // Escala de verdes Gobierno Mayor
    primary: {
      50: '#F1F7EB',
      100: '#DAEBCB',
      200: '#B9DDA3',
      300: '#79B76A',
      400: '#53821D', // marca
      500: '#2F5E17', // hover
      600: '#214829', // active / emphasis
      700: '#183820',
      800: '#112A18',
      900: '#0B1C10',
      950: '#07130B',
    },

    formField: {
      paddingX: '0.5rem',
      paddingY: '0.5rem',
      sm: { fontSize: '0.875rem', paddingX: '0.625rem', paddingY: '0.375rem' },
      lg: { fontSize: '1.125rem', paddingX: '0.875rem', paddingY: '0.625rem' },
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

    // ⚠️ Duplicamos los tokens de lista también aquí por compatibilidad
    list: {
      padding: '0.125rem 0',
      gap: '0',
      header: { padding: '0.5rem 0.75rem 0.375rem 0.75rem' },
      option: {
        padding: '0.5rem 0.75rem',
        borderRadius: '0',

        // Misma lógica de contraste para hover/focus
        hoverBackground: '{primary.500}',
        hoverColor: '#FFFFFF',
        selectedHoverBackground: '{primary.600}',
        selectedHoverColor: '#FFFFFF',

        // También focus (teclado)
        focusBackground: '{primary.500}',
        focusColor: '#FFFFFF',
        selectedFocusBackground: '{primary.600}',
        selectedFocusColor: '#FFFFFF',
      },
      optionGroup: { padding: '0.5rem 0.75rem', fontWeight: '700' },
    },

    content: { borderRadius: '{border.radius.xs}' },

    mask: { transitionDuration: '0.15s' },

    navigation: {
      list: { padding: '0.125rem 0', gap: '0' },
      item: { padding: '0.5rem 0.75rem', borderRadius: '0', gap: '0.5rem' },
      submenuLabel: { padding: '0.5rem 0.75rem', fontWeight: '700' },
      submenuIcon: { size: '0.875rem' },
    },

    overlay: {
      select: {
        borderRadius: '{border.radius.xs}',
        shadow: '0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)',
      },
      popover: {
        borderRadius: '{border.radius.xs}',
        padding: '0.75rem',
        shadow: '0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)',
      },
      modal: {
        borderRadius: '{border.radius.xs}',
        padding: '1.25rem',
        shadow:
          '0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)',
      },
      navigation: {
        shadow: '0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)',
      },
    },

    colorScheme: {
      light: gmLight,
      dark: gmLight, // mismo esquema
    },
  },

  // ---------------------------
  // COMPONENT TOKENS
  // ---------------------------
  components: {
    button: {
      paddingX: '0.875rem',
      paddingY: '0.5rem',
      gap: '0.5rem',
      borderRadius: '{border.radius.xs}',
      focusRing: {
        width: '2px',
        style: 'solid',
        color: '{primary.color}',
        offset: '2px',
        shadow: 'none',
      },
      outlined: {
        borderColor: '{surface.400}',
        color: '{text.color}',
        hoverBorderColor: '{primary.400}',
        hoverColor: '{primary.400}',
      },
      text: {
        color: '#FFFFFF',
        hoverColor: '#FFFFFF',
      },
      sm: { paddingX: '0.5rem', paddingY: '0.375rem' },
      lg: { paddingX: '1rem', paddingY: '0.625rem' },
      iconOnly: {
        width: '48px',
        height: '48px',
        borderRadius: '{border.radius.xs}',
      },
    },

    inputswitch: {
      height: '20px',
      borderRadius: '{border.radius.xs}',
      handle: { width: '18px', height: '18px' },
      checked: {
        background: '{primary.color}',
        borderColor: '{primary.color}',
      },
    },

    slider: {
      height: '4px',
      handle: { width: '14px', height: '14px', borderRadius: '50%' },
      range: { background: '{primary.400}' },
    },

    toolbar: {
      padding: '0.25rem',
      gap: '0.5rem',
      background: '{surface.500}',
      borderColor: '{surface.400}',
      borderRadius: '{border.radius.xs}',
    },

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
          color: '{primary.color}',
          offset: '1px',
        },
      },
    },
  },
});
