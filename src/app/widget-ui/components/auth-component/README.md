# Módulo de Autenticación -- Línea Negra

##  Descripción General

El módulo de autenticación **Línea Negra** permite integrar un flujo de
inicio de sesión basado en correo y contraseña utilizando Directus Auth.
Incluye componentes visuales, modal de autenticación, manejo de errores,
integración con NgRx y soporte para parametrización visual mediante
`AuthConfigInterface`.

------------------------------------------------------------------------

##  Arquitectura del Módulo

    auth-component/
    │
    ├── components/
    │   ├── auth-launcher/          # Botón o disparador del login
    │   ├── auth-container/         # Wrapper general del módulo
    │   ├── auth-login/             # Formulario de login
    │   ├── auth-login-modal/       # Modal PrimeNG para el login
    │   └── linea-negra-logos/      # Logos de comunidades
    │
    ├── services/
    │   ├── auth-http-service/      # Conexiones a Directus
    │
    └── interfaces/
        └── authConfigInterface.ts  # Parametrización completa del login


------------------------------------------------------------------------

##  Parametrización mediante `AuthConfigInterface`

| Propiedad           | Tipo      | Descripción                          |
|---------------------|-----------|--------------------------------------|
| `loginButtonText`   | `string`  | Texto del botón de login             |
| `loginButtonColor`  | `string`  | Color PrimeNG del botón              |
| `loginButtonShadow` | `boolean` | Sombra o estilo *raised*             |
| `loginButtonBorder` | `boolean` | Muestra u oculta el borde            |
| `iconUser`          | `string`  | Ícono del botón en versión móvil     |
| `title`             | `string`  | Título del modal                     |
| `subtitle`          | `string`  | Subtítulo del modal                  |
| `modalLogoUrl`      | `string`  | Logo principal del modal             |
| `backgroundImage`   | `string`  | Imagen de fondo del modal            |
| `themeColor`        | `string`  | Color principal del modal            |
| `forgotPasswordUrl` | `string`  | URL para recuperación de contraseña  |
| `showCommunities`   | `boolean` | Muestra u oculta los logos externos  |
| `customStyles`      | `any`     | Permite inyectar estilos personalizados |


------------------------------------------------------------------------

##  Cómo usarlo

### 1. **Importar en tu módulo o componente**

``` ts
import { AuthContainerComponent } from '@app/widget-ui/components/auth-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AuthContainerComponent],
  template: `<app-auth-container [config]="authConfig"></app-auth-container>`
})
export class AppComponent {
  authConfig = {
    // --- Botón de Login ---
    loginButtonText: 'Iniciar sesión',      // Texto del botón
    loginButtonColor: 'primary',            // Color PrimeNG (primary, secondary, success, warn, etc.)
    loginButtonShadow: true,                // Activa sombra estilo raised
    loginButtonBorder: false,               // Muestra u oculta el borde
    iconUser: 'pi pi-user',                 // Ícono en móviles (PrimeIcons)

    // --- Textos del modal ---
    title: 'Bienvenido',                    // Título del modal
    subtitle: 'Ingresa tus credenciales',   // Subtítulo del modal

    // --- Imágenes ---
    modalLogoUrl: 'assets/img/logo.png',    // Logo principal del modal
    backgroundImage: 'assets/img/bg.png',   // Imagen de fondo del modal

    // --- Estilos y tema ---
    themeColor: '#1a73e8',                  // Color principal del modal
    customStyles: {},                       // Estilos extra inyectables

    // --- Funciones extra ---
    forgotPasswordUrl: '/recuperar-clave',  // URL de recuperación de contraseña

    // --- Comunidades ---
    showCommunities: true                   // Mostrar/ocultar logos
  };
}
```

------------------------------------------------------------------------

### 2. **Usar el `AuthLauncherComponent`**

``` html
<app-auth-launcher [config]="authConfig"></app-auth-launcher>
```

------------------------------------------------------------------------

##  Resultado

Con esta configuración puedes integrar un flujo de autenticación
completamente adaptable al estilo del proyecto, con soporte para temas,
configuración dinámica, modal personalizable y conexión con Directus.

