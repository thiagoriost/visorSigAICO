import { TestBed } from '@angular/core/testing';
import { AppThemeService } from './app-theme.service';
import { PrimeNG } from 'primeng/config';
import { Comunidades } from '@app/core/interfaces/auth/Comunidad';

interface ThemeMock {
  set: jasmine.Spy<(preset: object) => void>;
}

interface PrimeNGMock {
  theme: ThemeMock;
}

describe('AppThemeService', () => {
  let service: AppThemeService;
  let primengConfigMock: PrimeNGMock;
  const comunidadMock: Comunidades = {
    Color_Primario: '#112233',
    Color_Secundario: '#445566',
    Color_Terciario: '#778899',
    Logo: '',
    Nombre_Comunidad: '',
    Url_Tabla_Contenido: '',
  };
  beforeEach(() => {
    primengConfigMock = {
      theme: {
        set: jasmine.createSpy('set'),
      },
    };
    TestBed.configureTestingModule({
      providers: [
        AppThemeService,
        { provide: PrimeNG, useValue: primengConfigMock },
      ],
    });
    service = TestBed.inject(AppThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should build a dynamic preset with community colors', () => {
    const preset = (service as AppThemeService).buildDynamicPreset(
      comunidadMock
    );
    expect(preset).toBeDefined();
    expect(typeof preset).toBe('object');
  });
});
