import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { directus } from './directus';
import { AuthResult, UserItem } from '@directus/sdk';
import { AuthDirectusSchema } from '@app/core/interfaces/auth/AuthStateInterface';

describe('AuthService', () => {
  let service: AuthService;

  const mockDirectusUser: UserItem<AuthDirectusSchema['users']> = {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    provider: 'local',
    status: 'active',
    last_page: '/home',
    role: 'admin',

    auth_data: {}, // DefaultType = Record<string, unknown>

    // Campos obligatorios del core Directus
    avatar: '',
    description: null,
    email_notifications: false,
    external_identifier: '',
    language: 'es',
    tags: [],
    title: null,
    location: null,
    token: null,
    last_access: null,
    password: '',
    theme: '',
    tfa_secret: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);

    // Mock de métodos de directus
    spyOn(directus.auth, 'refresh').and.resolveTo({
      access_token: 'token',
    } as unknown as AuthResult);
    spyOn(directus.auth, 'login').and.resolveTo({
      access_token: 'token',
    } as unknown as AuthResult);
    spyOn(directus.users.me, 'read').and.resolveTo(mockDirectusUser);
    spyOn(directus.auth, 'logout').and.resolveTo();
  });

  /**
   * Caso de prueba: Verifica que el servicio
   * intente refrescar el token automáticamente.
   */
  it('debe refrescar el token en tryAutologin', async () => {
    const result = await service.tryAutologin();
    expect(directus.auth.refresh).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  /**
   * Caso de prueba: Verifica que refreshToken()
   * invoque al método correcto en directus.
   */
  it('debe refrescar el token en refreshToken', async () => {
    const result = await service.refreshToken();
    expect(directus.auth.refresh).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  /**
   * Caso de prueba: Verifica que login()
   * envíe email y contraseña a directus.
   */
  it('debe iniciar sesión con email y password', async () => {
    const result = await service.login('test@test.com', '123456');
    expect(directus.auth.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: '123456',
    });
    expect(result).toBeTruthy();
  });

  /**
   * Caso de prueba: Verifica que loadUserData()
   * retorne los datos del usuario autenticado.
   */
  it('debe cargar los datos del usuario', async () => {
    const result = await service.loadUserData();
    expect(directus.users.me.read).toHaveBeenCalled();
    expect(result.first_name).toBe('John');
    expect(result.last_name).toBe('Doe');
  });

  /**
   * Caso de prueba: Verifica que logout()
   * invoque al método de cierre de sesión.
   */
  it('debe cerrar sesión', async () => {
    await service.logout();
    expect(directus.auth.logout).toHaveBeenCalled();
  });

  // =====================
  // Pruebas de los métodos Mock
  // =====================

  /**
   * Caso de prueba: loginMock exitoso cuando el email contiene "igac"
   */
  it('debe iniciar sesión Mock exitosamente si el email contiene "igac"', async () => {
    const result = await service.loginMock('usuario@igac.gov.co');

    // Verificar que las propiedades existan
    expect(result.access_token).toBeDefined();
    expect(result.refresh_token).toBeDefined();
    expect(result.expires).toBeGreaterThan(0);
  });

  /**
   * Caso de prueba: loginMock debe fallar cuando el email no contiene "igac"
   */
  it('debe rechazar sesión Mock si el email no contiene "igac"', async () => {
    await expectAsync(service.loginMock('usuario@test.com')).toBeRejectedWith(
      jasmine.objectContaining({
        errors: jasmine.arrayContaining([
          jasmine.objectContaining({
            extensions: jasmine.objectContaining({
              code: 'INVALID_CREDENTIALS',
            }),
          }),
        ]),
      })
    );
  });

  /**
   * Caso de prueba: logoutMock siempre resuelve exitosamente
   */
  it('debe cerrar sesión Mock correctamente', async () => {
    await expectAsync(service.logoutMock()).toBeResolved();
  });

  /**
   * Caso de prueba: loadUserDataMock debe retornar usuario simulado
   */
  it('debe retornar datos de usuario Mock', async () => {
    const user = await service.loadUserDataMock();
    expect(user.email).toBe('admin.dip@igac.gov.co');
    expect(user.first_name).toBe('Administrador');
    expect(user.status).toBe('active');
  });
});
