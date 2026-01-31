import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchLayerInputComponent } from './search-layer-input.component';
import { By } from '@angular/platform-browser';

describe('SearchLayerInputComponent', () => {
  let component: SearchLayerInputComponent;
  let fixture: ComponentFixture<SearchLayerInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchLayerInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchLayerInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia renderizar el placeholder "Buscar" por defecto', () => {
    const inputEl: HTMLInputElement = fixture.debugElement.query(
      By.css('input')
    ).nativeElement;
    expect(inputEl.placeholder).toBe('Buscar');
  });

  it('Deberia renderizar el placeholder cuando se proporciona', () => {
    component.placeHolder = 'Buscar capa';
    fixture.detectChanges();
    const inputEl: HTMLInputElement = fixture.debugElement.query(
      By.css('input')
    ).nativeElement;
    expect(inputEl.placeholder).toBe('Buscar capa');
  });

  it('Deberia mostra el icono con la clase "pi pi-search" por defecto', () => {
    const iconEl: HTMLElement = fixture.debugElement.query(
      By.css('p-inputIcon')
    ).nativeElement;
    expect(iconEl.classList).toContain('pi');
    expect(iconEl.classList).toContain('pi-search');
  });

  it('Deberia aplicar la clase al icono del input cuando se proporciona', () => {
    component.iconClass = 'pi pi-user';
    fixture.detectChanges();
    const iconEl: HTMLElement = fixture.debugElement.query(
      By.css('p-inputIcon')
    ).nativeElement;
    expect(iconEl.classList).toContain('pi-user');
  });

  it('Deberia ocultar el icono cuando iconInputVisible es falso', () => {
    component.iconInputVisible = false;
    fixture.detectChanges();
    const iconEl = fixture.debugElement.query(By.css('p-inputIcon'));
    expect(iconEl).toBeNull();
  });

  it('Deberia emitir el texto sin espacios en blanco cuando el input cambia', () => {
    spyOn(component.textEmitter, 'emit');
    component.text = '   prueba con espacios   ';
    component.onInputChange();
    expect(component.textEmitter.emit).toHaveBeenCalledWith(
      'prueba con espacios'
    );
  });

  it('Deberia emitir un texto vacio cuando el input tiene espacios en blanco', () => {
    spyOn(component.textEmitter, 'emit');
    component.text = '   ';
    component.onInputChange();
    expect(component.textEmitter.emit).toHaveBeenCalledWith('');
  });
});
