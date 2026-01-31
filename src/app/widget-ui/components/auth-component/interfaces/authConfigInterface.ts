import { TemplateRef } from '@angular/core';

export interface AuthConfigInterface {
  textColor?: string; // Color del texto general
  // ==========================================
  // AUTH LOGIN BUTTON (botón para abrir el login)
  // ==========================================
  loginButtonText?: string; // Bordes redondeados del botón
  loginButtonColor?:
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'help'
    | 'primary'
    | 'secondary'
    | 'contrast'
    | undefined; // color del botón
  loginButtonBorder?: string; // Bordes del botón
  loginButtonShadow?: boolean; // Sombra del botón
  iconUser?: string; // Icono en el botón version mobile

  // ==========================================
  // AUTH LOGIN MODAL (modal de autenticación)
  // ==========================================
  modalLogoUrl?: string; // URL del logo
  modalButtonText?: string; // Texto del botón
  modalButtonColor?:
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'help'
    | 'primary'
    | 'secondary'
    | 'contrast'
    | undefined; // color del botón
  modalButtonBorder?: string; // Bordes del botón

  // ==========================================
  // AUTH USER PROFILE (perfil de usuario autenticado)
  // ==========================================
  avatarIcon?: string; // Icono fallback del avatar
  avatarIconColor?: string; // Color del icono fallback

  // ==========================================
  // CARD USER PROFILE (tarjeta de perfil de usuario)
  // ==========================================
  templateMain?: TemplateRef<unknown>; // Plantilla principal de la tarjeta
  templateFooter?: TemplateRef<unknown>; // Plantilla del footer de la tarjeta
  outputButtonText?: string; // Texto del botón
  outputButtonColor?:
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'help'
    | 'primary'
    | 'secondary'
    | 'contrast'
    | undefined; // color del botón// Color del botón
  outputButtonBorder?: string; // Bordes del botón
}
