import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ExportMap5WrapperComponent } from './export-map5-wrapper.component';

describe('ExportMap5WrapperComponent', () => {
  let fixture: ComponentFixture<ExportMap5WrapperComponent>;
  let component: ExportMap5WrapperComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportMap5WrapperComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportMap5WrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit y la suscripción al selector
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe iniciar oculto (isExportMapVisible=false, isDialogVisible=false)', () => {
    expect(component.isExportMapVisible).toBeFalse();
    expect(component.isDialogVisible).toBeFalse();
  });
});
