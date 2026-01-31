import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeneratorComponent } from './generator.component';
import { BotonConfigModel } from '../../interfaces/boton-config.model';
import { By } from '@angular/platform-browser';

describe('GeneratorComponent', () => {
  let component: GeneratorComponent;
  let fixture: ComponentFixture<GeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneratorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize jsonControl with the example JSON', () => {
    const value = component.jsonControl.value;
    expect(typeof value).toBe('string');
    expect(value).toContain('"herramientas"');
    expect(value).toContain('"consulta"');
  });

  it('should parse valid JSON and populate botones', () => {
    const testArray: BotonConfigModel[] = [
      { id: 'a', icono: 'pi pi-a', texto: 'A', opciones: [] },
      { id: 'b', icono: 'pi pi-b', texto: 'B', opciones: [] },
    ];
    const testJson = JSON.stringify(testArray);
    component.jsonControl.setValue(testJson);
    component.generate();
    expect(component.errorMsg).toBeNull();
    expect(component.botones.length).toBe(2);
    expect(component.botones[0].id).toBe('a');
    expect(component.botones[1].id).toBe('b');
  });

  it('should set errorMsg and clear botones on invalid JSON', () => {
    component.jsonControl.setValue('invalid json');
    component.generate();
    expect(component.botones.length).toBe(0);
    expect(component.errorMsg).toBeTruthy();
  });

  it('should apply .invalid class to textarea when JSON is invalid', () => {
    component.jsonControl.setValue('not a json');
    component.generate();
    fixture.detectChanges();
    const textarea = fixture.debugElement.query(
      By.css('textarea')
    ).nativeElement;
    expect(textarea.classList).toContain('invalid');
  });

  it('should not apply .invalid class to textarea when JSON is valid', () => {
    const validArray: BotonConfigModel[] = [
      { id: 'x', icono: '', texto: '', opciones: [] },
    ];
    const validJson = JSON.stringify(validArray);
    component.jsonControl.setValue(validJson);
    component.generate();
    fixture.detectChanges();
    const textarea = fixture.debugElement.query(
      By.css('textarea')
    ).nativeElement;
    expect(textarea.classList).not.toContain('invalid');
  });
});
