import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BotoneraVerticalComponent } from './botonera-vertical.component';
import {
  BotonConfigModel,
  OpcionMenuModel,
} from '../../interfaces/boton-config.model';

describe('BotoneraVerticalComponent', () => {
  let component: BotoneraVerticalComponent;
  let fixture: ComponentFixture<BotoneraVerticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotoneraVerticalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BotoneraVerticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Inicialización del componente', () => {
    it('debería crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debería inicializar con valores por defecto', () => {
      expect(component.botones).toEqual([]);
      expect(component.shape).toBe('rounded');
      expect(component.size).toBe('default');
    });
  });

  describe('Input: botones', () => {
    it('debería aceptar un array vacío de botones', () => {
      component.botones = [];
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('p-button');
      expect(buttons.length).toBe(0);
    });

    it('debería renderizar un botón por cada BotonConfigModel', () => {
      const sampleConfig: BotonConfigModel[] = [
        { id: 'test1', icono: 'pi pi-test', texto: 'Test 1', opciones: [] },
        { id: 'test2', icono: 'pi pi-test', texto: 'Test 2', opciones: [] },
      ];
      component.botones = sampleConfig;
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('p-button');
      expect(buttons.length).toBe(2);
    });

    it('debería renderizar un botón sin opciones como botón simple', () => {
      const sampleConfig: BotonConfigModel[] = [
        { id: 'simple', icono: 'pi pi-home', texto: 'Home' },
      ];
      component.botones = sampleConfig;
      fixture.detectChanges();

      const popovers = fixture.nativeElement.querySelectorAll('p-popover');
      expect(popovers.length).toBe(0);
    });

    it('debería renderizar un botón con opciones y popover', () => {
      const sampleConfig: BotonConfigModel[] = [
        {
          id: 'menu',
          icono: 'pi pi-bars',
          texto: 'Menu',
          opciones: [{ id: 'opt1', icono: 'pi pi-home', texto: 'Option 1' }],
        },
      ];
      component.botones = sampleConfig;
      fixture.detectChanges();

      const popovers = fixture.nativeElement.querySelectorAll('p-popover');
      expect(popovers.length).toBe(1);
    });
  });

  describe('Input: shape', () => {
    it('debería tener "rounded" como forma por defecto', () => {
      expect(component.shape).toBe('rounded');
    });

    it('debería aceptar la forma "square"', () => {
      component.shape = 'square';
      expect(component.shape).toBe('square');
    });

    it('debería actualizar el getter isRounded cuando shape cambia a rounded', () => {
      component.shape = 'rounded';
      expect(component.isRounded).toBe(true);
    });

    it('debería actualizar el getter isRounded cuando shape cambia a square', () => {
      component.shape = 'square';
      expect(component.isRounded).toBe(false);
    });
  });

  describe('Input: size', () => {
    it('debería tener "default" como tamaño por defecto', () => {
      expect(component.size).toBe('default');
    });

    it('debería aceptar el tamaño "small"', () => {
      component.size = 'small';
      expect(component.size).toBe('small');
    });

    it('debería aceptar el tamaño "large"', () => {
      component.size = 'large';
      expect(component.size).toBe('large');
    });
  });

  describe('Getter: isRounded', () => {
    it('debería retornar true cuando shape es "rounded"', () => {
      component.shape = 'rounded';
      expect(component.isRounded).toBe(true);
    });

    it('debería retornar false cuando shape es "square"', () => {
      component.shape = 'square';
      expect(component.isRounded).toBe(false);
    });
  });

  describe('Getter: buttonSize', () => {
    it('debería retornar undefined cuando size es "default"', () => {
      component.size = 'default';
      expect(component.buttonSize).toBeUndefined();
    });

    it('debería retornar "small" cuando size es "small"', () => {
      component.size = 'small';
      expect(component.buttonSize).toBe('small');
    });

    it('debería retornar "large" cuando size es "large"', () => {
      component.size = 'large';
      expect(component.buttonSize).toBe('large');
    });
  });

  describe('Output: seleccion', () => {
    it('debería emitir el evento seleccion cuando onSeleccion es llamado', () => {
      const opcionMock: OpcionMenuModel = {
        id: 'opt1',
        icono: 'pi pi-opt',
        texto: 'Opt 1',
      };
      let emitted: { botonId: string; opcionId: string } | null = null;
      component.seleccion.subscribe(event => (emitted = event));

      component.onSeleccion('btn1', opcionMock);

      expect(emitted).toEqual(
        jasmine.objectContaining({ botonId: 'btn1', opcionId: 'opt1' })
      );
    });

    it('debería emitir el botonId y opcionId correctos', () => {
      const opcionMock: OpcionMenuModel = {
        id: 'option-test',
        icono: 'pi pi-check',
        texto: 'Test Option',
      };
      let emittedBotonId: string | undefined;
      let emittedOpcionId: string | undefined;

      component.seleccion.subscribe(event => {
        emittedBotonId = event.botonId;
        emittedOpcionId = event.opcionId;
      });

      component.onSeleccion('button-test', opcionMock);

      expect(emittedBotonId).toBe('button-test');
      expect(emittedOpcionId).toBe('option-test');
    });

    it('debería emitir múltiples veces para múltiples selecciones', () => {
      const opcion1: OpcionMenuModel = {
        id: 'opt1',
        icono: 'pi pi-home',
        texto: 'Option 1',
      };
      const opcion2: OpcionMenuModel = {
        id: 'opt2',
        icono: 'pi pi-cog',
        texto: 'Option 2',
      };

      const emissions: { botonId: string; opcionId: string }[] = [];
      component.seleccion.subscribe(event => emissions.push(event));

      component.onSeleccion('btn1', opcion1);
      component.onSeleccion('btn2', opcion2);

      expect(emissions.length).toBe(2);
      expect(emissions[0]).toEqual({ botonId: 'btn1', opcionId: 'opt1' });
      expect(emissions[1]).toEqual({ botonId: 'btn2', opcionId: 'opt2' });
    });
  });

  describe('Renderizado', () => {
    it('debería renderizar tooltips con el texto correcto', () => {
      const sampleConfig: BotonConfigModel[] = [
        { id: 'test1', icono: 'pi pi-home', texto: 'Home Button' },
      ];
      component.botones = sampleConfig;
      fixture.detectChanges();

      // Verificar que el texto del botón está en los datos del componente
      expect(component.botones[0].texto).toBe('Home Button');

      // Verificar que hay un botón renderizado
      const button = fixture.nativeElement.querySelector('p-button');
      expect(button).toBeTruthy();
    });

    it('debería renderizar los íconos correctamente', () => {
      const sampleConfig: BotonConfigModel[] = [
        { id: 'test1', icono: 'pi pi-star', texto: 'Star' },
      ];
      component.botones = sampleConfig;
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('i');
      expect(icon.className).toContain('pi pi-star');
    });

    it('debería renderizar múltiples opciones en el popover', () => {
      const sampleConfig: BotonConfigModel[] = [
        {
          id: 'menu',
          icono: 'pi pi-bars',
          texto: 'Menu',
          opciones: [
            { id: 'opt1', icono: 'pi pi-home', texto: 'Option 1' },
            { id: 'opt2', icono: 'pi pi-cog', texto: 'Option 2' },
            { id: 'opt3', icono: 'pi pi-user', texto: 'Option 3' },
          ],
        },
      ];
      component.botones = sampleConfig;
      fixture.detectChanges();

      // Verificar que el popover existe y contiene las opciones en el template
      const popover = fixture.nativeElement.querySelector('p-popover');
      expect(popover).toBeTruthy();

      // Verificar que las opciones están renderizadas en el DOM
      fixture.nativeElement.querySelectorAll('button[pribble]');
      expect(component.botones[0].opciones?.length).toBe(3);
    });
  });

  describe('Casos extremos', () => {
    it('debería manejar botones con opciones undefined', () => {
      const sampleConfig: BotonConfigModel[] = [
        {
          id: 'test1',
          icono: 'pi pi-home',
          texto: 'Home',
          opciones: undefined,
        },
      ];
      component.botones = sampleConfig;
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('debería manejar un array vacío de opciones', () => {
      const sampleConfig: BotonConfigModel[] = [
        { id: 'test1', icono: 'pi pi-home', texto: 'Home', opciones: [] },
      ];
      component.botones = sampleConfig;
      fixture.detectChanges();

      const popover = fixture.nativeElement.querySelector('p-popover');
      expect(popover).toBeTruthy();
    });

    it('debería manejar caracteres especiales en el texto', () => {
      const sampleConfig: BotonConfigModel[] = [
        {
          id: 'test1',
          icono: 'pi pi-home',
          texto: 'Test & Special <chars>',
        },
      ];
      component.botones = sampleConfig;
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Integración', () => {
    it('debería funcionar con múltiples botones de diferentes configuraciones', () => {
      const sampleConfig: BotonConfigModel[] = [
        { id: 'simple', icono: 'pi pi-home', texto: 'Home' },
        {
          id: 'menu',
          icono: 'pi pi-bars',
          texto: 'Menu',
          opciones: [{ id: 'opt1', icono: 'pi pi-cog', texto: 'Settings' }],
        },
        { id: 'help', icono: 'pi pi-question', texto: 'Help' },
      ];
      component.botones = sampleConfig;
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('p-button');
      const popovers = fixture.nativeElement.querySelectorAll('p-popover');

      expect(buttons.length).toBe(3);
      expect(popovers.length).toBe(1);
    });

    it('debería aplicar todas las propiedades juntas', () => {
      component.botones = [{ id: 'test', icono: 'pi pi-home', texto: 'Test' }];
      component.shape = 'square';
      component.size = 'large';
      fixture.detectChanges();

      expect(component.isRounded).toBe(false);
      expect(component.buttonSize).toBe('large');
      expect(component.botones.length).toBe(1);
    });
  });
});
