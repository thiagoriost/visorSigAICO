import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const Preset = definePreset(Aura, {
  // =========================================================
  // PRIMITIVE TOKENS
  // =========================================================
  primitive: {
    borderRadius: {
      none: '0',
      xs: '5px',
      sm: '6px',
      md: '8px',
      lg: '10px',
      xl: '14px',
    },
  },

  // =========================================================
  // SEMANTIC TOKENS
  // =========================================================
  semantic: {
    transitionDuration: '0s',
    disabledOpacity: '0.6',
    iconSize: '1.1rem',
    anchorGutter: '0',

    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.500}',
      offset: '2px',
      shadow: 'none',
    },

    // ---------------------------------------------------------
    // PALETA AISO
    // ---------------------------------------------------------
    primary: {
      50: '#E8EBF4',
      100: '#C5CDE4',
      200: '#97A5CF',
      300: '#6980BA',
      400: '#435E9E',
      500: '#223771', // Azul bandera principal
      600: '#1D3064',
      700: '#172756',
      800: '#121E45',
      900: '#0C1433',
      950: '#080E24',
    },

    secondary: {
      50: '#FFFEEA',
      100: '#FEFCB5',
      200: '#FEFA7E',
      300: '#FDF647',
      400: '#F7E829', // Amarillo principal
      500: '#E6D214',
      600: '#CBB710',
      700: '#AA970C',
      800: '#7F7108',
      900: '#4F4505',
      950: '#2C2602',
    },

    grayscale: {
      50: '#FFFFFF',
      100: '#F5F5F5',
      200: '#E0E0E0',
      300: '#C2C2C2',
      400: '#A3A3A3',
      500: '#868686',
      600: '#4F4F4F',
      700: '#1C1C1C',
      800: '#030303',
      900: '#000000',
    },

    typography: {
      fontFamily: {
        body: 'Ubuntu, sans-serif',
        heading: 'Inter, sans-serif',
      },
    },

    // ---------------------------------------------------------
    // COLOR SCHEMES
    // ---------------------------------------------------------
    colorScheme: {
      light: {
        surface: {
          0: '#FFFFFF',
          50: '#F9F9F9',
          100: '#F2F2F2',
          200: '#EAEAEA',
          300: '#D9D9D9',
          400: '#C4C4C4',
          500: '#868686',
          600: '#4F4F4F',
          700: '#1C1C1C',
          800: '#030303',
          900: '#000000',
        },

        text: {
          color: '{surface.800}',
          hoverColor: '{primary.500}',
          mutedColor: '{surface.600}',
          hoverMutedColor: '{secondary.400}',
        },

        primary: {
          color: '{surface.700}',
          contrastColor: '#FFFFFF',
          hoverColor: '{surface.600}',
          activeColor: '{surface.0}',
        },

        highlight: {
          background: '{secondary.400}',
          focusBackground: '{secondary.500}',
          color: '{primary.800}',
          focusColor: '{primary.900}',
        },

        mask: {
          background: 'rgba(0,0,0,0.35)',
          color: '{surface.200}',
        },

        formField: {
          background: '{surface.0}',
          disabledBackground: '{surface.100}',
          filledBackground: '{surface.100}',
          filledHoverBackground: '{surface.200}',
          filledFocusBackground: '{surface.0}',
          borderColor: '{primary.500}',
          hoverBorderColor: '{secondary.400}',
          focusBorderColor: '{secondary.400}',
          invalidBorderColor: '#E53935',
          color: '{surface.800}',
          disabledColor: '{surface.600}',
          placeholderColor: '{surface.500}',
          floatLabelColor: '{surface.700}',
          floatLabelFocusColor: '{primary.500}',
          floatLabelActiveColor: '{primary.700}',
          iconColor: '{primary.400}',
          shadow: 'none',
        },

        content: {
          background: '{surface.0}',
          hoverBackground: '{surface.100}',
          borderColor: '{surface.200}',
          color: '{text.color}',
          hoverColor: '{text.hoverColor}',
        },

        overlay: {
          select: {
            background: '{surface.0}',
            borderColor: '{primary.400}',
            color: '{text.color}',
          },
          popover: {
            background: '{surface.0}',
            borderColor: '{surface.200}',
            color: '{text.color}',
          },
          modal: {
            background: '{surface.0}',
            borderColor: '{surface.200}',
            color: '{text.color}',
          },
        },

        list: {
          option: {
            focusBackground: '{secondary.100}',
            selectedBackground: '{secondary.400}',
            selectedFocusBackground: '{secondary.500}',
            color: '{text.color}',
            focusColor: '{primary.800}',
            selectedColor: '{primary.900}',
            selectedFocusColor: '{primary.900}',
          },
        },

        navigation: {
          item: {
            focusBackground: '{secondary.100}',
            activeBackground: '{primary.500}',
            color: '{text.color}',
            focusColor: '{primary.contrastColor}',
            activeColor: '{secondary.400}',
            icon: {
              color: '{text.mutedColor}',
              focusColor: '{primary.contrastColor}',
              activeColor: '{secondary.400}',
            },
          },
        },
      },
    },
  },

  // =========================================================
  // COMPONENT TOKENS
  // =========================================================
  components: {
    button: {
      paddingX: '0.875rem',
      paddingY: '0.5rem',
      borderRadius: '{border.radius.none}',
      focusRing: {
        width: '2px',
        style: 'solid',
        color: '{primary.500}',
        offset: '2px',
        shadow: 'none',
      },
      outlined: {
        borderColor: '{primary.500}',
        color: '{text.color}',
        hoverBorderColor: '{secondary.400}',
        hoverColor: '{secondary.400}',
      },
      text: {
        color: '{text.mutedColor}',
        hoverColor: '{secondary.400}',
      },
    },

    inputswitch: {
      height: '20px',
      borderRadius: '{border.radius.none}',
      handle: {
        width: '18px',
        height: '18px',
      },
      checked: {
        background: '{secondary.400}',
        borderColor: '{secondary.400}',
      },
    },

    slider: {
      height: '4px',
      range: {
        background: '{primary.500}',
      },
      handle: {
        width: '14px',
        height: '14px',
        borderRadius: '0%',
        background: '{secondary.400}',
        borderColor: '{secondary.400}',
      },
    },

    toolbar: {
      padding: '0.25rem',
      gap: '0.5rem',
      background: '{surface.100}',
      borderColor: '{surface.200}',
      borderRadius: '{border.radius.none}',
    },

    paginator: {
      navButton: {
        background: '{surface.0}',
        color: '{primary.500}',
        hoverBackground: '{surface.100}',
        hoverColor: '{secondary.950}',
        focusRing: {
          width: '2px',
          style: 'solid',
          offset: '1px',
          color: '{primary.400}',
        },
      },
    },

    select: {
      root: {
        filledBackground: '{surface.0}',
        color: '{primary.500}',
        borderRadius: 'none',
      },
      overlay: {
        background: '{surface.0}',
      },
      option: {
        selectedColor: '{primary.500}',
        focusColor: '{secondary.950}',
      },
    },
  },
});
